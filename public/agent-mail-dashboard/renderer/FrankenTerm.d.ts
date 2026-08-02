/* tslint:disable */
/* eslint-disable */

/**
 * Web/WASM terminal surface.
 *
 * This is the minimal JS-facing API surface. Implementation will evolve to:
 * - own a WebGPU renderer (glyph atlas + instancing),
 * - own web input capture + IME/clipboard,
 * - accept either VT/ANSI byte streams (`feed`) or direct cell diffs
 *   (`applyPatch`) for ftui-web mode.
 */
export class FrankenTermWeb {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Suggested host-side CSS classes for accessibility modes.
     */
    accessibilityClassNames(): Array<any>;
    /**
     * Expose a host-friendly DOM mirror snapshot for ARIA wiring.
     *
     * Shape:
     * `{ role, ariaMultiline, ariaLive, ariaAtomic, tabIndex, focused, focusVisible,
     *    screenReader, highContrast, reducedMotion, value, cursorOffset,
     *    selectionStart, selectionEnd }`
     */
    accessibilityDomSnapshot(): any;
    /**
     * Return current accessibility preferences.
     *
     * Shape:
     * `{ screenReader, highContrast, reducedMotion, focused, pendingAnnouncements }`
     */
    accessibilityState(): any;
    /**
     * Apply a cell patch (ftui-web mode).
     *
     * Accepts a JS object: `{ offset: number, cells: [{bg, fg, glyph, attrs}] }`.
     * When a renderer is initialized, only the patched cells are uploaded to
     * the GPU. Without a renderer, patches still update the in-memory shadow
     * state so host-side logic (search/link lookup/evidence) remains usable.
     */
    applyPatch(patch: any): void;
    /**
     * Apply multiple cell patches (ftui-web mode).
     *
     * Accepts a JS array:
     * `[{ offset: number, cells: [{bg, fg, glyph, attrs}] }, ...]`.
     *
     * This is optimized for `ftui-web` patch runs so hosts can forward a
     * complete present step with one JS→WASM call.
     */
    applyPatchBatch(patches: any): void;
    /**
     * Apply multiple cell patches from flat payload arrays (ftui-web fast path).
     *
     * - `spans`: `Uint32Array` in `[offset, len, offset, len, ...]` order
     * - `cells`: `Uint32Array` in `[bg, fg, glyph, attrs, ...]` order
     *
     * `len` is measured in cells (not `u32` words).
     */
    applyPatchBatchFlat(spans: Uint32Array, cells: Uint32Array): void;
    /**
     * Clear search query/results and remove search highlight.
     */
    clearSearch(): void;
    clearSelection(): void;
    /**
     * Return selected text for host-managed clipboard writes.
     *
     * Returns `None` when there is no active non-empty selection.
     */
    copySelection(): string | undefined;
    /**
     * Explicit teardown for JS callers. Drops GPU resources and clears
     * internal references so the canvas can be reclaimed.
     */
    destroy(): void;
    /**
     * Drain queued live-region announcements for host-side screen-reader wiring.
     */
    drainAccessibilityAnnouncements(): Array<any>;
    /**
     * Drain queued VT-compatible input byte chunks for remote PTY forwarding.
     */
    drainEncodedInputBytes(): Array<any>;
    /**
     * Drain queued, normalized input events as JSON strings.
     */
    drainEncodedInputs(): Array<any>;
    /**
     * Drain queued hyperlink click events detected from normalized mouse input.
     *
     * Each entry has:
     * `{x, y, button, linkId, source, url, openAllowed, openReason}`.
     */
    drainLinkClicks(): Array<any>;
    /**
     * Drain queued link clicks into JSONL lines for deterministic E2E logs.
     *
     * Host code can persist the returned lines directly into an E2E JSONL log.
     */
    drainLinkClicksJsonl(run_id: string, seed: bigint, timestamp: string): Array<any>;
    /**
     * Extract selected text from current shadow cells (for copy workflows).
     */
    extractSelectionText(): string;
    /**
     * Feed a VT/ANSI byte stream (remote mode).
     */
    feed(_data: Uint8Array): void;
    /**
     * Fit the grid to a CSS-pixel container using current font metrics.
     *
     * `container_width_css` and `container_height_css` are CSS pixels.
     * `dpr` lets callers pass the latest `window.devicePixelRatio`.
     */
    fitToContainer(container_width_css: number, container_height_css: number, dpr: number): any;
    /**
     * Initialize the terminal surface with an existing `<canvas>`.
     *
     * Creates the WebGPU renderer, performing adapter/device negotiation.
     * Exported as an async JS function returning a Promise.
     */
    init(canvas: HTMLCanvasElement, options?: any | null): Promise<void>;
    /**
     * Accepts DOM-derived keyboard/mouse/touch events.
     *
     * This method expects an `InputEvent`-shaped JS object (not a raw DOM event),
     * with a `kind` discriminator and normalized cell coordinates where relevant.
     *
     * The event is normalized to a stable JSON encoding suitable for record/replay,
     * then queued for downstream consumption (e.g. feeding `ftui-web`).
     */
    input(event: any): void;
    /**
     * Return hyperlink ID at a given grid cell (0 if none / out of bounds).
     */
    linkAt(x: number, y: number): number;
    /**
     * Return current link open policy snapshot.
     */
    linkOpenPolicy(): any;
    /**
     * Return plaintext auto-detected URL at a given grid cell, if present.
     */
    linkUrlAt(x: number, y: number): string | undefined;
    constructor();
    /**
     * Queue pasted text as terminal input bytes.
     *
     * Browser clipboard APIs require trusted user gestures; hosts should read
     * clipboard content in JS and pass the text here for deterministic VT encoding.
     */
    pasteText(text: string): void;
    /**
     * Request a frame render. Encodes and submits a WebGPU draw pass.
     */
    render(): void;
    /**
     * Resize the terminal in logical grid coordinates (cols/rows).
     */
    resize(cols: number, rows: number): void;
    /**
     * Build plain-text viewport mirror for screen readers.
     */
    screenReaderMirrorText(): string;
    /**
     * Jump to the next search match (wrap at end) and update highlight overlay.
     *
     * Returns current search state.
     */
    searchNext(): any;
    /**
     * Jump to the previous search match (wrap at beginning) and update highlight overlay.
     *
     * Returns current search state.
     */
    searchPrev(): any;
    /**
     * Return search state snapshot as a JS object.
     *
     * Shape:
     * `{ query, normalizedQuery, caseSensitive, normalizeUnicode, matchCount,
     *    activeMatchIndex, activeLine, activeStart, activeEnd }`
     */
    searchState(): any;
    /**
     * Update accessibility preferences from a JS object.
     *
     * Supported keys:
     * - `screenReader` / `screen_reader`: boolean
     * - `highContrast` / `high_contrast`: boolean
     * - `reducedMotion` / `reduced_motion`: boolean
     * - `announce`: string (optional live-region message)
     */
    setAccessibility(options: any): void;
    /**
     * Configure cursor overlay.
     *
     * - `offset`: linear cell offset (`row * cols + col`), or `< 0` to clear.
     * - `style`: `0=none`, `1=block`, `2=bar`, `3=underline`.
     */
    setCursor(offset: number, style: number): void;
    setHoveredLinkId(link_id: number): void;
    /**
     * Configure host-side link open policy.
     *
     * Supported keys:
     * - `allowHttp` / `allow_http`: bool
     * - `allowHttps` / `allow_https`: bool
     * - `allowedHosts` / `allowed_hosts`: string[]
     * - `blockedHosts` / `blocked_hosts`: string[]
     */
    setLinkOpenPolicy(options: any): void;
    /**
     * Update DPR + zoom scaling while preserving current grid size.
     *
     * Returns deterministic geometry snapshot:
     * `{ cols, rows, pixelWidth, pixelHeight, cellWidthPx, cellHeightPx, dpr, zoom }`.
     */
    setScale(dpr: number, zoom: number): any;
    /**
     * Build or refresh search results over the current shadow grid.
     *
     * `options` keys:
     * - `caseSensitive` / `case_sensitive`: boolean (default false)
     * - `normalizeUnicode` / `normalize_unicode`: boolean (default true)
     *
     * Returns current search state:
     * `{query, normalizedQuery, caseSensitive, normalizeUnicode, matchCount,
     *   activeMatchIndex, activeLine, activeStart, activeEnd}`
     */
    setSearchQuery(query: string, options?: any | null): any;
    /**
     * Configure selection overlay using a `[start, end)` cell-offset range.
     *
     * Pass negative values to clear selection.
     */
    setSelectionRange(start: number, end: number): void;
    /**
     * Configure text shaping / ligature behavior.
     *
     * Supported keys:
     * - `enabled`: bool
     * - `shapingEnabled` / `shaping_enabled`: bool
     * - `textShaping` / `text_shaping`: bool
     *
     * Default behavior is disabled to preserve baseline perf characteristics.
     */
    setTextShaping(options: any): void;
    /**
     * Convenience wrapper for user-controlled zoom updates.
     */
    setZoom(zoom: number): any;
    /**
     * Emit one JSONL `frame` trace record for browser resize-storm E2E logs.
     *
     * The line includes both a deterministic frame hash and the current
     * geometry snapshot so test runners can diagnose resize/zoom/DPR mismatches.
     */
    snapshotResizeStormFrameJsonl(run_id: string, seed: number, timestamp: string, frame_idx: number): string;
    /**
     * Return current text shaping configuration.
     *
     * Shape: `{ enabled, engine, fallback }`
     */
    textShapingState(): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_frankentermweb_free: (a: number, b: number) => void;
    readonly frankentermweb_accessibilityClassNames: (a: number) => number;
    readonly frankentermweb_accessibilityDomSnapshot: (a: number) => number;
    readonly frankentermweb_accessibilityState: (a: number) => number;
    readonly frankentermweb_applyPatch: (a: number, b: number, c: number) => void;
    readonly frankentermweb_applyPatchBatch: (a: number, b: number, c: number) => void;
    readonly frankentermweb_applyPatchBatchFlat: (a: number, b: number, c: number, d: number) => void;
    readonly frankentermweb_clearSearch: (a: number) => void;
    readonly frankentermweb_clearSelection: (a: number) => void;
    readonly frankentermweb_copySelection: (a: number, b: number) => void;
    readonly frankentermweb_destroy: (a: number) => void;
    readonly frankentermweb_drainAccessibilityAnnouncements: (a: number) => number;
    readonly frankentermweb_drainEncodedInputBytes: (a: number) => number;
    readonly frankentermweb_drainEncodedInputs: (a: number) => number;
    readonly frankentermweb_drainLinkClicks: (a: number) => number;
    readonly frankentermweb_drainLinkClicksJsonl: (a: number, b: number, c: number, d: bigint, e: number, f: number) => number;
    readonly frankentermweb_extractSelectionText: (a: number, b: number) => void;
    readonly frankentermweb_feed: (a: number, b: number, c: number) => void;
    readonly frankentermweb_fitToContainer: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly frankentermweb_init: (a: number, b: number, c: number) => number;
    readonly frankentermweb_input: (a: number, b: number, c: number) => void;
    readonly frankentermweb_linkAt: (a: number, b: number, c: number) => number;
    readonly frankentermweb_linkOpenPolicy: (a: number) => number;
    readonly frankentermweb_linkUrlAt: (a: number, b: number, c: number, d: number) => void;
    readonly frankentermweb_new: () => number;
    readonly frankentermweb_pasteText: (a: number, b: number, c: number, d: number) => void;
    readonly frankentermweb_render: (a: number, b: number) => void;
    readonly frankentermweb_resize: (a: number, b: number, c: number) => void;
    readonly frankentermweb_screenReaderMirrorText: (a: number, b: number) => void;
    readonly frankentermweb_searchNext: (a: number) => number;
    readonly frankentermweb_searchPrev: (a: number) => number;
    readonly frankentermweb_searchState: (a: number) => number;
    readonly frankentermweb_setAccessibility: (a: number, b: number, c: number) => void;
    readonly frankentermweb_setCursor: (a: number, b: number, c: number, d: number) => void;
    readonly frankentermweb_setHoveredLinkId: (a: number, b: number) => void;
    readonly frankentermweb_setLinkOpenPolicy: (a: number, b: number, c: number) => void;
    readonly frankentermweb_setScale: (a: number, b: number, c: number, d: number) => void;
    readonly frankentermweb_setSearchQuery: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly frankentermweb_setSelectionRange: (a: number, b: number, c: number, d: number) => void;
    readonly frankentermweb_setTextShaping: (a: number, b: number, c: number) => void;
    readonly frankentermweb_setZoom: (a: number, b: number, c: number) => void;
    readonly frankentermweb_snapshotResizeStormFrameJsonl: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly frankentermweb_textShapingState: (a: number) => number;
    readonly __wasm_bindgen_func_elem_1820: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_2389: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_1822: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
