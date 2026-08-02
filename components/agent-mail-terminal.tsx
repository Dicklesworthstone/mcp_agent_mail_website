"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  loadDashboardArtifacts,
  type DashboardRunnerInstance,
  type DashboardRunnerStatus,
  type FrankenTermInstance,
} from "@/lib/agent-mail-wasm";

export interface AgentMailTerminalHandle {
  focus(): void;
  refit(): void;
  reset(): void;
  setPaused(paused: boolean): void;
}

interface AgentMailTerminalProps {
  paused: boolean;
  reducedMotion: boolean;
  onError?(error: Error): void;
  onReady?(status: DashboardRunnerStatus): void;
  onStatus?(status: DashboardRunnerStatus): void;
}

type LoadState = "loading" | "running" | "error";

const POSTER_URL = "/images/agent-mail-dashboard-poster-placeholder.svg";
const DEFAULT_TERMINAL_ZOOM = 0.68;
const MAX_DEVICE_PIXEL_RATIO = 3;

function rendererDpr(): number {
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DEVICE_PIXEL_RATIO);
}

function releaseRunner(runner: DashboardRunnerInstance | null): void {
  if (!runner) return;
  try { runner.destroy(); } catch { /* already destroyed */ }
  try { runner.free(); } catch { /* already freed */ }
}

function releaseTerminal(term: FrankenTermInstance | null): void {
  if (!term) return;
  try { term.destroy(); } catch { /* already destroyed */ }
  try { term.free(); } catch { /* already freed */ }
}

function announcementText(term: FrankenTermInstance): string | null {
  const messages = term.drainAccessibilityAnnouncements()
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (typeof entry !== "object" || entry === null) return null;
      if ("message" in entry && typeof entry.message === "string") return entry.message;
      if ("text" in entry && typeof entry.text === "string") return entry.text;
      return null;
    })
    .filter((entry): entry is string => Boolean(entry?.trim()));
  return messages.length > 0 ? messages.slice(-3).join(". ") : null;
}

function inputModifiers(event: Pick<KeyboardEvent | MouseEvent, "shiftKey" | "altKey" | "ctrlKey" | "metaKey">) {
  return (event.shiftKey ? 1 : 0) |
    (event.altKey ? 2 : 0) |
    (event.ctrlKey ? 4 : 0) |
    (event.metaKey ? 8 : 0);
}

function parseStatus(runner: DashboardRunnerInstance): DashboardRunnerStatus {
  const value: unknown = JSON.parse(runner.statusJson());
  if (typeof value !== "object" || value === null || !("frame_index" in value)) {
    throw new Error("Agent Mail dashboard runner returned an invalid status snapshot");
  }
  return value as DashboardRunnerStatus;
}

const AgentMailTerminal = forwardRef<AgentMailTerminalHandle, AgentMailTerminalProps>(
  function AgentMailTerminal({ paused, reducedMotion, onError, onReady, onStatus }, ref) {
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [loadingLabel, setLoadingLabel] = useState("Preparing the dashboard runtime…");
    const [error, setError] = useState<Error | null>(null);
    const [screenReaderText, setScreenReaderText] = useState(
      "Agent Mail dashboard is loading. The interactive terminal supports arrow keys, j and k navigation, number keys, slash search, Enter, and Escape.",
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const termRef = useRef<FrankenTermInstance | null>(null);
    const runnerRef = useRef<DashboardRunnerInstance | null>(null);
    const frameRef = useRef(0);
    const lastFrameAtRef = useRef(0);
    const statusAtRef = useRef(0);
    const refitRef = useRef<() => void>(() => undefined);
    const initializedRef = useRef(false);
    const visibleRef = useRef(true);
    const pausedRef = useRef(paused || reducedMotion);
    const reducedMotionRef = useRef(reducedMotion);
    const callbacksRef = useRef({ onError, onReady, onStatus });

    useEffect(() => {
      callbacksRef.current = { onError, onReady, onStatus };
    }, [onError, onReady, onStatus]);

    const cleanup = useCallback(() => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastFrameAtRef.current = 0;
      const runner = runnerRef.current;
      const term = termRef.current;
      runnerRef.current = null;
      termRef.current = null;
      refitRef.current = () => undefined;
      releaseRunner(runner);
      releaseTerminal(term);
      initializedRef.current = false;
    }, []);

    useImperativeHandle(ref, () => ({
      focus() {
        canvasRef.current?.focus();
      },
      refit() {
        refitRef.current();
      },
      reset() {
        const runner = runnerRef.current;
        if (!runner) return;
        runner.reset();
        const status = parseStatus(runner);
        callbacksRef.current.onStatus?.(status);
      },
      setPaused(nextPaused: boolean) {
        pausedRef.current = nextPaused || reducedMotionRef.current;
        runnerRef.current?.setPaused(pausedRef.current);
      },
    }), []);

    useEffect(() => {
      pausedRef.current = paused || reducedMotion;
      reducedMotionRef.current = reducedMotion;
      const runner = runnerRef.current;
      const term = termRef.current;
      if (!runner) return;
      runner.setReducedMotion(reducedMotion);
      runner.setPaused(pausedRef.current);
      term?.setAccessibility({ reducedMotion, screenReader: true });
      const status = parseStatus(runner);
      callbacksRef.current.onStatus?.(status);
    }, [paused, reducedMotion]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      if (typeof IntersectionObserver === "undefined") {
        visibleRef.current = true;
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = entry?.isIntersecting ?? true;
        },
        { rootMargin: "300px" },
      );
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      let cancelled = false;
      let resizeObserver: ResizeObserver | null = null;
      let inputController: AbortController | null = null;
      let initializingTerm: FrankenTermInstance | null = null;

      const failRuntime = (cause: unknown) => {
        resizeObserver?.disconnect();
        resizeObserver = null;
        inputController?.abort();
        inputController = null;
        cleanup();
        const nextError = cause instanceof Error ? cause : new Error(String(cause));
        setError(nextError);
        setLoadState("error");
        callbacksRef.current.onError?.(nextError);
      };

      async function initialize() {
        try {
          setLoadingLabel("Verifying WASM, renderer, font, and public data pack…");
          const loaded = await loadDashboardArtifacts();
          if (cancelled) return;

          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (!canvas || !container) throw new Error("Dashboard canvas is not available");

          setLoadingLabel("Starting the production FrankenTUI dashboard…");
          const term = new loaded.FrankenTermWeb();
          initializingTerm = term;
          const dpr = rendererDpr();
          await term.init(canvas, {
            cols: 220,
            rows: 48,
            cellWidth: 8,
            cellHeight: 16,
            dpr,
            focused: false,
          });
          if (cancelled) {
            releaseTerminal(term);
            initializingTerm = null;
            return;
          }
          term.setZoom(DEFAULT_TERMINAL_ZOOM);
          termRef.current = term;
          initializingTerm = null;
          term.setAccessibility({ reducedMotion: reducedMotionRef.current, screenReader: true });

          let geometry = term.fitToContainer(
            Math.max(container.clientWidth, 320),
            Math.max(container.clientHeight, 300),
            dpr,
          );
          let cols = Math.max(1, geometry.cols);
          let rows = Math.max(1, geometry.rows);
          container.dataset.terminalCols = String(cols);
          container.dataset.terminalRows = String(rows);

          const runner = new loaded.AgentMailDashboardRunner(cols, rows);
          runnerRef.current = runner;
          runner.loadDemoPack(loaded.packJson);
          runner.setReducedMotion(reducedMotionRef.current);
          runner.setPaused(pausedRef.current);
          runner.init();

          const initialPatches = runner.takeFlatPatches();
          if (initialPatches.cells.length > 0) {
            term.applyPatchBatchFlat(initialPatches.spans, initialPatches.cells);
          }
          term.render();

          const initialStatus = parseStatus(runner);
          setScreenReaderText(`Agent Mail dashboard ready at ${cols} columns by ${rows} rows.`);
          setLoadState("running");
          callbacksRef.current.onReady?.(initialStatus);
          callbacksRef.current.onStatus?.(initialStatus);

          function frame(timestamp: number) {
            if (cancelled) return;
            const currentRunner = runnerRef.current;
            const currentTerm = termRef.current;
            if (!currentRunner || !currentTerm) return;

            try {
              if (visibleRef.current && !document.hidden) {
                const elapsed = lastFrameAtRef.current === 0 ? 100 : timestamp - lastFrameAtRef.current;
                // The native dashboard's logical tick is 100 ms. Matching it in
                // the browser avoids burning a full TUI render at display refresh rate.
                if (elapsed >= 100) {
                  lastFrameAtRef.current = timestamp;
                  currentRunner.advanceTime(Math.min(elapsed, 250));
                  for (const encoded of currentTerm.drainEncodedInputs()) {
                    if (typeof encoded === "string") currentRunner.pushEncodedInput(encoded);
                  }
                  const result = currentRunner.step();
                  if (result.rendered) {
                    const patches = currentRunner.takeFlatPatches();
                    if (patches.cells.length > 0) {
                      currentTerm.applyPatchBatchFlat(patches.spans, patches.cells);
                    }
                    currentTerm.render();
                  }
                  if (timestamp - statusAtRef.current >= 750) {
                    statusAtRef.current = timestamp;
                    const status = parseStatus(currentRunner);
                    callbacksRef.current.onStatus?.(status);
                    const announcement = announcementText(currentTerm);
                    if (announcement) setScreenReaderText(announcement);
                  }
                }
              } else {
                lastFrameAtRef.current = 0;
              }
            } catch (cause) {
              failRuntime(cause);
              return;
            }
            frameRef.current = requestAnimationFrame(frame);
          }
          frameRef.current = requestAnimationFrame(frame);

          const refit = () => {
            try {
              const currentTerm = termRef.current;
              const currentRunner = runnerRef.current;
              const currentContainer = containerRef.current;
              if (!currentTerm || !currentRunner || !currentContainer) return;
              const currentDpr = rendererDpr();
              geometry = currentTerm.fitToContainer(
                Math.max(currentContainer.clientWidth, 1),
                Math.max(currentContainer.clientHeight, 1),
                currentDpr,
              );
              const nextCols = Math.max(1, geometry.cols);
              const nextRows = Math.max(1, geometry.rows);
              currentContainer.dataset.terminalCols = String(nextCols);
              currentContainer.dataset.terminalRows = String(nextRows);
              if (nextCols !== cols || nextRows !== rows) {
                cols = nextCols;
                rows = nextRows;
                currentRunner.resize(cols, rows);
                const result = currentRunner.step();
                if (result.rendered) {
                  const patches = currentRunner.takeFlatPatches();
                  if (patches.cells.length > 0) {
                    currentTerm.applyPatchBatchFlat(patches.spans, patches.cells);
                  }
                }
              }
              currentTerm.render();
            } catch (cause) {
              failRuntime(cause);
            }
          };
          refitRef.current = refit;
          resizeObserver = new ResizeObserver(refit);
          resizeObserver.observe(container);

          inputController = new AbortController();
          const signal = inputController.signal;
          const safeInput = (value: unknown) => {
            try { termRef.current?.input(value); } catch { /* malformed browser event is ignored */ }
          };
          const cellPoint = (event: MouseEvent | WheelEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(((event.clientX - rect.left) / Math.max(rect.width, 1)) * cols);
            const y = Math.floor(((event.clientY - rect.top) / Math.max(rect.height, 1)) * rows);
            return {
              x: Math.max(0, Math.min(x, cols - 1)),
              y: Math.max(0, Math.min(y, rows - 1)),
            };
          };

          canvas.addEventListener("keydown", (event) => {
            if (event.isComposing || event.key === "Process") return;
            if (event.key === "Tab") return;
            event.preventDefault();
            safeInput({
              kind: "key",
              phase: "down",
              key: event.key,
              code: event.code,
              mods: inputModifiers(event),
              repeat: event.repeat,
            });
          }, { signal, capture: true });
          canvas.addEventListener("keyup", (event) => {
            if (event.isComposing || event.key === "Process") return;
            if (event.key === "Tab") return;
            event.preventDefault();
            safeInput({
              kind: "key",
              phase: "up",
              key: event.key,
              code: event.code,
              mods: inputModifiers(event),
              repeat: event.repeat,
            });
          }, { signal, capture: true });
          canvas.addEventListener("mousedown", (event) => {
            event.preventDefault();
            canvas.focus();
            safeInput({ kind: "mouse", phase: "down", button: event.button, ...cellPoint(event), mods: inputModifiers(event) });
          }, { signal });
          canvas.addEventListener("mouseup", (event) => {
            safeInput({ kind: "mouse", phase: "up", button: event.button, ...cellPoint(event), mods: inputModifiers(event) });
          }, { signal });
          canvas.addEventListener("mousemove", (event) => {
            safeInput({
              kind: "mouse",
              phase: event.buttons ? "drag" : "move",
              button: event.buttons ? 0 : event.button,
              ...cellPoint(event),
              mods: inputModifiers(event),
            });
          }, { signal });
          canvas.addEventListener("wheel", (event) => {
            event.preventDefault();
            safeInput({
              kind: "wheel",
              ...cellPoint(event),
              dx: Math.sign(event.deltaX),
              dy: Math.sign(event.deltaY),
              mods: inputModifiers(event),
            });
          }, { signal, passive: false });
          canvas.addEventListener("focus", () => safeInput({ kind: "focus", focused: true }), { signal });
          canvas.addEventListener("blur", () => safeInput({ kind: "focus", focused: false }), { signal });
          canvas.addEventListener("contextmenu", (event) => event.preventDefault(), { signal });
        } catch (cause) {
          releaseTerminal(initializingTerm);
          initializingTerm = null;
          if (cancelled) return;
          failRuntime(cause);
        }
      }

      void initialize();
      return () => {
        cancelled = true;
        resizeObserver?.disconnect();
        inputController?.abort();
        cleanup();
      };
    }, [cleanup]);

    const showCanvas = loadState === "running";

    return (
      <div
        ref={containerRef}
        data-testid="hero-agent-mail-terminal"
        className="relative h-full min-h-[390px] w-full overflow-hidden bg-[#020611] sm:min-h-[500px] lg:min-h-[620px]"
        role="region"
        aria-label="Interactive Agent Mail FrankenTUI dashboard"
        aria-describedby="agent-mail-terminal-help agent-mail-terminal-screen-reader"
      >
        <canvas
          ref={canvasRef}
          data-testid="hero-agent-mail-canvas"
          tabIndex={0}
          aria-label="Agent Mail terminal. Focus, then use arrow keys or j and k to navigate."
          className={`h-full w-full touch-none select-none outline-none ring-inset focus-visible:ring-2 focus-visible:ring-cyan-300 ${showCanvas ? "block" : "invisible"}`}
          style={{ imageRendering: "auto" }}
        />

        {!showCanvas && (
          <div className="absolute inset-0 grid place-items-center bg-[#020611]">
            <Image
              src={POSTER_URL}
              alt="Preview of the Agent Mail operations dashboard"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
              width={1920}
              height={1080}
              sizes="(max-width: 768px) 100vw, 70vw"
            />
            <div className="relative mx-6 max-w-md rounded-xl border border-cyan-400/20 bg-slate-950/90 px-5 py-4 text-center font-mono text-xs text-slate-300 shadow-2xl">
              {loadState === "error" ? (
                <>
                  <p className="font-bold text-rose-300">Interactive dashboard unavailable</p>
                  <p className="mt-2 text-slate-400">{error?.message ?? "The browser renderer could not start."}</p>
                  <p className="mt-2 text-[10px] text-slate-500">The static preview remains available; no private data was requested.</p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-3 h-1 w-44 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 motion-reduce:animate-none" />
                  </div>
                  <p>{loadingLabel}</p>
                </>
              )}
            </div>
          </div>
        )}

        <p id="agent-mail-terminal-help" className="sr-only">
          This is the real Agent Mail DashboardScreen compiled to WebAssembly and rendered by FrankenTUI. It replays a privacy-checked public pack. Use arrow keys, j and k, slash, Enter, Escape, and the number keys shown in the terminal.
        </p>
        <pre id="agent-mail-terminal-screen-reader" className="sr-only" aria-live="polite" aria-atomic="true">
          {screenReaderText}
        </pre>
        <noscript>
          <Image src={POSTER_URL} alt="Agent Mail operations dashboard preview" width={1920} height={1080} />
        </noscript>
      </div>
    );
  },
);

export default AgentMailTerminal;
