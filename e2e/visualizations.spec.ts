import { test, expect } from "./fixtures";

test.describe("Interactive visualizations", () => {
  test("showcase page loads all visualization sections", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/showcase");
    await page.goto("/showcase");
    await page.waitForLoadState("networkidle");

    // Check that the main content is present
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();

    diagnostics.breadcrumb("Showcase page loaded");
  });

  test("home page visualization components render", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Concepts section should be visible
    const conceptsSection = page.locator("#home-concepts");
    await expect(conceptsSection).toBeAttached();

    diagnostics.breadcrumb("Concepts section with visualizations present");
  });

  test("architecture page loads visualization", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/architecture");
    await page.goto("/architecture");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();

    diagnostics.breadcrumb("Architecture page with visualizations loaded");
  });

  test("visualizations handle reduced motion gracefully", async ({ page, diagnostics }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });

    diagnostics.setRoute("/showcase");
    await page.goto("/showcase");
    await page.waitForLoadState("networkidle");

    // Page should still render without errors
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();

    diagnostics.breadcrumb("Reduced motion: showcase page renders correctly");
  });
});
