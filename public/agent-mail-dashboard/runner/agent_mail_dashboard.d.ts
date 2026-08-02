/* tslint:disable */
/* eslint-disable */

export class AgentMailDashboardRunner {
    free(): void;
    [Symbol.dispose](): void;
    advanceTime(dt_ms: number): void;
    destroy(): void;
    init(): void;
    loadDemoPack(json: string): void;
    constructor(cols: number, rows: number);
    patchHash(): string | undefined;
    patchStats(): any;
    pushEncodedInput(json: string): boolean;
    reset(): void;
    resize(cols: number, rows: number): void;
    setPaused(paused: boolean): void;
    setReducedMotion(reduced_motion: boolean): void;
    statusJson(): string;
    step(): any;
    takeFlatPatches(): any;
    takeLogs(): Array<any>;
}

export function wasm_start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_agentmaildashboardrunner_free: (a: number, b: number) => void;
    readonly agentmaildashboardrunner_advanceTime: (a: number, b: number) => void;
    readonly agentmaildashboardrunner_destroy: (a: number) => void;
    readonly agentmaildashboardrunner_init: (a: number) => void;
    readonly agentmaildashboardrunner_loadDemoPack: (a: number, b: number, c: number) => [number, number];
    readonly agentmaildashboardrunner_new: (a: number, b: number) => number;
    readonly agentmaildashboardrunner_patchHash: (a: number) => [number, number];
    readonly agentmaildashboardrunner_patchStats: (a: number) => any;
    readonly agentmaildashboardrunner_pushEncodedInput: (a: number, b: number, c: number) => number;
    readonly agentmaildashboardrunner_reset: (a: number) => void;
    readonly agentmaildashboardrunner_resize: (a: number, b: number, c: number) => void;
    readonly agentmaildashboardrunner_setPaused: (a: number, b: number) => void;
    readonly agentmaildashboardrunner_setReducedMotion: (a: number, b: number) => void;
    readonly agentmaildashboardrunner_statusJson: (a: number) => [number, number];
    readonly agentmaildashboardrunner_step: (a: number) => any;
    readonly agentmaildashboardrunner_takeFlatPatches: (a: number) => any;
    readonly agentmaildashboardrunner_takeLogs: (a: number) => any;
    readonly wasm_start: () => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
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
