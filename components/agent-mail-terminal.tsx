"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  DASHBOARD_POSTER_URL,
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
  fullscreen?: boolean;
  zoom?: number;
  onError?(error: Error): void;
  onReady?(status: DashboardRunnerStatus): void;
  onRetry?(): void;
  onStatus?(status: DashboardRunnerStatus): void;
}

type LoadState = "loading" | "running" | "error";

const useBrowserLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const DEFAULT_TERMINAL_ZOOM = 1;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_BACKING_PIXELS = 8_500_000;
const MAX_LOGICAL_VIEWPORT_WIDTH = 2_560;
const MAX_LOGICAL_VIEWPORT_HEIGHT = 1_440;
const REPLAY_HOST_CADENCE_MS = 100;
const RAF_WAKE_AHEAD_MS = 16;
const SCREEN_READER_MIRROR_THROTTLE_MS = 1_000;
const SCREEN_READER_MIRROR_DEBOUNCE_MS = 100;
const DESKTOP_HEADER_CLEARANCE_PX = 96;
export const DASHBOARD_TERMINAL_INIT_TIMEOUT_MS = 15_000;
const MAX_WHEEL_INPUTS_PER_FRAME = 24;
const MAX_TEXT_INPUT_CHARACTERS = 96;
const DASHBOARD_SCREEN_SLUGS = new Set([
  "dashboard", "messages", "threads", "agents", "search", "reservations",
  "tool_metrics", "system_health", "timeline", "projects", "contacts", "explorer",
  "analytics", "attachments", "archive_browser", "atc",
]);
const DASHBOARD_FILTER_SLUGS = new Set(["all", "messages", "tools", "reservations"]);

interface CoalescedWheelInput {
  kind: "wheel";
  x: number;
  y: number;
  dx: number;
  dy: number;
  mods: number;
}

function withTerminalInitTimeout(operation: Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(
        `FrankenTerm renderer initialization did not finish within ${DASHBOARD_TERMINAL_INIT_TIMEOUT_MS}ms`,
      ));
    }, DASHBOARD_TERMINAL_INIT_TIMEOUT_MS);

    void operation.then(
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        resolve();
      },
      (cause) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        reject(cause);
      },
    );
  });
}

function boundedWheelDelta(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-MAX_WHEEL_INPUTS_PER_FRAME, Math.min(MAX_WHEEL_INPUTS_PER_FRAME, value));
}

function boundedTextInput(value: string): string {
  let result = "";
  let characterCount = 0;
  for (const character of value) {
    if (characterCount >= MAX_TEXT_INPUT_CHARACTERS) break;
    result += character;
    characterCount += 1;
  }
  return result;
}

export function dashboardRendererDpr(
  widthCss: number,
  heightCss: number,
  devicePixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
): number {
  const normalizedDeviceDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
    ? devicePixelRatio
    : 1;
  const deviceDpr = Math.min(normalizedDeviceDpr, MAX_DEVICE_PIXEL_RATIO);
  const width = Number.isFinite(widthCss) && widthCss > 0 ? widthCss : 1;
  const height = Number.isFinite(heightCss) && heightCss > 0 ? heightCss : 1;
  const cssPixels = width * height;
  const budgetDpr = Math.sqrt(MAX_BACKING_PIXELS / cssPixels);
  // A render scale below 1 is intentional on unusually large fullscreen
  // surfaces. FrankenTerm accepts any positive DPR, and allowing downsampling
  // here keeps the backing store inside the advertised pixel budget instead
  // of allocating 5K/8K canvases at an unconditional 1x minimum.
  return Math.min(deviceDpr, budgetDpr);
}

export function dashboardEffectiveZoom(
  userZoom: number,
  widthCss: number,
  heightCss: number,
): number {
  const normalizedZoom = Number.isFinite(userZoom) && userZoom > 0
    ? userZoom
    : DEFAULT_TERMINAL_ZOOM;
  const width = Number.isFinite(widthCss) && widthCss > 0 ? widthCss : 1;
  const height = Number.isFinite(heightCss) && heightCss > 0 ? heightCss : 1;
  const largeViewportScale = Math.max(
    1,
    width / MAX_LOGICAL_VIEWPORT_WIDTH,
    height / MAX_LOGICAL_VIEWPORT_HEIGHT,
  );
  return normalizedZoom * largeViewportScale;
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
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Agent Mail dashboard runner returned an invalid status snapshot");
  }
  const status = value as Record<string, unknown>;
  const booleanFields = ["running", "paused", "reduced_motion", "help_visible"];
  const numberFields = [
    "frame_index",
    "elapsed_ms",
    "duration_ms",
    "projects",
    "agents",
    "messages",
    "active_reservations",
    "pending_acknowledgements",
    "interaction_revision",
    "selected_row",
  ];
  const stringFields = [
    "replay_label",
    "source_label",
    "content_sha256",
    "active_screen",
    "dashboard_filter",
  ];
  if (
    booleanFields.some((field) => typeof status[field] !== "boolean") ||
    numberFields.some((field) => !Number.isSafeInteger(status[field]) || (status[field] as number) < 0) ||
    stringFields.some((field) => typeof status[field] !== "string") ||
    (status.duration_ms as number) === 0 ||
    !/^[a-f0-9]{64}$/.test(status.content_sha256 as string) ||
    !DASHBOARD_SCREEN_SLUGS.has(status.active_screen as string) ||
    !DASHBOARD_FILTER_SLUGS.has(status.dashboard_filter as string) ||
    !(status.last_deep_link === null ||
      (typeof status.last_deep_link === "string" && status.last_deep_link.length <= 2_048))
  ) {
    throw new Error("Agent Mail dashboard runner returned an invalid status snapshot");
  }
  return value as DashboardRunnerStatus;
}

function stoppedRunnerError(runner: DashboardRunnerInstance, context: string): Error {
  let detail = "";
  try {
    detail = runner.takeLogs()
      .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      .slice(-3)
      .join(" | ")
      .slice(0, 800);
  } catch {
    // The liveness signal is authoritative even if diagnostic draining fails.
  }
  return new Error(detail ? `${context}: ${detail}` : context);
}

const AgentMailTerminal = forwardRef<AgentMailTerminalHandle, AgentMailTerminalProps>(
  function AgentMailTerminal({
    paused,
    reducedMotion,
    fullscreen = false,
    zoom = DEFAULT_TERMINAL_ZOOM,
    onError,
    onReady,
    onRetry,
    onStatus,
  }, ref) {
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [loadingLabel, setLoadingLabel] = useState("Preparing the dashboard runtime…");
    const [error, setError] = useState<Error | null>(null);
    const [screenReaderText, setScreenReaderText] = useState(
      "Agent Mail dashboard is loading. Outside text-entry mode, number keys 1 through 4 jump to Dashboard, Messages, Threads, and Agents. Tab, Shift Tab, arrows, j and k, slash search, Enter, and Escape are also supported.",
    );
    const [screenReaderMirror, setScreenReaderMirror] = useState(
      "Agent Mail terminal contents will appear when the verified dashboard is ready.",
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const termRef = useRef<FrankenTermInstance | null>(null);
    const runnerRef = useRef<DashboardRunnerInstance | null>(null);
    const frameRef = useRef(0);
    const frameTimerRef = useRef(0);
    const mirrorTimerRef = useRef(0);
    const lastFrameAtRef = useRef(0);
    const statusAtRef = useRef(0);
    const mirrorAtRef = useRef(0);
    const mirrorTextRef = useRef("");
    const refitRef = useRef<() => void>(() => undefined);
    const resetRef = useRef<() => void>(() => undefined);
    const wakeFrameRef = useRef<() => void>(() => undefined);
    const suspendFramesRef = useRef<() => void>(() => undefined);
    const hostRefreshPendingRef = useRef(false);
    const initializedRef = useRef(false);
    const visibleRef = useRef(true);
    const pausedRef = useRef(paused || reducedMotion);
    const reducedMotionRef = useRef(reducedMotion);
    const fullscreenRef = useRef(fullscreen);
    const zoomRef = useRef(zoom);
    const effectiveZoomRef = useRef(Number.NaN);
    const failRuntimeRef = useRef<(cause: unknown) => void>(() => undefined);
    const callbacksRef = useRef({ onError, onReady, onRetry, onStatus });

    useEffect(() => {
      callbacksRef.current = { onError, onReady, onRetry, onStatus };
    }, [onError, onReady, onRetry, onStatus]);

    const cleanup = useCallback(() => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (frameTimerRef.current) window.clearTimeout(frameTimerRef.current);
      if (mirrorTimerRef.current) window.clearTimeout(mirrorTimerRef.current);
      frameRef.current = 0;
      frameTimerRef.current = 0;
      mirrorTimerRef.current = 0;
      lastFrameAtRef.current = 0;
      mirrorAtRef.current = 0;
      hostRefreshPendingRef.current = false;
      const runner = runnerRef.current;
      const term = termRef.current;
      runnerRef.current = null;
      termRef.current = null;
      refitRef.current = () => undefined;
      resetRef.current = () => undefined;
      wakeFrameRef.current = () => undefined;
      suspendFramesRef.current = () => undefined;
      releaseRunner(runner);
      releaseTerminal(term);
      initializedRef.current = false;
      effectiveZoomRef.current = Number.NaN;
      failRuntimeRef.current = () => undefined;
    }, []);

    const retry = useCallback(() => {
      const retryMirror = "Agent Mail terminal contents are loading again.";
      setError(null);
      setLoadState("loading");
      setLoadingLabel("Retrying the verified dashboard runtime…");
      setScreenReaderText("Retrying the interactive Agent Mail dashboard.");
      mirrorTextRef.current = retryMirror;
      setScreenReaderMirror(retryMirror);
      callbacksRef.current.onRetry?.();
      setLoadAttempt((attempt) => attempt + 1);
    }, []);

    useImperativeHandle(ref, () => ({
      focus() {
        canvasRef.current?.focus();
      },
      refit() {
        refitRef.current();
      },
      reset() {
        resetRef.current();
      },
      setPaused(nextPaused: boolean) {
        pausedRef.current = nextPaused || reducedMotionRef.current;
        try {
          runnerRef.current?.setPaused(pausedRef.current);
          hostRefreshPendingRef.current = true;
          wakeFrameRef.current();
        } catch (cause) {
          failRuntimeRef.current(cause);
        }
      },
    }), []);

    useEffect(() => {
      pausedRef.current = paused || reducedMotion;
      reducedMotionRef.current = reducedMotion;
      const runner = runnerRef.current;
      const term = termRef.current;
      if (!runner) return;
      try {
        runner.setReducedMotion(reducedMotion);
        runner.setPaused(pausedRef.current);
        term?.setAccessibility({ reducedMotion, screenReader: true });
        const status = parseStatus(runner);
        if (!status.running) throw stoppedRunnerError(runner, "Agent Mail dashboard runner stopped");
        callbacksRef.current.onStatus?.(status);
        hostRefreshPendingRef.current = true;
        wakeFrameRef.current();
      } catch (cause) {
        failRuntimeRef.current(cause);
      }
    }, [paused, reducedMotion]);

    useBrowserLayoutEffect(() => {
      fullscreenRef.current = fullscreen;
    }, [fullscreen]);

    useBrowserLayoutEffect(() => {
      zoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
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
          if (visibleRef.current) {
            wakeFrameRef.current();
          } else {
            suspendFramesRef.current();
          }
        },
        { rootMargin: "300px" },
      );
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          suspendFramesRef.current();
        } else {
          wakeFrameRef.current();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      let cancelled = false;
      let resizeObserver: ResizeObserver | null = null;
      let displayListenerCleanup: (() => void) | null = null;
      let inputController: AbortController | null = null;
      let focusScrollFrame = 0;
      let releaseInitializingTerm: (() => void) | null = null;
      let pendingPointerMove: unknown | null = null;
      let pendingWheelInput: CoalescedWheelInput | null = null;
      let activePointerId: number | null = null;
      let activePointerButton = 0;
      let activePointerIsEmbeddedTouch = false;
      let activeTouchStartX = 0;
      let activeTouchStartY = 0;
      let activeTouchMoved = false;
      let suppressFullscreenEscapeKeyUp = false;
      let failed = false;

      const failRuntime = (cause: unknown) => {
        if (cancelled || failed) return;
        failed = true;
        resizeObserver?.disconnect();
        resizeObserver = null;
        displayListenerCleanup?.();
        displayListenerCleanup = null;
        inputController?.abort();
        inputController = null;
        if (focusScrollFrame) cancelAnimationFrame(focusScrollFrame);
        focusScrollFrame = 0;
        const currentContainer = containerRef.current;
        if (currentContainer) {
          currentContainer.dataset.activeScreen = "error";
          currentContainer.dataset.dashboardFilter = "error";
          currentContainer.dataset.interactionRevision = "error";
        }
        cleanup();
        const nextError = cause instanceof Error ? cause : new Error(String(cause));
        const unavailableMirror = "Agent Mail terminal contents are unavailable because the interactive dashboard stopped.";
        setError(nextError);
        setLoadState("error");
        setScreenReaderText(`Interactive Agent Mail dashboard unavailable: ${nextError.message}`);
        mirrorTextRef.current = unavailableMirror;
        setScreenReaderMirror(unavailableMirror);
        callbacksRef.current.onError?.(nextError);
      };
      failRuntimeRef.current = failRuntime;

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
          let termReleased = false;
          const releaseTermOnce = () => {
            if (termReleased) return;
            termReleased = true;
            releaseTerminal(term);
          };
          releaseInitializingTerm = releaseTermOnce;
          // Respect a genuinely narrow measured viewport; the fallbacks only
          // cover the pre-layout zero-size case.
          const initialWidth = container.clientWidth > 0 ? container.clientWidth : 320;
          const initialHeight = container.clientHeight > 0 ? container.clientHeight : 300;
          const initialDpr = dashboardRendererDpr(initialWidth, initialHeight);
          const initEffectiveZoom = dashboardEffectiveZoom(
            zoomRef.current,
            initialWidth,
            initialHeight,
          );
          let terminalInitSettled = false;
          const terminalInit = term.init(canvas, {
            cols: 220,
            rows: 48,
            cellWidth: 8,
            cellHeight: 16,
            dpr: initialDpr,
            zoom: initEffectiveZoom,
            focused: false,
          }).then(
            () => {
              terminalInitSettled = true;
            },
            (cause) => {
              terminalInitSettled = true;
              throw cause;
            },
          );
          try {
            await withTerminalInitTimeout(terminalInit);
          } catch (cause) {
            if (terminalInitSettled) {
              releaseTermOnce();
            } else {
              // Surface the timeout immediately, but let an in-flight WebGPU
              // initializer finish touching its wrapper before disposing it.
              // Both fulfillment and rejection are observed so a late result
              // cannot leak a wrapper or create an unhandled rejection.
              void terminalInit.then(releaseTermOnce, releaseTermOnce);
            }
            releaseInitializingTerm = null;
            throw cause;
          }
          if (cancelled) {
            releaseTermOnce();
            releaseInitializingTerm = null;
            return;
          }
          // WebGPU initialization is asynchronous. Re-read geometry and user
          // zoom so a resize/fullscreen/zoom change during startup cannot leave
          // the first live frame fitted to stale values.
          const fitWidth = container.clientWidth > 0 ? container.clientWidth : initialWidth;
          const fitHeight = container.clientHeight > 0 ? container.clientHeight : initialHeight;
          const fitDpr = dashboardRendererDpr(fitWidth, fitHeight);
          const fitEffectiveZoom = dashboardEffectiveZoom(
            zoomRef.current,
            fitWidth,
            fitHeight,
          );
          if (fitEffectiveZoom !== initEffectiveZoom) term.setZoom(fitEffectiveZoom);
          effectiveZoomRef.current = fitEffectiveZoom;
          termRef.current = term;
          releaseInitializingTerm = null;
          term.setAccessibility({ reducedMotion: reducedMotionRef.current, screenReader: true });

          let geometry = term.fitToContainer(
            fitWidth,
            fitHeight,
            fitDpr,
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

          const initialStatus = parseStatus(runner);
          if (!initialStatus.running) {
            throw stoppedRunnerError(runner, "Agent Mail dashboard runner failed to initialize");
          }

          const initialPatches = runner.takeFlatPatches();
          if (initialPatches.cells.length > 0) {
            term.applyPatchBatchFlat(initialPatches.spans, initialPatches.cells);
          }
          term.render();

          const publishScreenReaderMirrorNow = () => {
            const now = performance.now();
            const mirror = term.screenReaderMirrorText().slice(0, 32_000);
            mirrorAtRef.current = now;
            if (!mirror.trim() || mirror === mirrorTextRef.current) return;
            mirrorTextRef.current = mirror;
            setScreenReaderMirror(mirror);
          };
          const scheduleScreenReaderMirror = () => {
            if (mirrorTimerRef.current) return;
            mirrorTimerRef.current = window.setTimeout(() => {
              mirrorTimerRef.current = 0;
              try {
                publishScreenReaderMirrorNow();
              } catch (cause) {
                failRuntime(cause);
              }
            }, SCREEN_READER_MIRROR_DEBOUNCE_MS);
          };
          const publishScreenReaderMirror = (interactive = false) => {
            if (interactive) {
              scheduleScreenReaderMirror();
              return;
            }
            if (mirrorTimerRef.current) return;
            if (performance.now() - mirrorAtRef.current < SCREEN_READER_MIRROR_THROTTLE_MS) return;
            publishScreenReaderMirrorNow();
          };
          publishScreenReaderMirrorNow();

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

          const drainRunnerInput = (
            currentTerm: FrankenTermInstance,
            currentRunner: DashboardRunnerInstance,
          ) => {
            let inputProcessed = false;
            for (const encoded of currentTerm.drainEncodedInputs()) {
              if (typeof encoded === "string" && currentRunner.pushEncodedInput(encoded)) {
                inputProcessed = true;
              }
            }
            return inputProcessed;
          };

          const renderRunnerStep = (
            currentTerm: FrankenTermInstance,
            currentRunner: DashboardRunnerInstance,
            forceMirror = false,
          ) => {
            const result = currentRunner.step();
            if (!result.running) {
              throw stoppedRunnerError(currentRunner, "Agent Mail dashboard runner stopped unexpectedly");
            }
            if (!result.rendered) return;
            const patches = currentRunner.takeFlatPatches();
            if (patches.cells.length === 0) return;
            currentTerm.applyPatchBatchFlat(patches.spans, patches.cells);
            currentTerm.render();
            publishScreenReaderMirror(forceMirror);
          };

          const flushInteractiveInput = () => {
            const currentRunner = runnerRef.current;
            const currentTerm = termRef.current;
            if (!currentRunner || !currentTerm) return;
            try {
              if (!drainRunnerInput(currentTerm, currentRunner)) return;
              renderRunnerStep(currentTerm, currentRunner, true);
              statusAtRef.current = performance.now();
              publishStatus();
            } catch (cause) {
              failRuntime(cause);
            }
          };

          const flushContinuousInput = (currentTerm: FrankenTermInstance) => {
            if (pendingPointerMove !== null) {
              currentTerm.input(pendingPointerMove);
              pendingPointerMove = null;
            }
            if (pendingWheelInput !== null) {
              const wheelInput = pendingWheelInput;
              pendingWheelInput = null;
              const horizontalSteps = Math.abs(wheelInput.dx);
              const verticalSteps = Math.abs(wheelInput.dy);
              let emitted = 0;
              for (
                let index = 0;
                index < verticalSteps && emitted < MAX_WHEEL_INPUTS_PER_FRAME;
                index += 1
              ) {
                currentTerm.input({
                  ...wheelInput,
                  dx: 0,
                  dy: Math.sign(wheelInput.dy),
                });
                emitted += 1;
              }
              for (
                let index = 0;
                index < horizontalSteps && emitted < MAX_WHEEL_INPUTS_PER_FRAME;
                index += 1
              ) {
                currentTerm.input({
                  ...wheelInput,
                  dx: Math.sign(wheelInput.dx),
                  dy: 0,
                });
                emitted += 1;
              }
            }
          };

          resetRef.current = () => {
            const currentRunner = runnerRef.current;
            const currentTerm = termRef.current;
            if (!currentRunner || !currentTerm) return;
            try {
              // Reset is a semantic boundary: pre-reset drag/wheel input must
              // never leak into the fresh replay on the next animation frame.
              pendingPointerMove = null;
              pendingWheelInput = null;
              currentRunner.reset();
              renderRunnerStep(currentTerm, currentRunner, true);
              lastFrameAtRef.current = 0;
              statusAtRef.current = performance.now();
              publishStatus();
            } catch (cause) {
              failRuntime(cause);
            }
          };

          const suspendFrames = () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            if (frameTimerRef.current) window.clearTimeout(frameTimerRef.current);
            frameRef.current = 0;
            frameTimerRef.current = 0;
            lastFrameAtRef.current = 0;
          };
          suspendFramesRef.current = suspendFrames;

          const scheduleFrame = (delayMs = 0) => {
            if (cancelled || failed || !visibleRef.current || document.hidden) return;
            const immediate = delayMs <= 0;
            if (immediate && frameTimerRef.current) {
              window.clearTimeout(frameTimerRef.current);
              frameTimerRef.current = 0;
            }
            if (frameRef.current || frameTimerRef.current) return;
            if (immediate) {
              frameRef.current = requestAnimationFrame(frame);
              return;
            }
            frameTimerRef.current = window.setTimeout(() => {
              frameTimerRef.current = 0;
              if (!cancelled && !failed && visibleRef.current && !document.hidden) {
                frameRef.current = requestAnimationFrame(frame);
              }
            }, delayMs);
          };
          wakeFrameRef.current = () => scheduleFrame();

          function frame(timestamp: number) {
            frameRef.current = 0;
            if (cancelled) return;
            const currentRunner = runnerRef.current;
            const currentTerm = termRef.current;
            if (!currentRunner || !currentTerm) return;

            try {
              if (visibleRef.current && !document.hidden) {
                flushContinuousInput(currentTerm);
                const inputProcessed = drainRunnerInput(currentTerm, currentRunner);
                const elapsed = lastFrameAtRef.current === 0
                  ? REPLAY_HOST_CADENCE_MS
                  : timestamp - lastFrameAtRef.current;
                const replayDue = !pausedRef.current && elapsed >= REPLAY_HOST_CADENCE_MS;
                if (replayDue) {
                  lastFrameAtRef.current = timestamp;
                  currentRunner.advanceTime(Math.min(elapsed, 250));
                } else if (pausedRef.current) {
                  lastFrameAtRef.current = 0;
                }
                const hostRefreshPending = hostRefreshPendingRef.current;
                hostRefreshPendingRef.current = false;
                if (inputProcessed || replayDue || hostRefreshPending) {
                  renderRunnerStep(currentTerm, currentRunner, inputProcessed || hostRefreshPending);
                  if (inputProcessed || timestamp - statusAtRef.current >= 750) {
                    statusAtRef.current = timestamp;
                    publishStatus();
                  }
                }
              } else {
                suspendFrames();
              }
            } catch (cause) {
              failRuntime(cause);
              return;
            }
            if (!pausedRef.current) {
              const elapsedSinceReplay = lastFrameAtRef.current === 0
                ? REPLAY_HOST_CADENCE_MS
                : Math.max(0, performance.now() - lastFrameAtRef.current);
              scheduleFrame(Math.max(
                0,
                REPLAY_HOST_CADENCE_MS - elapsedSinceReplay - RAF_WAKE_AHEAD_MS,
              ));
            }
          }
          if (!pausedRef.current) scheduleFrame();

          const refit = () => {
            try {
              const currentTerm = termRef.current;
              const currentRunner = runnerRef.current;
              const currentContainer = containerRef.current;
              if (!currentTerm || !currentRunner || !currentContainer) return;
              const width = Math.max(currentContainer.clientWidth, 1);
              const height = Math.max(currentContainer.clientHeight, 1);
              const currentDpr = dashboardRendererDpr(width, height);
              const nextEffectiveZoom = dashboardEffectiveZoom(zoomRef.current, width, height);
              if (nextEffectiveZoom !== effectiveZoomRef.current) {
                currentTerm.setZoom(nextEffectiveZoom);
                effectiveZoomRef.current = nextEffectiveZoom;
              }
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
                if (!result.running) {
                  throw stoppedRunnerError(currentRunner, "Agent Mail dashboard runner stopped during resize");
                }
                if (result.rendered) {
                  const patches = currentRunner.takeFlatPatches();
                  if (patches.cells.length > 0) {
                    currentTerm.applyPatchBatchFlat(patches.spans, patches.cells);
                  }
                }
              }
              currentTerm.render();
              publishScreenReaderMirror(true);
            } catch (cause) {
              failRuntime(cause);
            }
          };
          refitRef.current = refit;
          resizeObserver = new ResizeObserver(refit);
          resizeObserver.observe(container);

          const displayChangeCleanups: Array<() => void> = [];
          // Install the aggregate cleanup before registering either source.
          // If a platform shim throws while the second listener is armed, the
          // first listener must still be removed by failRuntime.
          displayListenerCleanup = () => {
            for (const removeListener of displayChangeCleanups) removeListener();
          };
          const visualViewport = window.visualViewport;
          if (visualViewport && typeof visualViewport.addEventListener === "function") {
            const handleVisualViewportResize = () => refit();
            visualViewport.addEventListener("resize", handleVisualViewportResize);
            displayChangeCleanups.push(() => {
              visualViewport.removeEventListener("resize", handleVisualViewportResize);
            });
          }
          if (typeof window.matchMedia === "function") {
            let detachCurrentQuery: () => void = () => undefined;
            const armDprQuery = () => {
              detachCurrentQuery();
              const query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
              const handleDprChange = () => {
                refit();
                if (!cancelled && !failed) armDprQuery();
              };
              if (typeof query.addEventListener === "function") {
                query.addEventListener("change", handleDprChange, { once: true });
                detachCurrentQuery = () => query.removeEventListener("change", handleDprChange);
              } else {
                query.addListener(handleDprChange);
                detachCurrentQuery = () => query.removeListener(handleDprChange);
              }
            };
            displayChangeCleanups.push(() => detachCurrentQuery());
            armDprQuery();
          }

          inputController = new AbortController();
          const signal = inputController.signal;
          const safeInput = (value: unknown, coalescePointerMove = false) => {
            if (coalescePointerMove) {
              pendingPointerMove = value;
              scheduleFrame();
              return;
            }
            try {
              const currentTerm = termRef.current;
              if (currentTerm) flushContinuousInput(currentTerm);
              currentTerm?.input(value);
              flushInteractiveInput();
            } catch (cause) {
              failRuntime(cause);
            }
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
          const keepFocusedCanvasBelowHeader = () => {
            if (focusScrollFrame) cancelAnimationFrame(focusScrollFrame);
            focusScrollFrame = requestAnimationFrame(() => {
              focusScrollFrame = 0;
              if (
                cancelled ||
                failed ||
                fullscreenRef.current ||
                window.innerWidth < 768 ||
                activePointerId !== null ||
                document.activeElement !== canvas
              ) {
                return;
              }
              const top = canvas.getBoundingClientRect().top;
              // Correct only the browser's usual focus alignment at the top of
              // the viewport. If the user intentionally has an earlier part of
              // this tall canvas scrolled above view, focusing a visible lower
              // cell must not yank the whole terminal back down.
              if (top >= 0 && top < DESKTOP_HEADER_CLEARANCE_PX) {
                window.scrollBy(0, top - DESKTOP_HEADER_CLEARANCE_PX);
              }
            });
          };

          canvas.addEventListener("keydown", (event) => {
            if (event.isComposing || event.key === "Process") return;
            if (event.key === "Escape") {
              if (event.ctrlKey) {
                suppressFullscreenEscapeKeyUp = false;
                canvas.blur();
                return;
              }
              // Browsers conventionally reserve plain Escape for leaving
              // fullscreen. Do not cancel it merely because the canvas owns
              // keyboard focus.
              if (document.fullscreenElement) {
                suppressFullscreenEscapeKeyUp = true;
                void document.exitFullscreen().catch(() => {
                  // The browser may already have processed its native Escape
                  // action. Fullscreen state is reconciled by fullscreenchange.
                });
                return;
              }
              // Fullscreen exit commonly moves focus before keyup, leaving the
              // one-shot suppression flag set. A later embedded Escape is a
              // new key sequence and must reach the terminal normally.
              suppressFullscreenEscapeKeyUp = false;
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
            if (event.key === "Escape" && suppressFullscreenEscapeKeyUp) {
              suppressFullscreenEscapeKeyUp = false;
              return;
            }
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
          const releasePointer = (event: PointerEvent, sendRelease: boolean) => {
            if (activePointerId !== event.pointerId) return;
            const wasEmbeddedTouch = activePointerIsEmbeddedTouch;
            const wasTouchMoved = activeTouchMoved;
            const button = activePointerButton;
            activePointerId = null;
            activePointerIsEmbeddedTouch = false;
            activeTouchMoved = false;
            if (wasEmbeddedTouch) {
              if (sendRelease && !wasTouchMoved) {
                const point = cellPoint(event);
                canvas.focus({ preventScroll: true });
                container.dataset.lastInputAt = String(performance.now());
                safeInput({
                  kind: "mouse",
                  phase: "down",
                  button,
                  ...point,
                  mods: inputModifiers(event),
                });
                safeInput({
                  kind: "mouse",
                  phase: "up",
                  button,
                  ...point,
                  mods: inputModifiers(event),
                });
              }
              return;
            }
            if (sendRelease) {
              safeInput({
                kind: "mouse",
                phase: "up",
                button,
                ...cellPoint(event),
                mods: inputModifiers(event),
              });
            }
            if (canvas.hasPointerCapture(event.pointerId)) {
              canvas.releasePointerCapture(event.pointerId);
            }
            // Focusing on pointer-down may need to move the tall canvas below
            // the fixed site header. Defer that correction until mouse-up so
            // the canvas cannot move between the down/up cell calculations.
            if (document.activeElement === canvas) keepFocusedCanvasBelowHeader();
          };
          canvas.addEventListener("pointerdown", (event) => {
            const allowEmbeddedTouchPan = event.pointerType === "touch" && !fullscreenRef.current;
            if (!allowEmbeddedTouchPan) event.preventDefault();
            if (activePointerId !== null && activePointerId !== event.pointerId) {
              // A second finger turns an embedded touch into a page gesture,
              // never a terminal tap. Fullscreen also keeps one coherent
              // pointer sequence instead of overwriting the held button.
              if (activePointerIsEmbeddedTouch) activeTouchMoved = true;
              return;
            }
            // Capture the terminal cell before focus can scroll a partly
            // visible hero canvas and change its bounding rectangle. Without
            // this, a click on row 0 can be remapped deep into the content
            // pane when the browser brings the canvas into view.
            activePointerId = event.pointerId;
            activePointerButton = event.button;
            activePointerIsEmbeddedTouch = allowEmbeddedTouchPan;
            if (allowEmbeddedTouchPan) {
              activeTouchStartX = event.clientX;
              activeTouchStartY = event.clientY;
              activeTouchMoved = false;
              return;
            }
            const point = cellPoint(event);
            canvas.focus({ preventScroll: true });
            container.dataset.lastInputAt = String(performance.now());
            canvas.setPointerCapture(event.pointerId);
            safeInput({ kind: "mouse", phase: "down", button: event.button, ...point, mods: inputModifiers(event) });
          }, { signal });
          canvas.addEventListener("pointerup", (event) => {
            releasePointer(event, true);
          }, { signal });
          canvas.addEventListener("pointermove", (event) => {
            if (activePointerId !== event.pointerId) return;
            if (activePointerIsEmbeddedTouch) {
              if (Math.hypot(event.clientX - activeTouchStartX, event.clientY - activeTouchStartY) > 8) {
                activeTouchMoved = true;
              }
              return;
            }
            safeInput({
              kind: "mouse",
              phase: "drag",
              button: activePointerButton,
              ...cellPoint(event),
              mods: inputModifiers(event),
            }, true);
          }, { signal });
          canvas.addEventListener("pointercancel", (event) => {
            // A browser cancellation is never a completed touch tap. Sending a
            // synthetic click here made interrupted page gestures activate a
            // terminal control, even though the user never released normally.
            releasePointer(event, !activePointerIsEmbeddedTouch);
          }, { signal });
          canvas.addEventListener("lostpointercapture", (event) => {
            // Unexpected capture loss must balance a terminal mouse-down. The
            // normal release path clears activePointerId before relinquishing
            // capture, so it cannot emit a duplicate mouse-up here.
            releasePointer(event, true);
          }, { signal });
          window.addEventListener("pointerup", (event) => releasePointer(event, true), { signal });
          canvas.addEventListener("wheel", (event) => {
            event.preventDefault();
            const point = cellPoint(event);
            const nextDx = Number.isFinite(event.deltaX) ? Math.sign(event.deltaX) : 0;
            const nextDy = Number.isFinite(event.deltaY) ? Math.sign(event.deltaY) : 0;
            pendingWheelInput = {
              kind: "wheel",
              ...point,
              dx: boundedWheelDelta((pendingWheelInput?.dx ?? 0) + nextDx),
              dy: boundedWheelDelta((pendingWheelInput?.dy ?? 0) + nextDy),
              mods: inputModifiers(event),
            };
            scheduleFrame();
          }, { signal, passive: false });
          canvas.addEventListener("paste", (event) => {
            let clipboardText = "";
            try {
              clipboardText = event.clipboardData?.getData("text") ?? "";
            } catch {
              // Leave the browser's default action alone if clipboard access
              // is unavailable in this context.
              return;
            }
            const text = boundedTextInput(clipboardText);
            if (!text) return;
            if (event.cancelable) event.preventDefault();
            safeInput({ kind: "paste", data: text });
          }, { signal });
          canvas.addEventListener("compositionend", (event) => {
            const text = boundedTextInput(event.data ?? "");
            if (!text) return;
            // The public dashboard consumes Event::Paste in its TextInput
            // paths. Reuse that stable route for committed IME text instead
            // of adding a second Event::Ime contract that those paths ignore.
            safeInput({ kind: "paste", data: text });
          }, { signal });
          canvas.addEventListener("focus", () => {
            keepFocusedCanvasBelowHeader();
            safeInput({ kind: "focus", focused: true });
          }, { signal });
          canvas.addEventListener("blur", () => {
            if (focusScrollFrame) cancelAnimationFrame(focusScrollFrame);
            focusScrollFrame = 0;
            safeInput({ kind: "focus", focused: false });
          }, { signal });
          canvas.addEventListener("contextmenu", (event) => event.preventDefault(), { signal });
        } catch (cause) {
          releaseInitializingTerm?.();
          releaseInitializingTerm = null;
          if (cancelled) return;
          failRuntime(cause);
        }
      }

      void initialize();
      return () => {
        cancelled = true;
        resizeObserver?.disconnect();
        displayListenerCleanup?.();
        inputController?.abort();
        if (focusScrollFrame) cancelAnimationFrame(focusScrollFrame);
        cleanup();
      };
    }, [cleanup, loadAttempt]);

    const showCanvas = loadState === "running";

    return (
      <div
        ref={containerRef}
        data-testid="hero-agent-mail-terminal"
        className="group relative h-full w-full overflow-hidden bg-[#020611]"
        role="region"
        aria-label="Interactive Agent Mail FrankenTUI dashboard"
        aria-describedby="agent-mail-terminal-help agent-mail-terminal-screen-reader-status"
        aria-busy={loadState === "loading"}
      >
        <canvas
          key={loadAttempt}
          ref={canvasRef}
          data-testid="hero-agent-mail-canvas"
          data-load-generation={loadAttempt}
          tabIndex={showCanvas ? 0 : -1}
          aria-disabled={!showCanvas}
          aria-label="Agent Mail terminal. Click tabs, filters, and rows. Outside text-entry mode, number keys 1 through 4 jump to Dashboard, Messages, Threads, and Agents. Press Control Escape to return focus to the webpage."
          className={`block h-full w-full ${fullscreen ? "touch-none" : "touch-pan-y"} select-none outline-none ring-inset focus-visible:ring-2 focus-visible:ring-cyan-300 ${showCanvas ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ imageRendering: "auto" }}
        />

        {!showCanvas && (
          <div className="absolute inset-0 bg-[#020611]">
            <Image
              src={DASHBOARD_POSTER_URL}
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
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-3 inline-flex h-8 items-center border border-cyan-400/40 bg-cyan-400/10 px-3 font-sans text-[11px] font-bold text-cyan-100 transition-colors hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    Retry interactive dashboard
                  </button>
                </>
              ) : (
                <p>{loadingLabel}</p>
              )}
            </div>
          </div>
        )}

        <p id="agent-mail-terminal-help" className="sr-only">
          This is the real Agent Mail shell and DashboardScreen compiled to WebAssembly and rendered by FrankenTUI. It replays a privacy-checked public pack. Click tabs, filters, and rows, or use Tab, Shift Tab, arrows, j and k, slash, Enter, and Escape. Outside text-entry mode, number keys 1 through 4 jump to Dashboard, Messages, Threads, and Agents. Control Escape returns focus to the webpage.
        </p>
        <pre id="agent-mail-terminal-screen-reader-status" className="sr-only" aria-live="polite" aria-atomic="true">
          {screenReaderText}
        </pre>
        <pre
          id="agent-mail-terminal-screen-reader-mirror"
          className="sr-only"
          aria-label="Current Agent Mail terminal contents"
        >
          {screenReaderMirror}
        </pre>
        <noscript>
          <Image src={DASHBOARD_POSTER_URL} alt="Agent Mail operations dashboard preview" width={1600} height={800} />
        </noscript>
      </div>
    );
  },
);

export default AgentMailTerminal;
