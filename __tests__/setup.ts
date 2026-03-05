import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

// ─── Deterministic environment ───────────────────────────────────
// Fix date for snapshot/assertion stability
const FIXED_DATE = new Date("2026-01-15T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers({ now: FIXED_DATE });
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Window matchMedia mock (for reduced-motion tests) ──────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
