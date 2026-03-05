import { test, expect, ROUTES } from "./fixtures";

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
});
