import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, StrictMode } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as dashboardRuntime from "@/lib/agent-mail-wasm";

const { validateDashboardDemoPack, validateDashboardManifest } = dashboardRuntime;

const projectRoot = process.cwd();
const manifestPath = join(projectRoot, "public/agent-mail-dashboard/manifest.v1.json");
const packPath = join(projectRoot, "public/agent-mail-dashboard/demo_pack.v1.json");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Agent Mail browser dashboard artifacts", () => {
  it("accepts the checked-in manifest and public demo pack", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const pack = validateDashboardDemoPack(readJson(packPath));

    expect(manifest.schema).toBe("agent_mail.dashboard_artifacts.v1");
    expect(pack.schema).toBe("agent_mail.demo_pack.v1");
    expect(pack.provenance.privacy_policy).toBe("agent-mail-dashboard-public-demo-v1");
    expect(pack.provenance.source_label).toMatch(/aggregate counts.*details synthetic/i);
  });

  it("matches every byte size and SHA-256 digest in the manifest", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const byteArtifacts = Object.values(manifest.artifacts).filter(
      (artifact): artifact is Required<typeof artifact> =>
        typeof artifact.bytes === "number" && typeof artifact.sha256 === "string",
    );

    for (const artifact of byteArtifacts) {
      const bytes = readFileSync(join(projectRoot, "public", artifact.url));
      expect(bytes.byteLength, artifact.url).toBe(artifact.bytes);
      expect(createHash("sha256").update(bytes).digest("hex"), artifact.url).toBe(artifact.sha256);
    }
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

  it("contains no home directories, database paths, or common credential markers", () => {
    const raw = readFileSync(packPath, "utf8");
    expect(raw).not.toMatch(/\/Users\/|\/home\/|storage\.sqlite|agent_mail\.db/i);
    expect(raw).not.toMatch(/BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|api[_-]?key|bearer\s+[a-z0-9._-]+/i);
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
  drainEncodedInputs = vi.fn(() => []);
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
  TestResizeObserver.instances = [];
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callbacks?.push(callback);
    return callbacks?.length ?? 1;
  });
  window.cancelAnimationFrame = vi.fn();
  window.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
  return () => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    window.ResizeObserver = originalResizeObserver;
  };
}

describe("AgentMailTerminal lifecycle", () => {
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
