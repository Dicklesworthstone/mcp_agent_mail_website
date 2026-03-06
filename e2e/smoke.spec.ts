import { test, expect, ROUTES, gotoRoute } from "./fixtures";

test.describe("Smoke tests", () => {
  test("home page loads and has correct title", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    diagnostics.breadcrumb("Navigating to home page");
    await gotoRoute(page, "/");
    diagnostics.breadcrumb("Page loaded");
    await expect(page).toHaveTitle(/Agent Mail/i);
  });

  for (const route of ROUTES) {
    test(`${route} returns 200`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      diagnostics.breadcrumb(`Requesting ${route}`);
      const response = await page.request.get(route);
      expect(response?.status()).toBe(200);
    });
  }

  test("skip-to-content link exists", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await gotoRoute(page, "/");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    diagnostics.breadcrumb("Skip link verified");
  });

  for (const route of ROUTES) {
    test(`${route} has main content landmark`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      diagnostics.breadcrumb(`Checking main landmark on ${route}`);
      const response = await page.request.get(route);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain('id="main-content"');
    });
  }

  test("spec explorer supports filtering and document open flow", async ({ page, diagnostics }) => {
    test.slow();
    diagnostics.setRoute("/spec-explorer");
    diagnostics.breadcrumb("Navigating to spec explorer");
    await gotoRoute(page, "/spec-explorer");

    const searchInput = page.locator('input[aria-label="Search spec documents"]:visible');
    await expect(searchInput).toBeVisible({ timeout: 30_000 });
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

    await expect(page).toHaveURL(/doc=product-bus-and-cross-project/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Product Bus And Cross-Project Coordination" }),
    ).toBeVisible();
    await expect(page.locator('[data-spec-doc-body=\"true\"]')).toHaveCount(1);
    diagnostics.breadcrumb("Document content rendered");
  });

  test("spec explorer restores deep links and preserves related-doc navigation history", async ({ page, diagnostics }) => {
    test.slow();
    diagnostics.setRoute("/spec-explorer");
    const deepLink = "/spec-explorer?doc=product-bus-and-cross-project&category=Coordination%20Flows#typical-cross-project-flow";
    diagnostics.breadcrumb(`Navigating to deep link ${deepLink}`);
    await gotoRoute(page, deepLink);

    const docBody = page.locator('[data-spec-doc-body=\"true\"]:visible').first();
    await expect(docBody).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/doc=product-bus-and-cross-project/);
    await expect(page).toHaveURL(/category=Coordination(?:%20|\+)Flows/);
    await expect(page).toHaveURL(/#typical-cross-project-flow/);
    await expect(docBody).toHaveAttribute("data-spec-current-section", "typical-cross-project-flow");
    await expect(page.locator('[data-spec-doc-body=\"true\"]')).toHaveCount(1);
    await expect(page.locator('[data-spec-reader-progress=\"true\"]:visible').first()).toBeVisible();
    diagnostics.breadcrumb("Deep-linked doc and section restored");

    const viewportWidth = page.viewportSize()?.width ?? 0;
    if (viewportWidth >= 1024) {
      await expect(page.locator('[data-spec-progress-bar=\"true\"]:visible').first()).toBeVisible();
      await expect(page.locator('[data-spec-rail-active=\"true\"]:visible')).toHaveCount(1);
      diagnostics.breadcrumb("Desktop rail progress and active state visible");
    }

    const relatedDoc = page.locator('[data-spec-related-doc=\"search-v3-explained\"]:visible').first();
    await relatedDoc.scrollIntoViewIfNeeded();
    await expect(relatedDoc).toBeVisible();
    await relatedDoc.click();

    await expect(page).toHaveURL(/doc=search-v3-explained/);
    await expect(page).toHaveURL(/category=Storage(?:%20|\+)%26(?:%20|\+)Search/);
    diagnostics.breadcrumb("Navigated to cross-category related doc");

    await page.goBack();

    await expect(page).toHaveURL(/doc=product-bus-and-cross-project/);
    await expect(page).toHaveURL(/category=Coordination(?:%20|\+)Flows/);
    await expect(page).toHaveURL(/#typical-cross-project-flow/);
    await expect(docBody).toHaveAttribute("data-spec-current-section", "typical-cross-project-flow");
    diagnostics.breadcrumb("Back navigation restored original deep-linked state");
  });

  test("no console errors on home page", async ({ page, diagnostics }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    diagnostics.setRoute("/");
    await gotoRoute(page, "/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Agent Coordination That Scales/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#home-concepts")).toBeAttached({ timeout: 30_000 });
    await page.waitForTimeout(1000);
    const allowlistedNoise = [/Failed to load resource: net::ERR_FILE_NOT_FOUND/i];
    const realErrors = errors.filter(
      (e) => !allowlistedNoise.some((pattern) => pattern.test(e))
    );
    expect(realErrors).toEqual([]);
  });
});
