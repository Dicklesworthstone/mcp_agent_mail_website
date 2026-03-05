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

  test("spec explorer supports filtering and document open flow", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/spec-explorer");
    diagnostics.breadcrumb("Navigating to spec explorer");
    await page.goto("/spec-explorer");

    const searchInput = page.locator('input[aria-label="Search spec documents"]:visible');
    await expect(searchInput).toBeVisible();
    diagnostics.breadcrumb("Search input visible");

    const docButtons = page.locator("[data-spec-doc-item]:visible");
    const initialCount = await docButtons.count();
    diagnostics.breadcrumb(`Initial visible docs: ${initialCount}`);

    await searchInput.fill("product bus");
    diagnostics.breadcrumb("Filter query applied: product bus");

    const firstDocButton = docButtons.first();
    await expect(firstDocButton).toBeVisible();
    const filteredCount = await docButtons.count();
    diagnostics.breadcrumb(`Filtered visible docs: ${filteredCount}`);

    const selectedSlug = await firstDocButton.getAttribute("data-spec-doc-item");
    expect(selectedSlug?.toLowerCase()).toContain("product-bus");
    diagnostics.breadcrumb(`Opening doc from list: ${selectedSlug ?? "unknown"}`);
    await firstDocButton.click();

    await expect(page.locator('[data-spec-doc-body=\"true\"]:visible').first()).toBeVisible();
    diagnostics.breadcrumb("Document content rendered");
  });

  test("no console errors on home page", async ({ page, diagnostics }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    diagnostics.setRoute("/");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const allowlistedNoise = [/Failed to load resource: net::ERR_FILE_NOT_FOUND/i];
    const realErrors = errors.filter(
      (e) => !allowlistedNoise.some((pattern) => pattern.test(e))
    );
    expect(realErrors).toEqual([]);
  });
});
