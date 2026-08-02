/**
 * Verified loader for the Agent Mail dashboard's FrankenTUI browser build.
 *
 * The public demo is deliberately self-contained: every URL must stay under
 * `/agent-mail-dashboard/`, every byte-bearing artifact is checked against the
 * versioned manifest, and the data pack is validated before it reaches WASM.
 */

export interface DashboardArtifact {
  url: string;
  bytes?: number;
  sha256?: string;
}

export interface DashboardArtifactManifest {
  schema: "agent_mail.dashboard_artifacts.v1";
  built_at: string;
  source_revision: string;
  artifacts: {
    demo_pack: Required<DashboardArtifact>;
    dashboard_runner_js: Required<DashboardArtifact>;
    dashboard_runner_wasm: Required<DashboardArtifact>;
    renderer_js: Required<DashboardArtifact>;
    renderer_wasm: Required<DashboardArtifact>;
    terminal_font: Required<DashboardArtifact>;
    poster: DashboardArtifact;
  };
}

export interface DashboardDemoPack {
  schema: "agent_mail.demo_pack.v1";
  title: string;
  replay_label: string;
  duration_ms: number;
  loop_replay: boolean;
  provenance: {
    source_label: string;
    captured_at: string;
    source_revision: string;
    privacy_policy: string;
    content_sha256: string;
  };
  bootstrap: {
    db_stats: {
      projects: number;
      agents: number;
      messages: number;
      file_reservations: number;
      contact_links: number;
      ack_pending: number;
    };
  };
  actions: unknown[];
}

export interface DashboardRunnerStatus {
  running: boolean;
  frame_index: number;
  elapsed_ms: number;
  duration_ms: number;
  paused: boolean;
  reduced_motion: boolean;
  replay_label: string;
  source_label: string;
  content_sha256: string;
  projects: number;
  agents: number;
  messages: number;
  active_reservations: number;
  pending_acknowledgements: number;
  last_deep_link: string | null;
}

export interface FlatPatchBatch {
  spans: Uint32Array;
  cells: Uint32Array;
}

export interface DashboardRunnerInstance {
  init(): void;
  loadDemoPack(json: string): void;
  advanceTime(dtMs: number): void;
  pushEncodedInput(json: string): boolean;
  resize(cols: number, rows: number): void;
  step(): { running: boolean; rendered: boolean; events_processed: number; frame_idx: number };
  takeFlatPatches(): FlatPatchBatch;
  takeLogs(): unknown[];
  patchHash(): string | undefined;
  patchStats(): { dirty_cells: number; patch_count: number; bytes_uploaded: number } | null;
  statusJson(): string;
  setPaused(paused: boolean): void;
  setReducedMotion(reducedMotion: boolean): void;
  reset(): void;
  destroy(): void;
  free(): void;
}

export interface FrankenTermInstance {
  init(canvas: HTMLCanvasElement, options?: Record<string, unknown> | null): Promise<void>;
  fitToContainer(widthCss: number, heightCss: number, dpr: number): {
    cols: number;
    rows: number;
  };
  input(event: unknown): void;
  drainEncodedInputs(): unknown[];
  applyPatchBatchFlat(spans: Uint32Array, cells: Uint32Array): void;
  render(): void;
  resize(cols: number, rows: number): void;
  setAccessibility(options: Record<string, unknown>): void;
  screenReaderMirrorText(): string;
  drainAccessibilityAnnouncements(): unknown[];
  destroy(): void;
  free(): void;
}

interface RunnerModule {
  default(input?: { module_or_path: BufferSource | WebAssembly.Module }): Promise<unknown>;
  AgentMailDashboardRunner: new (cols: number, rows: number) => DashboardRunnerInstance;
}

interface RendererModule {
  default(input?: { module_or_path: BufferSource | WebAssembly.Module }): Promise<unknown>;
  FrankenTermWeb: new () => FrankenTermInstance;
}

export interface LoadedDashboardArtifacts {
  manifest: DashboardArtifactManifest;
  pack: DashboardDemoPack;
  packJson: string;
  AgentMailDashboardRunner: RunnerModule["AgentMailDashboardRunner"];
  FrankenTermWeb: RendererModule["FrankenTermWeb"];
}

const MANIFEST_URL = "/agent-mail-dashboard/manifest.v1.json";
const ARTIFACT_ROOT = "/agent-mail-dashboard/";
const EXPECTED_PRIVACY_POLICY = "agent-mail-dashboard-public-demo-v1";

let cachedLoad: Promise<LoadedDashboardArtifacts> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requirePublicArtifactUrl(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.startsWith(ARTIFACT_ROOT) || value.includes("..")) {
    throw new Error(`${label} must be a local ${ARTIFACT_ROOT} URL`);
  }
  return value;
}

function requirePosterUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/images/") || value.includes("..")) {
    throw new Error("poster.url must be a local /images/ URL");
  }
  return value;
}

function requireArtifact(value: unknown, label: string): Required<DashboardArtifact> {
  if (!isRecord(value)) throw new Error(`${label} is missing`);
  const url = requirePublicArtifactUrl(value.url, `${label}.url`);
  const bytes = value.bytes;
  const sha256 = value.sha256;
  if (!Number.isSafeInteger(bytes) || (bytes as number) <= 0) {
    throw new Error(`${label}.bytes must be a positive integer`);
  }
  if (typeof sha256 !== "string" || !/^[a-f0-9]{64}$/.test(sha256)) {
    throw new Error(`${label}.sha256 must be a lowercase SHA-256 digest`);
  }
  return { url, bytes: bytes as number, sha256 };
}

export function validateDashboardManifest(value: unknown): DashboardArtifactManifest {
  if (!isRecord(value) || value.schema !== "agent_mail.dashboard_artifacts.v1") {
    throw new Error("Unsupported Agent Mail dashboard artifact manifest");
  }
  if (typeof value.built_at !== "string" || !Number.isFinite(Date.parse(value.built_at))) {
    throw new Error("Dashboard manifest built_at is invalid");
  }
  if (typeof value.source_revision !== "string" || !/^[a-f0-9]{40}$/.test(value.source_revision)) {
    throw new Error("Dashboard manifest source_revision is invalid");
  }
  if (!isRecord(value.artifacts)) throw new Error("Dashboard manifest artifacts are missing");
  const posterValue = value.artifacts.poster;
  if (!isRecord(posterValue)) throw new Error("Dashboard poster artifact is missing");

  return {
    schema: value.schema,
    built_at: value.built_at,
    source_revision: value.source_revision,
    artifacts: {
      demo_pack: requireArtifact(value.artifacts.demo_pack, "demo_pack"),
      dashboard_runner_js: requireArtifact(value.artifacts.dashboard_runner_js, "dashboard_runner_js"),
      dashboard_runner_wasm: requireArtifact(value.artifacts.dashboard_runner_wasm, "dashboard_runner_wasm"),
      renderer_js: requireArtifact(value.artifacts.renderer_js, "renderer_js"),
      renderer_wasm: requireArtifact(value.artifacts.renderer_wasm, "renderer_wasm"),
      terminal_font: requireArtifact(value.artifacts.terminal_font, "terminal_font"),
      poster: { url: requirePosterUrl(posterValue.url) },
    },
  };
}

export function validateDashboardDemoPack(value: unknown): DashboardDemoPack {
  if (!isRecord(value) || value.schema !== "agent_mail.demo_pack.v1") {
    throw new Error("Unsupported Agent Mail dashboard demo pack");
  }
  if (!isRecord(value.provenance) || value.provenance.privacy_policy !== EXPECTED_PRIVACY_POLICY) {
    throw new Error("Dashboard demo pack privacy policy is missing or unsupported");
  }
  if (typeof value.provenance.source_label !== "string" ||
      !value.provenance.source_label.includes("aggregate counts") ||
      !value.provenance.source_label.includes("details synthetic")) {
    throw new Error("Dashboard demo pack must identify aggregate and synthetic data boundaries");
  }
  if (typeof value.provenance.content_sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.provenance.content_sha256)) {
    throw new Error("Dashboard demo pack content digest is invalid");
  }
  if (!Number.isSafeInteger(value.duration_ms) || (value.duration_ms as number) <= 0 ||
      (value.duration_ms as number) > 300_000) {
    throw new Error("Dashboard demo pack duration is invalid");
  }
  if (!Array.isArray(value.actions) || value.actions.length > 10_000) {
    throw new Error("Dashboard demo pack actions are invalid");
  }
  if (!isRecord(value.bootstrap) || !isRecord(value.bootstrap.db_stats)) {
    throw new Error("Dashboard demo pack bootstrap metrics are missing");
  }
  return value as unknown as DashboardDemoPack;
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is required to verify dashboard assets");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function fetchVerifiedArtifact(artifact: Required<DashboardArtifact>): Promise<ArrayBuffer> {
  const response = await fetch(artifact.url, {
    credentials: "same-origin",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GET ${artifact.url} returned ${response.status}`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== artifact.bytes) {
    throw new Error(`${artifact.url} size mismatch: expected ${artifact.bytes}, got ${bytes.byteLength}`);
  }
  const actual = await sha256Hex(bytes);
  if (actual !== artifact.sha256) throw new Error(`${artifact.url} failed SHA-256 verification`);
  return bytes;
}

async function importPublicModule<T>(url: string): Promise<T> {
  // webpackIgnore keeps the generated wasm-bindgen module at its public URL so
  // its own import.meta.url remains correct. The URL was manifest-validated.
  return import(/* webpackIgnore: true */ url) as Promise<T>;
}

async function loadFont(bytes: ArrayBuffer): Promise<void> {
  if (typeof document === "undefined" || typeof FontFace === "undefined") return;
  const font = new FontFace("Pragmasevka NF", bytes, {
    display: "block",
    style: "normal",
    weight: "400",
  });
  document.fonts.add(font);
  await font.load();
  await document.fonts.ready;
}

async function loadDashboardArtifactsUncached(): Promise<LoadedDashboardArtifacts> {
  const manifestResponse = await fetch(MANIFEST_URL, {
    credentials: "same-origin",
    cache: "no-cache",
    signal: AbortSignal.timeout(15_000),
  });
  if (!manifestResponse.ok) throw new Error(`GET ${MANIFEST_URL} returned ${manifestResponse.status}`);
  const manifest = validateDashboardManifest(await manifestResponse.json());
  const artifacts = manifest.artifacts;

  const [packBytes, runnerJs, runnerWasm, rendererJs, rendererWasm, fontBytes] = await Promise.all([
    fetchVerifiedArtifact(artifacts.demo_pack),
    fetchVerifiedArtifact(artifacts.dashboard_runner_js),
    fetchVerifiedArtifact(artifacts.dashboard_runner_wasm),
    fetchVerifiedArtifact(artifacts.renderer_js),
    fetchVerifiedArtifact(artifacts.renderer_wasm),
    fetchVerifiedArtifact(artifacts.terminal_font),
  ]);

  // Keep the verified JS buffers alive through import so every manifest entry
  // participates in the gate even though native import owns module execution.
  if (runnerJs.byteLength === 0 || rendererJs.byteLength === 0) {
    throw new Error("Dashboard JavaScript modules are empty");
  }

  const packJson = new TextDecoder("utf-8", { fatal: true }).decode(packBytes);
  const pack = validateDashboardDemoPack(JSON.parse(packJson));

  const [runnerModule, rendererModule] = await Promise.all([
    importPublicModule<RunnerModule>(artifacts.dashboard_runner_js.url),
    importPublicModule<RendererModule>(artifacts.renderer_js.url),
    loadFont(fontBytes),
  ]);
  await Promise.all([
    runnerModule.default({ module_or_path: runnerWasm }),
    rendererModule.default({ module_or_path: rendererWasm }),
  ]);

  return {
    manifest,
    pack,
    packJson,
    AgentMailDashboardRunner: runnerModule.AgentMailDashboardRunner,
    FrankenTermWeb: rendererModule.FrankenTermWeb,
  };
}

export function loadDashboardArtifacts(): Promise<LoadedDashboardArtifacts> {
  if (!cachedLoad) {
    cachedLoad = loadDashboardArtifactsUncached();
    cachedLoad.catch(() => {
      cachedLoad = null;
    });
  }
  return cachedLoad;
}

export function resetDashboardArtifactCache(): void {
  cachedLoad = null;
}
