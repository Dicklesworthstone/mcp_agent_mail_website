/**
 * Verified loader for the Agent Mail dashboard's FrankenTUI browser build.
 *
 * The public demo is deliberately self-contained: runtime/data/font URLs stay
 * under `/agent-mail-dashboard/` and their bytes are checked against the
 * versioned manifest before use. The immediate static poster is instead pinned
 * to one same-origin URL so fallback paint does not wait on JavaScript hashing.
 * The data pack is validated before it reaches WASM.
 */

export interface DashboardArtifact {
  url: string;
  bytes?: number;
  sha256?: string;
}

export interface DashboardArtifactManifest {
  schema: "agent_mail.dashboard_artifacts.v1";
  built_at: string;
  runner_source_revision: string;
  runner_ftui_source_revision: string;
  renderer_source_revision: string;
  artifacts: {
    demo_pack: Required<DashboardArtifact>;
    dashboard_runner_js: Required<DashboardArtifact>;
    dashboard_runner_wasm: Required<DashboardArtifact>;
    renderer_js: Required<DashboardArtifact>;
    renderer_wasm: Required<DashboardArtifact>;
    terminal_font: Required<DashboardArtifact>;
    poster: { url: string };
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
  active_screen: string;
  dashboard_filter: string;
  help_visible: boolean;
  interaction_revision: number;
  selected_row: number;
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
  setZoom(zoom: number): unknown;
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

interface WasmBindgenModule {
  default(input?: { module_or_path: BufferSource | WebAssembly.Module }): Promise<unknown>;
}

export interface LoadedDashboardArtifacts {
  manifest: DashboardArtifactManifest;
  packJson: string;
  AgentMailDashboardRunner: RunnerModule["AgentMailDashboardRunner"];
  FrankenTermWeb: RendererModule["FrankenTermWeb"];
}

const MANIFEST_URL = "/agent-mail-dashboard/manifest.v1.json";
const ARTIFACT_ROOT = "/agent-mail-dashboard/";
const EXPECTED_PRIVACY_POLICY = "agent-mail-dashboard-public-demo-v1";
const MAX_DEMO_ACTIONS = 10_000;
const MAX_DEMO_DURATION_MS = 30 * 60 * 1_000;
export const DASHBOARD_MANIFEST_BYTE_LIMIT = 64 * 1024;
export const DASHBOARD_ARTIFACT_STAGE_TIMEOUT_MS = 15_000;
const ARTIFACT_BYTE_LIMITS = {
  // Rust bounds the JSON itself at 8 MiB; the exporter appends one trailing
  // newline when it publishes the file.
  demo_pack: 8 * 1024 * 1024 + 1,
  dashboard_runner_js: 512 * 1024,
  dashboard_runner_wasm: 8 * 1024 * 1024,
  renderer_js: 1024 * 1024,
  renderer_wasm: 8 * 1024 * 1024,
  terminal_font: 2 * 1024 * 1024,
} as const;
export const DASHBOARD_POSTER_URL = "/images/agent-mail-dashboard-poster-placeholder.svg";

let cachedLoad: Promise<LoadedDashboardArtifacts> | null = null;
let activeLoadToken: symbol | null = null;
let installedDashboardFont: { digest: string; face: FontFace } | null = null;
let desiredDashboardFontDigest: string | null = null;
let revalidateArtifactCacheAfterFailure = false;

export function withDashboardArtifactStageTimeout<T>(
  operation: PromiseLike<T>,
  label: string,
  timeoutMs = DASHBOARD_ARTIFACT_STAGE_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timeout = globalThis.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`${label} did not finish within ${timeoutMs}ms`));
    }, timeoutMs);

    void Promise.resolve(operation).then(
      (value) => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timeout);
        resolve(value);
      },
      (cause) => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timeout);
        reject(cause);
      },
    );
  });
}

export async function initializeDashboardWasmModules<
  Runner extends WasmBindgenModule,
  Renderer extends WasmBindgenModule,
>(
  runnerModulePromise: Promise<Runner>,
  runnerCompiledPromise: Promise<WebAssembly.Module>,
  rendererModulePromise: Promise<Renderer>,
  rendererCompiledPromise: Promise<WebAssembly.Module>,
): Promise<{ runnerModule: Runner; rendererModule: Renderer }> {
  // Each engine starts the instant its own verified module and compiled WASM
  // are ready. Neither engine waits for the other, the font, or the demo pack.
  const runnerReadyPromise = Promise.all([runnerModulePromise, runnerCompiledPromise])
    .then(async ([runnerModule, runnerCompiled]) => {
      await withDashboardArtifactStageTimeout(
        runnerModule.default({ module_or_path: runnerCompiled }),
        "Agent Mail dashboard runner WASM initialization",
      );
      return runnerModule;
    });
  const rendererReadyPromise = Promise.all([rendererModulePromise, rendererCompiledPromise])
    .then(async ([rendererModule, rendererCompiled]) => {
      await withDashboardArtifactStageTimeout(
        rendererModule.default({ module_or_path: rendererCompiled }),
        "FrankenTerm renderer WASM initialization",
      );
      return rendererModule;
    });

  const [runnerModule, rendererModule] = await Promise.all([
    runnerReadyPromise,
    rendererReadyPromise,
  ]);
  return { runnerModule, rendererModule };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireLocalAssetUrl(value: unknown, label: string, root: string): string {
  if (typeof value !== "string" || value.length > 2_048 || !value.startsWith(root)) {
    throw new Error(`${label} must be a local ${root} URL`);
  }
  let decoded = value;
  try {
    while (true) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    throw new Error(`${label} must be a local ${root} URL`);
  }
  const parsed = new URL(decoded, "https://agent-mail.invalid");
  const pathSegments = parsed.pathname.split("/");
  if (
    parsed.origin !== "https://agent-mail.invalid" ||
    !parsed.pathname.startsWith(root) ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    decoded.includes("\0") ||
    decoded.includes("\\") ||
    pathSegments.includes("..")
  ) {
    throw new Error(`${label} must be a local ${root} URL`);
  }
  return value;
}

function requirePublicArtifactUrl(value: unknown, label: string): string {
  return requireLocalAssetUrl(value, label, ARTIFACT_ROOT);
}

function requirePosterUrl(value: unknown): string {
  const url = requireLocalAssetUrl(value, "poster.url", "/images/");
  if (url !== DASHBOARD_POSTER_URL) {
    throw new Error(`poster.url must match the dashboard fallback ${DASHBOARD_POSTER_URL}`);
  }
  return url;
}

function requireArtifact(
  value: unknown,
  label: keyof typeof ARTIFACT_BYTE_LIMITS,
): Required<DashboardArtifact> {
  if (!isRecord(value)) throw new Error(`${label} is missing`);
  const url = requirePublicArtifactUrl(value.url, `${label}.url`);
  const bytes = value.bytes;
  const sha256 = value.sha256;
  if (!Number.isSafeInteger(bytes) || (bytes as number) <= 0) {
    throw new Error(`${label}.bytes must be a positive integer`);
  }
  if ((bytes as number) > ARTIFACT_BYTE_LIMITS[label]) {
    throw new Error(`${label}.bytes exceeds its browser safety limit`);
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
  for (const field of [
    "runner_source_revision",
    "runner_ftui_source_revision",
    "renderer_source_revision",
  ] as const) {
    if (typeof value[field] !== "string" || !/^[a-f0-9]{40}$/.test(value[field])) {
      throw new Error(`Dashboard manifest ${field} is invalid`);
    }
  }
  if (!isRecord(value.artifacts)) throw new Error("Dashboard manifest artifacts are missing");
  const posterValue = value.artifacts.poster;
  if (!isRecord(posterValue)) throw new Error("Dashboard poster artifact is missing");

  return {
    schema: value.schema,
    built_at: value.built_at,
    runner_source_revision: value.runner_source_revision as string,
    runner_ftui_source_revision: value.runner_ftui_source_revision as string,
    renderer_source_revision: value.renderer_source_revision as string,
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

export function validateDashboardDemoPack(
  value: unknown,
  expectedSourceRevision?: string,
): DashboardDemoPack {
  // This browser preflight intentionally mirrors only the cheap outer envelope,
  // provenance boundary, and global duration/action caps. The digest-pinned pack
  // then goes through Rust's authoritative typed validator, which owns nested
  // node limits, per-timestamp action limits, field safety, ordering, and its
  // canonical content-digest check. Duplicating that full schema here would make
  // the publication path depend on two independently evolving validators.
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
  if (typeof value.provenance.source_revision !== "string" ||
      !/^[a-f0-9]{40}$/.test(value.provenance.source_revision)) {
    throw new Error("Dashboard demo pack source revision is invalid");
  }
  if (expectedSourceRevision !== undefined && value.provenance.source_revision !== expectedSourceRevision) {
    throw new Error("Dashboard demo pack source revision does not match its artifact manifest");
  }
  if (!Number.isSafeInteger(value.duration_ms) || (value.duration_ms as number) <= 0 ||
      (value.duration_ms as number) > MAX_DEMO_DURATION_MS) {
    throw new Error("Dashboard demo pack duration is invalid");
  }
  if (!Array.isArray(value.actions) || value.actions.length > MAX_DEMO_ACTIONS) {
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

async function readBoundedResponseBody(
  response: Response,
  maxBytes: number,
  label: string,
): Promise<ArrayBuffer> {
  const contentLengthHeader = response.headers.get("content-length");
  let contentLength: number | null = null;
  if (contentLengthHeader !== null) {
    if (!/^(?:0|[1-9][0-9]*)$/.test(contentLengthHeader)) {
      throw new Error(`${label} returned an invalid Content-Length header`);
    }
    contentLength = Number(contentLengthHeader);
    if (!Number.isSafeInteger(contentLength)) {
      throw new Error(`${label} returned an invalid Content-Length header`);
    }
  }

  const reader = response.body?.getReader();
  if (!reader) {
    if (contentLength !== null && contentLength > maxBytes) {
      throw new Error(`${label} exceeds its ${maxBytes}-byte browser safety limit`);
    }
    return new ArrayBuffer(0);
  }

  let readerCancelled = false;
  const cancelReader = (reason: Error) => {
    if (readerCancelled) return;
    readerCancelled = true;
    try {
      void reader.cancel(reason).catch(() => {
        // Preserve the validation error that required cancellation.
      });
    } catch {
      // Preserve the validation error that required cancellation.
    }
  };

  try {
    if (contentLength !== null && contentLength > maxBytes) {
      const error = new Error(`${label} exceeds its ${maxBytes}-byte browser safety limit`);
      cancelReader(error);
      throw error;
    }

    // Copy each network chunk directly into one manifest-bounded allocation.
    // Retaining every chunk and then concatenating would briefly double the
    // memory cost of the two WASM binaries during startup.
    const bytes = new Uint8Array(maxBytes);
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;
      if (value.byteLength > maxBytes - totalBytes) {
        const error = new Error(`${label} exceeds its ${maxBytes}-byte browser safety limit`);
        cancelReader(error);
        throw error;
      }
      bytes.set(value, totalBytes);
      totalBytes += value.byteLength;
    }

    return totalBytes === bytes.byteLength
      ? bytes.buffer
      : bytes.slice(0, totalBytes).buffer;
  } catch (cause) {
    cancelReader(cause instanceof Error ? cause : new Error(String(cause)));
    throw cause;
  } finally {
    reader.releaseLock();
  }
}

async function fetchVerifiedArtifact(
  artifact: Required<DashboardArtifact>,
  cache: "force-cache" | "reload",
): Promise<ArrayBuffer> {
  // The digest participates in the browser cache key. A visitor who loaded an
  // older deployment can therefore never pair its unversioned artifact body
  // with a freshly revalidated manifest from a newer deployment.
  const requestUrl = `${artifact.url}?sha256=${artifact.sha256}`;
  const response = await fetch(requestUrl, {
    credentials: "omit",
    cache,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GET ${artifact.url} returned ${response.status}`);
  const bytes = await readBoundedResponseBody(response, artifact.bytes, artifact.url);
  if (bytes.byteLength !== artifact.bytes) {
    throw new Error(`${artifact.url} size mismatch: expected ${artifact.bytes}, got ${bytes.byteLength}`);
  }
  const actual = await withDashboardArtifactStageTimeout(
    sha256Hex(bytes),
    `${artifact.url} SHA-256 verification`,
  );
  if (actual !== artifact.sha256) throw new Error(`${artifact.url} failed SHA-256 verification`);
  return bytes;
}

async function importVerifiedModule<T>(bytes: ArrayBuffer, label: string): Promise<T> {
  const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  try {
    return await withDashboardArtifactStageTimeout(
      import(/* webpackIgnore: true */ moduleUrl) as Promise<T>,
      label,
    );
  } finally {
    // A timed-out dynamic import may still settle later, but the blob URL no
    // longer needs to remain registered once this attempt has failed closed.
    URL.revokeObjectURL(moduleUrl);
  }
}

async function loadFont(bytes: ArrayBuffer, digest: string, loadToken: symbol): Promise<void> {
  if (typeof document === "undefined" || typeof FontFace === "undefined") return;
  if (activeLoadToken !== loadToken) return;
  if (installedDashboardFont?.digest === digest) return;
  const font = new FontFace("Pragmasevka NF", bytes, {
    display: "block",
    style: "normal",
    weight: "400",
  });
  const loaded = await font.load();
  // Register only a successfully decoded face. Failed retries must not leave
  // a broken face in the document set, and repeated partial loads of the same
  // manifest should not accumulate duplicates.
  if (activeLoadToken !== loadToken || desiredDashboardFontDigest !== digest) return;
  if (installedDashboardFont?.digest === digest) return;
  if (installedDashboardFont) document.fonts.delete(installedDashboardFont.face);
  document.fonts.add(loaded);
  installedDashboardFont = { digest, face: loaded };
}

async function loadDashboardArtifactsUncached(
  loadToken: symbol,
  artifactCacheMode: "force-cache" | "reload",
): Promise<LoadedDashboardArtifacts> {
  const manifestResponse = await fetch(MANIFEST_URL, {
    credentials: "omit",
    cache: "no-cache",
    signal: AbortSignal.timeout(15_000),
  });
  if (!manifestResponse.ok) throw new Error(`GET ${MANIFEST_URL} returned ${manifestResponse.status}`);
  const manifestBytes = await readBoundedResponseBody(
    manifestResponse,
    DASHBOARD_MANIFEST_BYTE_LIMIT,
    MANIFEST_URL,
  );
  const manifestJson = new TextDecoder("utf-8", { fatal: true }).decode(manifestBytes);
  const manifest = validateDashboardManifest(JSON.parse(manifestJson));
  const artifacts = manifest.artifacts;
  if (activeLoadToken === loadToken) {
    // Claim the desired face as soon as the current manifest is known. A
    // slower, invalidated load must not replace a newer deployment's font
    // merely because its font response happens to arrive last.
    desiredDashboardFontDigest = artifacts.terminal_font.sha256;
  }

  // Start each consumer as soon as its own verified bytes arrive. This keeps a
  // slower artifact from unnecessarily blocking module import, WASM compile,
  // pack validation, or font loading for every other artifact.
  const packPromise = fetchVerifiedArtifact(artifacts.demo_pack, artifactCacheMode).then((packBytes) => {
    const json = new TextDecoder("utf-8", { fatal: true }).decode(packBytes);
    // JavaScript validates the public boundary, then drops the parsed object;
    // Rust remains the authoritative typed consumer of the original bytes.
    validateDashboardDemoPack(JSON.parse(json), manifest.runner_source_revision);
    return json;
  });
  const runnerModulePromise = fetchVerifiedArtifact(artifacts.dashboard_runner_js, artifactCacheMode)
    .then((bytes) => importVerifiedModule<RunnerModule>(
      bytes,
      "Agent Mail dashboard runner module import",
    ));
  const runnerCompiledPromise = fetchVerifiedArtifact(artifacts.dashboard_runner_wasm, artifactCacheMode)
    .then((bytes) => withDashboardArtifactStageTimeout(
      WebAssembly.compile(bytes),
      "Agent Mail dashboard runner WASM compilation",
    ));
  const rendererModulePromise = fetchVerifiedArtifact(artifacts.renderer_js, artifactCacheMode)
    .then((bytes) => importVerifiedModule<RendererModule>(
      bytes,
      "FrankenTerm renderer module import",
    ));
  const rendererCompiledPromise = fetchVerifiedArtifact(artifacts.renderer_wasm, artifactCacheMode)
    .then((bytes) => withDashboardArtifactStageTimeout(
      WebAssembly.compile(bytes),
      "FrankenTerm renderer WASM compilation",
    ));
  const fontPromise = fetchVerifiedArtifact(artifacts.terminal_font, artifactCacheMode)
    .then((bytes) => withDashboardArtifactStageTimeout(
      loadFont(bytes, artifacts.terminal_font.sha256, loadToken),
      "Agent Mail dashboard terminal font initialization",
    ));

  const modulesPromise = initializeDashboardWasmModules(
    runnerModulePromise,
    runnerCompiledPromise,
    rendererModulePromise,
    rendererCompiledPromise,
  );
  const [modules, packJson] = await Promise.all([
    modulesPromise,
    packPromise,
    fontPromise,
  ]);

  return {
    manifest,
    packJson,
    AgentMailDashboardRunner: modules.runnerModule.AgentMailDashboardRunner,
    FrankenTermWeb: modules.rendererModule.FrankenTermWeb,
  };
}

export function loadDashboardArtifacts(): Promise<LoadedDashboardArtifacts> {
  if (!cachedLoad) {
    const loadToken = Symbol("dashboard-artifact-load");
    activeLoadToken = loadToken;
    const artifactCacheMode = revalidateArtifactCacheAfterFailure ? "reload" : "force-cache";
    const pending = loadDashboardArtifactsUncached(loadToken, artifactCacheMode);
    cachedLoad = pending;
    void pending.then(
      () => {
        if (cachedLoad === pending) revalidateArtifactCacheAfterFailure = false;
      },
      () => {
        // A stale rejection must not erase a newer load installed after an
        // explicit cache reset. A current rejection does force the next load
        // past any corrupt force-cache response for the same digest URL.
        if (cachedLoad === pending) {
          cachedLoad = null;
          revalidateArtifactCacheAfterFailure = true;
          if (activeLoadToken === loadToken) {
            activeLoadToken = null;
            desiredDashboardFontDigest = null;
          }
        }
      },
    );
  }
  return cachedLoad;
}

export function resetDashboardArtifactCache(): void {
  cachedLoad = null;
  activeLoadToken = null;
  desiredDashboardFontDigest = null;
  revalidateArtifactCacheAfterFailure = false;
}
