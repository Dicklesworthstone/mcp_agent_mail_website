import { test, expect, ROUTES } from "./fixtures";

test.describe("Smoke tests", () => {
  test("home page loads and has correct title", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    diagnostics.breadcrumb("Navigating to home page");
    await page.goto("/");
    diagnostics.breadcrumb("Page loaded");
    await expect(page).toHaveTitle(/Agent Mail/i);
  });

  for (const route of ROUTES) {
    test(`${route} returns 200`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      diagnostics.breadcrumb(`Navigating to ${route}`);
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    });
  }

  test("skip-to-content link exists", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    diagnostics.breadcrumb("Skip link verified");
  });

  for (const route of ROUTES) {
    test(`${route} has main content landmark`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      diagnostics.breadcrumb(`Checking main landmark on ${route}`);
      await page.goto(route);
      const main = page.locator("main#main-content");
      await expect(main).toBeAttached();
    });
  }

  test("no console errors on home page", async ({ page, diagnostics }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    diagnostics.setRoute("/");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Filter out known benign errors (e.g., missing video file 404)
    const realErrors = errors.filter(
      (e) => !e.includes("ERR_FILE_NOT_FOUND") && !e.includes("404")
    );
    expect(realErrors).toEqual([]);
  });
});
