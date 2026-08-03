import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, createRef, StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as dashboardRuntime from "@/lib/agent-mail-wasm";
import type { AgentMailTerminalHandle } from "@/components/agent-mail-terminal";

const {
  DASHBOARD_POSTER_URL,
  validateDashboardDemoPack,
  validateDashboardManifest,
} = dashboardRuntime;

const projectRoot = process.cwd();
const manifestPath = join(projectRoot, "public/agent-mail-dashboard/manifest.v1.json");
const packPath = join(projectRoot, "public/agent-mail-dashboard/demo_pack.v1.json");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Agent Mail browser dashboard artifacts", () => {
  it("accepts the checked-in manifest and public demo pack", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const pack = validateDashboardDemoPack(readJson(packPath), manifest.runner_source_revision);

    expect(manifest.schema).toBe("agent_mail.dashboard_artifacts.v1");
    expect(manifest.runner_source_revision).toMatch(/^[a-f0-9]{40}$/);
    expect(manifest.runner_ftui_source_revision).toMatch(/^[a-f0-9]{40}$/);
    expect(manifest.renderer_source_revision).toMatch(/^[a-f0-9]{40}$/);
    expect(manifest.artifacts.poster.url).toBe(DASHBOARD_POSTER_URL);
    expect(pack.schema).toBe("agent_mail.demo_pack.v1");
    expect(pack.provenance.privacy_policy).toBe("agent-mail-dashboard-public-demo-v1");
    expect(pack.provenance.source_label).toMatch(/aggregate counts.*details synthetic/i);
  });

  it("matches every digest-gated runtime, data, and font artifact", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const byteArtifacts = [
      manifest.artifacts.demo_pack,
      manifest.artifacts.dashboard_runner_js,
      manifest.artifacts.dashboard_runner_wasm,
      manifest.artifacts.renderer_js,
      manifest.artifacts.renderer_wasm,
      manifest.artifacts.terminal_font,
    ];

    for (const artifact of byteArtifacts) {
      const bytes = readFileSync(join(projectRoot, "public", artifact.url));
      expect(bytes.byteLength, artifact.url).toBe(artifact.bytes);
      expect(createHash("sha256").update(bytes).digest("hex"), artifact.url).toBe(artifact.sha256);
    }
    expect(manifest.artifacts.poster).toEqual({ url: DASHBOARD_POSTER_URL });
  });

  it("rejects remote, traversing, and malformed artifact URLs", () => {
    const manifest = readJson(manifestPath) as Record<string, unknown>;
    const remote = structuredClone(manifest) as {
      artifacts: { renderer_js: { url: string } };
    };
    remote.artifacts.renderer_js.url = "https://example.com/renderer.js";
    expect(() => validateDashboardManifest(remote)).toThrow(/local.*agent-mail-dashboard/i);

    const traversing = structuredClone(manifest) as {
      artifacts: { renderer_js: { url: string } };
    };
    traversing.artifacts.renderer_js.url = "/agent-mail-dashboard/../secret.js";
    expect(() => validateDashboardManifest(traversing)).toThrow(/local.*agent-mail-dashboard/i);

    const encodedTraversal = structuredClone(manifest) as {
      artifacts: { renderer_js: { url: string } };
    };
    encodedTraversal.artifacts.renderer_js.url = "/agent-mail-dashboard/%252e%252e/secret.js";
    expect(() => validateDashboardManifest(encodedTraversal)).toThrow(/local.*agent-mail-dashboard/i);

    const encodedPosterTraversal = structuredClone(manifest) as {
      artifacts: { poster: { url: string } };
    };
    encodedPosterTraversal.artifacts.poster.url = "/images/%25252e%25252e/secret.svg";
    expect(() => validateDashboardManifest(encodedPosterTraversal)).toThrow(/local.*images/i);

    const disconnectedPoster = structuredClone(manifest) as {
      artifacts: { poster: { url: string } };
    };
    disconnectedPoster.artifacts.poster.url = "/images/a-different-local-poster.svg";
    expect(() => validateDashboardManifest(disconnectedPoster)).toThrow(/must match the dashboard fallback/i);

    const queried = structuredClone(manifest) as {
      artifacts: { renderer_js: { url: string } };
    };
    queried.artifacts.renderer_js.url = "/agent-mail-dashboard/renderer/FrankenTerm.js?unverified=1";
    expect(() => validateDashboardManifest(queried)).toThrow(/local.*agent-mail-dashboard/i);
  });

  it("rejects packs that lose their explicit privacy boundary", () => {
    const pack = readJson(packPath) as Record<string, unknown>;
    const changed = structuredClone(pack) as {
      provenance: { privacy_policy: string; source_label: string };
    };
    changed.provenance.privacy_policy = "unknown";
    expect(() => validateDashboardDemoPack(changed)).toThrow(/privacy policy/i);

    changed.provenance.privacy_policy = "agent-mail-dashboard-public-demo-v1";
    changed.provenance.source_label = "live production data";
    expect(() => validateDashboardDemoPack(changed)).toThrow(/aggregate and synthetic/i);
  });

  it("rejects packs whose provenance revision diverges from the manifest", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const pack = readJson(packPath) as { provenance: { source_revision: string } };
    expect(() => validateDashboardDemoPack(pack, "0".repeat(40))).toThrow(/does not match/i);
    expect(() => validateDashboardDemoPack(pack, manifest.runner_source_revision)).not.toThrow();
  });

  it("matches Rust's outer duration and action-count limits", () => {
    const pack = readJson(packPath) as Record<string, unknown>;
    const maximumDuration = structuredClone(pack);
    maximumDuration.duration_ms = 30 * 60 * 1_000;
    expect(() => validateDashboardDemoPack(maximumDuration)).not.toThrow();

    const excessiveDuration = structuredClone(maximumDuration);
    excessiveDuration.duration_ms = 30 * 60 * 1_000 + 1;
    expect(() => validateDashboardDemoPack(excessiveDuration)).toThrow(/duration/i);

    const excessiveActions = structuredClone(pack);
    excessiveActions.actions = Array.from({ length: 10_001 }, () => null);
    expect(() => validateDashboardDemoPack(excessiveActions)).toThrow(/actions/i);
  });

  it("requires reproducible source revisions for all WASM build inputs", () => {
    const manifest = readJson(manifestPath) as Record<string, unknown>;
    for (const field of [
      "runner_source_revision",
      "runner_ftui_source_revision",
      "renderer_source_revision",
    ]) {
      const missing = structuredClone(manifest);
      delete missing[field];
      expect(() => validateDashboardManifest(missing), field).toThrow(field);

      const malformed = structuredClone(manifest);
      malformed[field] = "tip";
      expect(() => validateDashboardManifest(malformed), field).toThrow(field);
    }
  });

  it("contains no home directories, database paths, or common credential markers", () => {
    const raw = readFileSync(packPath, "utf8");
    expect(raw).not.toMatch(/\/Users\/|\/home\/|storage\.sqlite|agent_mail\.db/i);
    expect(raw).not.toMatch(/BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|api[_-]?key|bearer\s+[a-z0-9._-]+/i);
  });

  it("contains no developer filesystem paths in either published WASM binary", () => {
    const wasmArtifacts = [
      "public/agent-mail-dashboard/runner/agent_mail_dashboard_bg.wasm",
      "public/agent-mail-dashboard/renderer/FrankenTerm_bg.wasm",
    ];
    for (const relativePath of wasmArtifacts) {
      const raw = readFileSync(join(projectRoot, relativePath)).toString("latin1");
      // Require a user/build-directory component after the root. The runner
      // intentionally contains validator literals such as `/home/` and `/tmp`;
      // those are policy data, not embedded compiler filesystem paths.
      expect(/(?:\/Users|\/home)\/[^/\0]{1,64}\//.test(raw), relativePath).toBe(false);
      expect(/\/(?:private\/)?tmp\/[^/\0]{1,64}\//.test(raw), relativePath).toBe(false);
      expect(/[A-Za-z]:\\Users\\[^\\\0]{1,64}\\/i.test(raw), relativePath).toBe(false);
    }
  });
});

const RUNNER_STATUS = JSON.stringify({
  running: true,
  frame_index: 1,
  elapsed_ms: 0,
  duration_ms: 18_000,
  paused: false,
  reduced_motion: false,
  replay_label: "test",
  source_label: "test aggregate counts; details synthetic",
  content_sha256: "0".repeat(64),
  projects: 45,
  agents: 1_554,
  messages: 8_059,
  active_reservations: 24,
  pending_acknowledgements: 1_597,
  last_deep_link: null,
  active_screen: "dashboard",
  dashboard_filter: "all",
  help_visible: false,
  interaction_revision: 1,
  selected_row: 0,
});

class TestTerminal {
  static instances: TestTerminal[] = [];

  init = vi.fn(async (): Promise<void> => undefined);
  fitToContainer = vi.fn(() => ({ cols: 220, rows: 74 }));
  input = vi.fn();
  drainEncodedInputs = vi.fn<() => unknown[]>(() => []);
  applyPatchBatchFlat = vi.fn();
  render = vi.fn();
  resize = vi.fn();
  setAccessibility = vi.fn();
  setZoom = vi.fn();
  screenReaderMirrorText = vi.fn(() => "test screen");
  drainAccessibilityAnnouncements = vi.fn(() => []);
  destroy = vi.fn();
  free = vi.fn();

  constructor() {
    TestTerminal.instances.push(this);
  }
}

class TestRunner {
  static instances: TestRunner[] = [];

  loadDemoPack = vi.fn();
  setReducedMotion = vi.fn();
  setPaused = vi.fn();
  init = vi.fn();
  takeFlatPatches = vi.fn(() => ({ spans: new Uint32Array(), cells: new Uint32Array() }));
  takeLogs = vi.fn<() => unknown[]>(() => []);
  statusJson = vi.fn(() => RUNNER_STATUS);
  advanceTime = vi.fn();
  pushEncodedInput = vi.fn(() => true);
  resize = vi.fn();
  step = vi.fn(() => ({ running: true, rendered: false, events_processed: 0, frame_idx: 1 }));
  destroy = vi.fn();
  free = vi.fn();
  reset = vi.fn();

  constructor() {
    TestRunner.instances.push(this);
  }
}

class TestResizeObserver {
  static instances: TestResizeObserver[] = [];

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }
}

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn((): IntersectionObserverEntry[] => []);

  constructor(readonly callback: IntersectionObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }
}

function testArtifacts(
  Terminal: typeof TestTerminal = TestTerminal,
  Runner: typeof TestRunner = TestRunner,
) {
  return {
    manifest: {},
    packJson: "{}",
    FrankenTermWeb: Terminal,
    AgentMailDashboardRunner: Runner,
  } as never;
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 8; index += 1) await Promise.resolve();
}

function installAnimationEnvironment(callbacks?: FrameRequestCallback[]) {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const originalResizeObserver = window.ResizeObserver;
  const originalIntersectionObserver = window.IntersectionObserver;
  TestResizeObserver.instances = [];
  TestIntersectionObserver.instances = [];
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callbacks?.push(callback);
    return callbacks?.length ?? 1;
  });
  window.cancelAnimationFrame = vi.fn();
  window.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
  window.IntersectionObserver = TestIntersectionObserver as unknown as typeof IntersectionObserver;
  return () => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    window.ResizeObserver = originalResizeObserver;
    window.IntersectionObserver = originalIntersectionObserver;
  };
}

describe("AgentMailTerminal lifecycle", () => {
  it("keeps 5K and 8K fullscreen raster and grid work inside their budgets", async () => {
    const {
      dashboardEffectiveZoom,
      dashboardRendererDpr,
    } = await import("@/components/agent-mail-terminal");
    const maxBackingPixels = 8_500_000;
    const userZoom = 1;

    for (const [width, height] of [[5_120, 2_880], [7_680, 4_320]]) {
      const dpr = dashboardRendererDpr(width, height, 2);
      const effectiveZoom = dashboardEffectiveZoom(userZoom, width, height);
      // Mirror FrankenTerm's device-pixel rounding instead of using idealized
      // CSS division: fitToContainer rounds both the viewport and each scaled
      // cell before taking the floor. The rounding margin is why the ceiling
      // is slightly above the nominal 2560x1440 / (8x16) cell budget.
      const estimatedCols = Math.floor(
        Math.round(width * dpr) / Math.max(1, Math.round(8 * dpr * effectiveZoom)),
      );
      const estimatedRows = Math.floor(
        Math.round(height * dpr) / Math.max(1, Math.round(16 * dpr * effectiveZoom)),
      );
      expect(dpr).toBeGreaterThan(0);
      expect(dpr).toBeLessThan(1);
      expect(width * height * dpr * dpr).toBeLessThanOrEqual(maxBackingPixels + 0.001);
      expect(estimatedCols * estimatedRows).toBeLessThanOrEqual(42_000);
      expect(dashboardEffectiveZoom(1.1, width, height)).toBeGreaterThan(effectiveZoom);
    }

    expect(dashboardRendererDpr(1_280, 640, 3)).toBe(2);
    expect(dashboardRendererDpr(1_280, 640, 0.75)).toBe(0.75);
    expect(dashboardRendererDpr(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN)).toBe(1);
    expect(dashboardEffectiveZoom(userZoom, 1_280, 640)).toBe(userZoom);
    expect(dashboardEffectiveZoom(userZoom, 2_560, 1_440)).toBe(userZoom);
    expect(dashboardEffectiveZoom(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN))
      .toBe(userZoom);
  });

  it("keeps a newer in-flight artifact load when an older reset load rejects", async () => {
    let rejectFirst!: (reason?: unknown) => void;
    let rejectSecond!: (reason?: unknown) => void;
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => new Promise<Response>((_resolve, reject) => {
        rejectFirst = reject;
      }))
      .mockImplementationOnce(() => new Promise<Response>((_resolve, reject) => {
        rejectSecond = reject;
      }));

    try {
      dashboardRuntime.resetDashboardArtifactCache();
      const first = dashboardRuntime.loadDashboardArtifacts();
      dashboardRuntime.resetDashboardArtifactCache();
      const second = dashboardRuntime.loadDashboardArtifacts();

      rejectFirst(new Error("stale load failed"));
      await expect(first).rejects.toThrow("stale load failed");
      expect(dashboardRuntime.loadDashboardArtifacts()).toBe(second);

      rejectSecond(new Error("current load failed"));
      await expect(second).rejects.toThrow("current load failed");
    } finally {
      dashboardRuntime.resetDashboardArtifactCache();
      fetch.mockRestore();
    }
  });

  it("starts at native zoom and refits when the zoom prop changes", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 1,
        }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      expect(terminal.init).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        expect.objectContaining({ zoom: 1 }),
      );
      expect(terminal.setZoom).not.toHaveBeenCalled();
      const initialFitCalls = terminal.fitToContainer.mock.calls.length;

      await act(async () => {
        view.rerender(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 1.1,
        }));
        await flushMicrotasks();
      });

      expect(terminal.setZoom).toHaveBeenLastCalledWith(1.1);
      expect(terminal.fitToContainer.mock.calls.length).toBeGreaterThan(initialFitCalls);

      const container = screen.getByTestId("hero-agent-mail-terminal");
      Object.defineProperties(container, {
        clientWidth: { configurable: true, value: 5_120 },
        clientHeight: { configurable: true, value: 2_880 },
      });
      const [resizeObserver] = TestResizeObserver.instances;
      await act(async () => {
        resizeObserver.callback([], resizeObserver as unknown as ResizeObserver);
        await flushMicrotasks();
      });
      expect(terminal.setZoom).toHaveBeenLastCalledWith(2.2);
      expect(terminal.fitToContainer).toHaveBeenLastCalledWith(
        5_120,
        2_880,
        expect.any(Number),
      );

      const canvas = screen.getByTestId("hero-agent-mail-canvas");
      expect(canvas).toHaveClass("touch-pan-y");
      await act(async () => {
        view.rerender(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          fullscreen: true,
          zoom: 1.1,
        }));
        await flushMicrotasks();
      });
      expect(canvas).toHaveClass("touch-none");
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("fits the latest viewport and zoom when initialization resolves", async () => {
    let finishInitialization!: () => void;
    class DelayedFitTerminal extends TestTerminal {
      override init = vi.fn(() => new Promise<void>((resolve) => {
        finishInitialization = resolve;
      }));
    }
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockResolvedValue(testArtifacts(DelayedFitTerminal));

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 0.75,
        }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      expect(terminal.init).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        expect.objectContaining({ zoom: 0.75 }),
      );

      const container = screen.getByTestId("hero-agent-mail-terminal");
      Object.defineProperties(container, {
        clientWidth: { configurable: true, value: 5_120 },
        clientHeight: { configurable: true, value: 2_880 },
      });
      await act(async () => {
        view.rerender(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 0.95,
        }));
        await flushMicrotasks();
      });
      await act(async () => {
        finishInitialization();
        await flushMicrotasks();
      });

      expect(terminal.setZoom.mock.calls).toEqual([[1.9]]);
      expect(terminal.fitToContainer).toHaveBeenCalledWith(
        5_120,
        2_880,
        expect.any(Number),
      );
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("refits when display density changes without a CSS container resize", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
    let resizeListener: EventListener | null = null;
    const addEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === "resize" && typeof listener === "function") resizeListener = listener;
    });
    const removeEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === "resize" && resizeListener === listener) resizeListener = null;
    });
    let densityListener: EventListener | null = null;
    const addDensityListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === "change" && typeof listener === "function") densityListener = listener;
    });
    const removeDensityListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === "change" && densityListener === listener) densityListener = null;
    });
    const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
    const matchMedia = vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addDensityListener,
      removeEventListener: removeDensityListener,
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: matchMedia,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: { addEventListener, removeEventListener },
    });
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 1,
        }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const initialFitCalls = terminal.fitToContainer.mock.calls.length;
      expect(resizeListener).not.toBeNull();
      expect(densityListener).not.toBeNull();

      await act(async () => {
        resizeListener?.(new Event("resize"));
        await flushMicrotasks();
      });
      expect(terminal.fitToContainer.mock.calls.length).toBeGreaterThan(initialFitCalls);
      const viewportFitCalls = terminal.fitToContainer.mock.calls.length;

      await act(async () => {
        densityListener?.(new Event("change"));
        await flushMicrotasks();
      });
      expect(terminal.fitToContainer.mock.calls.length).toBeGreaterThan(viewportFitCalls);

      view.unmount();
      expect(removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(removeDensityListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(resizeListener).toBeNull();
      expect(densityListener).toBeNull();
    } finally {
      if (originalMatchMedia) {
        Object.defineProperty(window, "matchMedia", originalMatchMedia);
      } else {
        Reflect.deleteProperty(window, "matchMedia");
      }
      load.mockRestore();
      if (originalVisualViewport) {
        Object.defineProperty(window, "visualViewport", originalVisualViewport);
      } else {
        Object.defineProperty(window, "visualViewport", { configurable: true, value: undefined });
      }
      restoreEnvironment();
    }
  });

  it("publishes a browsable terminal mirror for screen readers", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: true, reducedMotion: false }));
        await flushMicrotasks();
      });

      expect(TestTerminal.instances[0]?.screenReaderMirrorText).toHaveBeenCalled();
      expect(screen.getByLabelText("Current Agent Mail terminal contents")).toHaveTextContent("test screen");
      expect(screen.getByText(/dashboard ready at 220 columns by 74 rows/i)).toHaveAttribute(
        "aria-live",
        "polite",
      );
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("debounces accessibility mirror extraction off the visual input path", async () => {
    vi.useFakeTimers();
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: true, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const [runner] = TestRunner.instances;
      terminal.drainEncodedInputs.mockReturnValue(["key"]);
      runner.step.mockReturnValue({ running: true, rendered: true, events_processed: 1, frame_idx: 2 });
      runner.takeFlatPatches.mockReturnValue({ spans: new Uint32Array([0]), cells: new Uint32Array([1]) });

      fireEvent.keyDown(screen.getByTestId("hero-agent-mail-canvas"), {
        key: "2",
        code: "Digit2",
      });
      expect(terminal.screenReaderMirrorText).toHaveBeenCalledTimes(1);

      await act(async () => {
        vi.advanceTimersByTime(100);
        await flushMicrotasks();
      });
      expect(terminal.screenReaderMirrorText).toHaveBeenCalledTimes(2);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
      vi.useRealTimers();
    }
  });

  it("suspends scheduled replay work off-screen and while paused", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const frameCallbacks: FrameRequestCallback[] = [];
    const restoreEnvironment = installAnimationEnvironment(frameCallbacks);
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [runner] = TestRunner.instances;
      const [observer] = TestIntersectionObserver.instances;
      expect(frameCallbacks).toHaveLength(1);

      act(() => {
        observer.callback(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          observer as unknown as IntersectionObserver,
        );
      });
      await act(async () => {
        frameCallbacks[0]?.(100);
        await flushMicrotasks();
      });
      expect(runner.advanceTime).not.toHaveBeenCalled();
      expect(frameCallbacks).toHaveLength(1);

      act(() => {
        observer.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          observer as unknown as IntersectionObserver,
        );
      });
      expect(frameCallbacks).toHaveLength(2);

      await act(async () => {
        view.rerender(createElement(AgentMailTerminal, { paused: true, reducedMotion: false }));
        await flushMicrotasks();
      });
      await act(async () => {
        frameCallbacks[1]?.(200);
        await flushMicrotasks();
      });
      expect(runner.advanceTime).not.toHaveBeenCalled();
      expect(frameCallbacks).toHaveLength(2);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("does not repaint the full canvas when a rendered step has an empty patch", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const frameCallbacks: FrameRequestCallback[] = [];
    const restoreEnvironment = installAnimationEnvironment(frameCallbacks);
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const [runner] = TestRunner.instances;
      runner.step.mockReturnValue({
        running: true,
        rendered: true,
        events_processed: 1,
        frame_idx: 2,
      });
      const initialRenderCount = terminal.render.mock.calls.length;

      await act(async () => {
        frameCallbacks[0]?.(100);
        await flushMicrotasks();
      });

      expect(runner.takeFlatPatches).toHaveBeenCalled();
      expect(terminal.applyPatchBatchFlat).not.toHaveBeenCalled();
      expect(terminal.render).toHaveBeenCalledTimes(initialRenderCount);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("renders reset immediately instead of waiting for the replay cadence", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const frameCallbacks: FrameRequestCallback[] = [];
    const restoreEnvironment = installAnimationEnvironment(frameCallbacks);
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      const terminalRef = createRef<AgentMailTerminalHandle>();
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, {
          ref: terminalRef,
          paused: false,
          reducedMotion: false,
        }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const [runner] = TestRunner.instances;
      runner.step.mockReturnValue({
        running: true,
        rendered: true,
        events_processed: 1,
        frame_idx: 2,
      });
      runner.takeFlatPatches.mockReturnValue({
        spans: new Uint32Array([0, 1]),
        cells: new Uint32Array([1]),
      });
      const initialRenderCount = terminal.render.mock.calls.length;

      const canvas = screen.getByTestId("hero-agent-mail-canvas");
      terminal.input.mockClear();
      fireEvent.wheel(canvas, { deltaY: 1 });
      expect(terminal.input).not.toHaveBeenCalled();

      act(() => terminalRef.current?.reset());

      expect(runner.reset).toHaveBeenCalledTimes(1);
      expect(runner.step).toHaveBeenCalledTimes(1);
      expect(terminal.applyPatchBatchFlat).toHaveBeenCalledTimes(1);
      expect(terminal.render).toHaveBeenCalledTimes(initialRenderCount + 1);

      await act(async () => {
        frameCallbacks[0]?.(16);
        await flushMicrotasks();
      });
      expect(terminal.input).not.toHaveBeenCalled();
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("coalesces wheel bursts to one terminal input per animation frame", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const frameCallbacks: FrameRequestCallback[] = [];
    const restoreEnvironment = installAnimationEnvironment(frameCallbacks);
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const canvas = screen.getByTestId("hero-agent-mail-canvas");
      terminal.input.mockClear();
      terminal.drainEncodedInputs.mockReturnValue(["wheel"]);

      fireEvent.wheel(canvas, { deltaY: 1 });
      fireEvent.wheel(canvas, { deltaY: 1 });
      fireEvent.wheel(canvas, { deltaY: 1 });
      expect(terminal.input).not.toHaveBeenCalled();

      await act(async () => {
        frameCallbacks[0]?.(16);
        await flushMicrotasks();
      });

      expect(terminal.input).toHaveBeenCalledTimes(1);
      expect(terminal.input).toHaveBeenCalledWith(expect.objectContaining({ kind: "wheel", dy: 1 }));
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("releases every initialized WASM wrapper exactly once across Strict Mode remounts", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());
    const restoreEnvironment = installAnimationEnvironment();

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let first!: ReturnType<typeof render>;
      await act(async () => {
        first = render(createElement(
          StrictMode,
          null,
          createElement(AgentMailTerminal, { paused: false, reducedMotion: false }),
        ));
        await flushMicrotasks();
      });
      first.unmount();

      let second!: ReturnType<typeof render>;
      await act(async () => {
        second = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      second.unmount();

      expect(load).toHaveBeenCalled();
      expect(TestTerminal.instances.length).toBeGreaterThanOrEqual(2);
      expect(TestRunner.instances.length).toBe(TestTerminal.instances.length);
      for (const terminal of TestTerminal.instances) {
        expect(terminal.destroy).toHaveBeenCalledTimes(1);
        expect(terminal.free).toHaveBeenCalledTimes(1);
      }
      for (const runner of TestRunner.instances) {
        expect(runner.destroy).toHaveBeenCalledTimes(1);
        expect(runner.free).toHaveBeenCalledTimes(1);
      }
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("releases a terminal whose asynchronous initialization completes after unmount", async () => {
    let finishInitialization!: () => void;
    class DelayedTerminal extends TestTerminal {
      override init = vi.fn(() => new Promise<void>((resolve) => {
        finishInitialization = resolve;
      }));
    }
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockResolvedValue(testArtifacts(DelayedTerminal));
    const restoreEnvironment = installAnimationEnvironment();

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      expect(TestTerminal.instances).toHaveLength(1);
      view.unmount();
      await act(async () => {
        finishInitialization();
        await flushMicrotasks();
      });

      const [terminal] = TestTerminal.instances;
      expect(terminal.destroy).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
      expect(TestRunner.instances).toHaveLength(0);
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("fails closed and frees the terminal when runner construction fails", async () => {
    class ThrowingRunner extends TestRunner {
      constructor() {
        super();
        throw new Error("runner constructor failed");
      }
    }
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockResolvedValue(testArtifacts(TestTerminal, ThrowingRunner));
    const restoreEnvironment = installAnimationEnvironment();

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });

      expect(screen.getByText("runner constructor failed")).toBeVisible();
      const [terminal] = TestTerminal.instances;
      expect(terminal.destroy).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
      view.unmount();
      expect(terminal.destroy).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("offers a working retry after a transient artifact failure", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockRejectedValueOnce(new Error("temporary manifest outage"))
      .mockResolvedValueOnce(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });

      const region = screen.getByTestId("hero-agent-mail-terminal");
      expect(region).toHaveAttribute("aria-busy", "false");
      expect(screen.getByText("temporary manifest outage")).toBeVisible();
      expect(screen.getByText(/Interactive Agent Mail dashboard unavailable:/i)).toHaveTextContent(
        "temporary manifest outage",
      );
      expect(screen.getByLabelText("Current Agent Mail terminal contents")).toHaveTextContent(
        "terminal contents are unavailable",
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Retry interactive dashboard" }));
        await flushMicrotasks();
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(region).toHaveAttribute("data-active-screen", "dashboard");
      expect(region).toHaveAttribute("aria-busy", "false");
      expect(screen.queryByRole("button", { name: "Retry interactive dashboard" })).not.toBeInTheDocument();
      expect(screen.getByLabelText("Current Agent Mail terminal contents")).toHaveTextContent("test screen");
      expect(TestTerminal.instances).toHaveLength(1);
      expect(TestRunner.instances).toHaveLength(1);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("fails closed when the Rust runner reports that initialization stopped", async () => {
    class StoppedRunner extends TestRunner {
      override statusJson = vi.fn(() => JSON.stringify({
        ...JSON.parse(RUNNER_STATUS),
        running: false,
      }));
      override takeLogs = vi.fn<() => unknown[]>(() => ["runner_init_error: synthetic failure"]);
    }
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockResolvedValue(testArtifacts(TestTerminal, StoppedRunner));

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });

      expect(screen.getByText(
        "Agent Mail dashboard runner failed to initialize: runner_init_error: synthetic failure",
      )).toBeVisible();
      const [runner] = TestRunner.instances;
      const [terminal] = TestTerminal.instances;
      expect(runner.free).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("surfaces terminal input exceptions instead of leaving a frozen running canvas", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const [runner] = TestRunner.instances;
      terminal.input.mockImplementationOnce(() => {
        throw new Error("terminal input failed");
      });

      await act(async () => {
        fireEvent.keyDown(screen.getByTestId("hero-agent-mail-canvas"), {
          key: "2",
          code: "Digit2",
        });
        await flushMicrotasks();
      });

      expect(screen.getByText("terminal input failed")).toBeVisible();
      expect(runner.free).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("treats embedded touch drags as page gestures and taps as terminal clicks", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [terminal] = TestTerminal.instances;
      const canvas = screen.getByTestId("hero-agent-mail-canvas");
      terminal.input.mockClear();

      fireEvent.pointerDown(canvas, {
        pointerId: 1,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      fireEvent.pointerMove(canvas, {
        pointerId: 1,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 60,
      });
      fireEvent.pointerUp(canvas, {
        pointerId: 1,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 60,
      });
      expect(terminal.input).not.toHaveBeenCalled();

      fireEvent.pointerDown(canvas, {
        pointerId: 2,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      fireEvent.pointerCancel(canvas, {
        pointerId: 2,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      expect(terminal.input).not.toHaveBeenCalled();

      fireEvent.pointerDown(canvas, {
        pointerId: 3,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      fireEvent.pointerDown(canvas, {
        pointerId: 4,
        pointerType: "touch",
        button: 0,
        clientX: 40,
        clientY: 20,
      });
      fireEvent.pointerUp(canvas, {
        pointerId: 3,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      expect(terminal.input).not.toHaveBeenCalled();

      fireEvent.pointerDown(canvas, {
        pointerId: 5,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      fireEvent.pointerUp(canvas, {
        pointerId: 5,
        pointerType: "touch",
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      const mousePhases = terminal.input.mock.calls
        .map(([input]) => input as { kind?: string; phase?: string })
        .filter((input) => input.kind === "mouse")
        .map((input) => input.phase);
      expect(mousePhases).toEqual(["down", "up"]);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("fails closed when a post-start zoom update throws", async () => {
    class ZoomFailTerminal extends TestTerminal {
      override setZoom = vi.fn(() => {
        throw new Error("zoom update failed");
      });
    }
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockResolvedValue(testArtifacts(ZoomFailTerminal));

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 0.75,
        }));
        await flushMicrotasks();
      });
      await act(async () => {
        view.rerender(createElement(AgentMailTerminal, {
          paused: false,
          reducedMotion: false,
          zoom: 0.85,
        }));
        await flushMicrotasks();
      });

      expect(screen.getByText("zoom update failed")).toBeVisible();
      const [runner] = TestRunner.instances;
      const [terminal] = TestTerminal.instances;
      expect(runner.free).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("switches to the fallback and tears down listeners after a frame exception", async () => {
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const frameCallbacks: FrameRequestCallback[] = [];
    const restoreEnvironment = installAnimationEnvironment(frameCallbacks);
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts").mockResolvedValue(testArtifacts());

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const [runner] = TestRunner.instances;
      runner.advanceTime.mockImplementationOnce(() => {
        throw new Error("frame failed");
      });
      await act(async () => {
        frameCallbacks[0]?.(100);
        await flushMicrotasks();
      });

      expect(screen.getByText("frame failed")).toBeVisible();
      expect(runner.destroy).toHaveBeenCalledTimes(1);
      expect(runner.free).toHaveBeenCalledTimes(1);
      expect(TestResizeObserver.instances[0]?.disconnect).toHaveBeenCalled();
      view.unmount();
      expect(runner.free).toHaveBeenCalledTimes(1);
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });

  it("switches to the fallback and tears down WASM after a resize exception", async () => {
    class ResizeThrowingTerminal extends TestTerminal {
      override fitToContainer = vi.fn()
        .mockReturnValueOnce({ cols: 220, rows: 74 })
        .mockImplementationOnce(() => {
          throw new Error("resize failed");
        });
    }
    TestTerminal.instances = [];
    TestRunner.instances = [];
    const restoreEnvironment = installAnimationEnvironment();
    const load = vi.spyOn(dashboardRuntime, "loadDashboardArtifacts")
      .mockResolvedValue(testArtifacts(ResizeThrowingTerminal));

    try {
      const { default: AgentMailTerminal } = await import("@/components/agent-mail-terminal");
      let view!: ReturnType<typeof render>;
      await act(async () => {
        view = render(createElement(AgentMailTerminal, { paused: false, reducedMotion: false }));
        await flushMicrotasks();
      });
      const observer = TestResizeObserver.instances[0];
      await act(async () => {
        observer.callback([], observer as unknown as ResizeObserver);
        await flushMicrotasks();
      });

      expect(screen.getByText("resize failed")).toBeVisible();
      const [runner] = TestRunner.instances;
      const [terminal] = TestTerminal.instances;
      expect(runner.free).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
      expect(observer.disconnect).toHaveBeenCalled();
      view.unmount();
      expect(runner.free).toHaveBeenCalledTimes(1);
      expect(terminal.free).toHaveBeenCalledTimes(1);
    } finally {
      load.mockRestore();
      restoreEnvironment();
    }
  });
});
