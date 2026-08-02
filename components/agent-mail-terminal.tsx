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
  zoom?: number;
  onError?(error: Error): void;
  onReady?(status: DashboardRunnerStatus): void;
  onStatus?(status: DashboardRunnerStatus): void;
}

type LoadState = "loading" | "running" | "error";

const POSTER_URL = "/images/agent-mail-dashboard-poster-placeholder.svg";
const DEFAULT_TERMINAL_ZOOM = 0.75;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_BACKING_PIXELS = 8_500_000;

function rendererDpr(widthCss: number, heightCss: number): number {
  const deviceDpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DEVICE_PIXEL_RATIO);
  const cssPixels = Math.max(widthCss, 1) * Math.max(heightCss, 1);
  const budgetDpr = Math.sqrt(MAX_BACKING_PIXELS / cssPixels);
  return Math.max(1, Math.min(deviceDpr, budgetDpr));
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
  function AgentMailTerminal({ paused, reducedMotion, zoom = DEFAULT_TERMINAL_ZOOM, onError, onReady, onStatus }, ref) {
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
    const zoomRef = useRef(zoom);
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
        const container = containerRef.current;
        if (container) {
          container.dataset.activeScreen = status.active_screen;
          container.dataset.dashboardFilter = status.dashboard_filter;
          container.dataset.interactionRevision = String(status.interaction_revision);
        }
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
      zoomRef.current = zoom;
      const term = termRef.current;
      if (!term) return;
      term.setZoom(zoom);
      refitRef.current();
    }, [zoom]);

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
      let pendingPointerMove: unknown | null = null;

      const failRuntime = (cause: unknown) => {
        resizeObserver?.disconnect();
        resizeObserver = null;
        inputController?.abort();
        inputController = null;
        const currentContainer = containerRef.current;
        if (currentContainer) {
          currentContainer.dataset.activeScreen = "error";
          currentContainer.dataset.dashboardFilter = "error";
          currentContainer.dataset.interactionRevision = "error";
        }
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
          const initialWidth = Math.max(container.clientWidth, 320);
          const initialHeight = Math.max(container.clientHeight, 300);
          const dpr = rendererDpr(initialWidth, initialHeight);
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
          term.setZoom(zoomRef.current);
          termRef.current = term;
          initializingTerm = null;
          term.setAccessibility({ reducedMotion: reducedMotionRef.current, screenReader: true });

          let geometry = term.fitToContainer(
            initialWidth,
            initialHeight,
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
          container.dataset.activeScreen = initialStatus.active_screen;
          container.dataset.dashboardFilter = initialStatus.dashboard_filter;
          container.dataset.interactionRevision = String(initialStatus.interaction_revision);
          callbacksRef.current.onReady?.(initialStatus);
          callbacksRef.current.onStatus?.(initialStatus);

          const publishStatus = () => {
            const status = parseStatus(runner);
            container.dataset.activeScreen = status.active_screen;
            container.dataset.dashboardFilter = status.dashboard_filter;
            container.dataset.interactionRevision = String(status.interaction_revision);
            container.dataset.statusPublishedAt = String(performance.now());
            callbacksRef.current.onStatus?.(status);
            const announcement = announcementText(term);
            if (announcement) setScreenReaderText(announcement);
          };

          function frame(timestamp: number) {
            if (cancelled) return;
            const currentRunner = runnerRef.current;
            const currentTerm = termRef.current;
            if (!currentRunner || !currentTerm) return;

            try {
              if (visibleRef.current && !document.hidden) {
                if (pendingPointerMove !== null) {
                  currentTerm.input(pendingPointerMove);
                  pendingPointerMove = null;
                }
                let inputProcessed = false;
                for (const encoded of currentTerm.drainEncodedInputs()) {
                  if (typeof encoded === "string" && currentRunner.pushEncodedInput(encoded)) {
                    inputProcessed = true;
                  }
                }
                const elapsed = lastFrameAtRef.current === 0 ? 100 : timestamp - lastFrameAtRef.current;
                const replayDue = elapsed >= 100;
                if (replayDue) {
                  lastFrameAtRef.current = timestamp;
                  currentRunner.advanceTime(Math.min(elapsed, 250));
                }
                if (inputProcessed || replayDue) {
                  const result = currentRunner.step();
                  if (result.rendered) {
                    const patches = currentRunner.takeFlatPatches();
                    if (patches.cells.length > 0) {
                      currentTerm.applyPatchBatchFlat(patches.spans, patches.cells);
                      currentTerm.render();
                    }
                  }
                  if (inputProcessed || timestamp - statusAtRef.current >= 750) {
                    statusAtRef.current = timestamp;
                    publishStatus();
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
              const width = Math.max(currentContainer.clientWidth, 1);
              const height = Math.max(currentContainer.clientHeight, 1);
              const currentDpr = rendererDpr(width, height);
              geometry = currentTerm.fitToContainer(
                width,
                height,
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
          const safeInput = (value: unknown, coalescePointerMove = false) => {
            if (coalescePointerMove) {
              pendingPointerMove = value;
              return;
            }
            try {
              const currentTerm = termRef.current;
              if (pendingPointerMove !== null) {
                currentTerm?.input(pendingPointerMove);
                pendingPointerMove = null;
              }
              currentTerm?.input(value);
            } catch { /* malformed browser event is ignored */ }
          };
          const cellPoint = (event: PointerEvent | WheelEvent) => {
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
            if (event.key === "Escape" && event.ctrlKey) {
              canvas.blur();
              return;
            }
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
          let activePointerId: number | null = null;
          let activePointerButton = 0;
          const releasePointer = (event: PointerEvent, sendRelease: boolean) => {
            if (activePointerId !== event.pointerId) return;
            if (sendRelease) {
              safeInput({
                kind: "mouse",
                phase: "up",
                button: activePointerButton,
                ...cellPoint(event),
                mods: inputModifiers(event),
              });
            }
            if (canvas.hasPointerCapture(event.pointerId)) {
              canvas.releasePointerCapture(event.pointerId);
            }
            activePointerId = null;
          };
          canvas.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            // Capture the terminal cell before focus can scroll a partly
            // visible hero canvas and change its bounding rectangle. Without
            // this, a click on row 0 can be remapped deep into the content
            // pane when the browser brings the canvas into view.
            const point = cellPoint(event);
            canvas.focus({ preventScroll: true });
            container.dataset.lastInputAt = String(performance.now());
            activePointerId = event.pointerId;
            activePointerButton = event.button;
            canvas.setPointerCapture(event.pointerId);
            safeInput({ kind: "mouse", phase: "down", button: event.button, ...point, mods: inputModifiers(event) });
          }, { signal });
          canvas.addEventListener("pointerup", (event) => {
            releasePointer(event, true);
          }, { signal });
          canvas.addEventListener("pointermove", (event) => {
            if (activePointerId !== event.pointerId) return;
            safeInput({
              kind: "mouse",
              phase: "drag",
              button: activePointerButton,
              ...cellPoint(event),
              mods: inputModifiers(event),
            }, true);
          }, { signal });
          canvas.addEventListener("pointercancel", (event) => releasePointer(event, true), { signal });
          canvas.addEventListener("lostpointercapture", (event) => {
            if (activePointerId === event.pointerId) activePointerId = null;
          }, { signal });
          window.addEventListener("pointerup", (event) => releasePointer(event, true), { signal });
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
        className="group relative h-full w-full overflow-hidden bg-[#020611]"
        role="region"
        aria-label="Interactive Agent Mail FrankenTUI dashboard"
        aria-describedby="agent-mail-terminal-help agent-mail-terminal-screen-reader"
        aria-busy={!showCanvas}
      >
        <canvas
          ref={canvasRef}
          data-testid="hero-agent-mail-canvas"
          tabIndex={showCanvas ? 0 : -1}
          aria-disabled={!showCanvas}
          aria-label="Agent Mail terminal. Click tabs, filters, and rows, or use Tab, number keys, arrows, j and k. Press Control Escape to return focus to the webpage."
          className={`block h-full w-full touch-none select-none outline-none ring-inset focus-visible:ring-2 focus-visible:ring-cyan-300 ${showCanvas ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ imageRendering: "auto" }}
        />

        {!showCanvas && (
          <div className="pointer-events-none absolute inset-0 bg-[#020611]">
            <Image
              src={POSTER_URL}
              alt="Preview of the Agent Mail operations dashboard"
              className="absolute inset-0 h-full w-full object-cover opacity-100"
              width={1600}
              height={800}
              sizes="96vw"
              priority
            />
            <div className="absolute bottom-3 left-3 max-w-md border-l-2 border-cyan-300 bg-slate-950/85 px-3 py-2 font-mono text-[10px] text-slate-300 backdrop-blur-sm">
              {loadState === "error" ? (
                <>
                  <p className="font-bold text-rose-300">Interactive dashboard unavailable</p>
                  <p className="mt-2 text-slate-400">{error?.message ?? "The browser renderer could not start."}</p>
                  <p className="mt-2 text-[10px] text-slate-500">The static preview remains available; no private data was requested.</p>
                </>
              ) : (
                <p>{loadingLabel}</p>
              )}
            </div>
          </div>
        )}

        <p id="agent-mail-terminal-help" className="sr-only">
          This is the real Agent Mail shell and DashboardScreen compiled to WebAssembly and rendered by FrankenTUI. It replays a privacy-checked public pack. Click tabs, filters, and rows, or use Tab, Shift Tab, arrows, j and k, slash, Enter, Escape, and the number keys shown in the terminal. Control Escape returns focus to the webpage.
        </p>
        <pre id="agent-mail-terminal-screen-reader" className="sr-only" aria-live="polite" aria-atomic="true">
          {screenReaderText}
        </pre>
        <noscript>
          <Image src={POSTER_URL} alt="Agent Mail operations dashboard preview" width={1600} height={800} />
        </noscript>
      </div>
    );
  },
);

export default AgentMailTerminal;
