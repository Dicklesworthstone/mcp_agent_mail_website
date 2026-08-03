import type { Page } from "@playwright/test";
import { test, expect, ROUTES } from "./fixtures";

const COLD_DASHBOARD_READY_BUDGET_MS = 3_000;
const WARM_DASHBOARD_READY_BUDGET_MS = 1_500;

async function measureInteractiveDashboardReadiness(
  page: Page,
  navigate: () => Promise<unknown>,
): Promise<number> {
  await navigate();

  const terminal = page.getByTestId("hero-agent-mail-terminal");
  const canvas = page.getByTestId("hero-agent-mail-canvas");
  await expect(canvas).toBeVisible();
  await expect(terminal).toHaveAttribute("aria-busy", "false");
  await expect(terminal).toHaveAttribute("data-active-screen", "dashboard");
  await expect(page.getByTestId("hero-dashboard-runtime-status")).toContainText(
    /dashboard screen ready/i,
  );

  // Readiness includes a completed input/render/status round trip, not merely
  // downloaded bytes or a visible fallback poster.
  await canvas.focus();
  await page.keyboard.press("Tab");
  await expect(terminal).toHaveAttribute("data-active-screen", "messages");

  return page.evaluate(() => performance.now());
}

test.describe("Performance budget checks", () => {
  for (const route of ROUTES) {
    test(`${route} loads within budget`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);

      const start = Date.now();
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const loadTime = Date.now() - start;

      // Budget: DOM content loaded under 5s (generous for CI cold start)
      expect(loadTime, `${route} took ${loadTime}ms to load`).toBeLessThan(5000);

      diagnostics.breadcrumb(`${route}: DOMContentLoaded in ${loadTime}ms`);
    });

    test(`${route} page weight is reasonable`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);

      let totalBytes = 0;
      const responseSizeTasks: Promise<void>[] = [];
      page.on("response", (response) => {
        responseSizeTasks.push((async () => {
          const headers = response.headers();
          const contentLength = headers["content-length"];
          if (contentLength) {
            const parsed = Number.parseInt(contentLength, 10);
            if (Number.isFinite(parsed) && parsed > 0) {
              totalBytes += parsed;
            }
            return;
          }

          try {
            const body = await response.body();
            totalBytes += body.byteLength;
          } catch {
            // Responses like 304 or opaque dev-server streams may not expose a body.
          }
        })());
      });

      await page.goto(route, { waitUntil: "networkidle" });
      await Promise.allSettled(responseSizeTasks);

      // Budget: under 5MB total transfer per page
      const totalMB = totalBytes / (1024 * 1024);
      expect(totalMB, `${route} transferred ${totalMB.toFixed(2)}MB`).toBeLessThan(5);

      diagnostics.breadcrumb(`${route}: ${totalMB.toFixed(2)}MB transferred`);
    });
  }

  test("home page LCP element exists", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    // The hero heading should be one of the largest visible elements
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible();

    diagnostics.breadcrumb("LCP candidate element visible");
  });

  test("home dashboard reaches full interaction readiness within cold and warm budgets", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");

    const coldReadyMs = await measureInteractiveDashboardReadiness(
      page,
      () => page.goto("/", { waitUntil: "domcontentloaded" }),
    );
    expect(
      coldReadyMs,
      `Cold dashboard interaction readiness took ${coldReadyMs.toFixed(0)}ms`,
    ).toBeLessThan(COLD_DASHBOARD_READY_BUDGET_MS);

    const warmReadyMs = await measureInteractiveDashboardReadiness(
      page,
      () => page.reload({ waitUntil: "domcontentloaded" }),
    );
    expect(
      warmReadyMs,
      `Warm dashboard interaction readiness took ${warmReadyMs.toFixed(0)}ms`,
    ).toBeLessThan(WARM_DASHBOARD_READY_BUDGET_MS);

    diagnostics.breadcrumb(
      `Dashboard fully interactive in ${coldReadyMs.toFixed(0)}ms cold / ${warmReadyMs.toFixed(0)}ms warm`,
    );
  });
});
