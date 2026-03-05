import { test as base, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ─── Diagnostics Types ───────────────────────────────────────────

interface ConsoleEntry {
  timestamp: string;
  type: string;
  text: string;
  url?: string;
}

interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration: number;
}

interface TestDiagnostics {
  testId: string;
  route: string;
  viewport: { width: number; height: number };
  startedAt: string;
  console: ConsoleEntry[];
  network: NetworkEntry[];
  breadcrumbs: string[];
}

// ─── Diagnostics Collector ───────────────────────────────────────

class DiagnosticsCollector {
  private diagnostics: TestDiagnostics;

  constructor(testId: string) {
    this.diagnostics = {
      testId,
      route: "",
      viewport: { width: 0, height: 0 },
      startedAt: new Date().toISOString(),
      console: [],
      network: [],
      breadcrumbs: [],
    };
  }

  attachToPage(page: Page) {
    // Console capture
    page.on("console", (msg) => {
      this.diagnostics.console.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text(),
        url: page.url(),
      });
    });

    // Network capture (redact sensitive headers)
    page.on("response", (response) => {
      const url = response.url();
      // Skip data URIs and blob URLs
      if (url.startsWith("data:") || url.startsWith("blob:")) return;

      this.diagnostics.network.push({
        timestamp: new Date().toISOString(),
        method: response.request().method(),
        url: redactUrl(url),
        status: response.status(),
        duration: 0, // Playwright doesn't expose timing directly
      });
    });
  }

  breadcrumb(message: string) {
    this.diagnostics.breadcrumbs.push(
      `[${new Date().toISOString()}] ${message}`
    );
  }

  setRoute(route: string) {
    this.diagnostics.route = route;
  }

  setViewport(viewport: { width: number; height: number }) {
    this.diagnostics.viewport = viewport;
  }

  async writeTo(outputDir: string) {
    const safeTestId = this.diagnostics.testId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = path.join(outputDir, `diagnostics-${safeTestId}.json`);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(this.diagnostics, null, 2));
  }
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    // Redact query params that look sensitive
    for (const key of u.searchParams.keys()) {
      if (/token|key|secret|password|auth/i.test(key)) {
        u.searchParams.set(key, "[REDACTED]");
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}

// ─── Extended Test Fixture ───────────────────────────────────────

export const test = base.extend<{
  diagnostics: DiagnosticsCollector;
}>({
  diagnostics: async ({ page }, use, testInfo) => {
    const collector = new DiagnosticsCollector(testInfo.titlePath.join(" > "));
    collector.attachToPage(page);

    const viewport = page.viewportSize();
    if (viewport) collector.setViewport(viewport);

    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture `use`, not React hook
    await use(collector);

    // Write diagnostics on failure
    if (testInfo.status !== "passed") {
      const outputDir = testInfo.outputDir;
      await collector.writeTo(outputDir);
    }
  },
});

export { expect };

// ─── Route Helpers ───────────────────────────────────────────────

export const ROUTES = [
  "/",
  "/showcase",
  "/architecture",
  "/getting-started",
  "/glossary",
  "/spec-explorer",
] as const;

export type AppRoute = (typeof ROUTES)[number];
