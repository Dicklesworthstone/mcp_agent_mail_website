import { test, expect, ROUTES } from "./fixtures";

test.describe("Primary user journeys", () => {
  test("home page hero section is visible", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");
    const hero = page.locator("#home-hero");
    await expect(hero).toBeVisible();
    diagnostics.breadcrumb("Hero section visible");
  });

  test("home page has CTA buttons", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");
    // Primary CTA
    const showcaseLink = page.locator('a[href="/showcase"]:visible').first();
    await expect(showcaseLink).toBeVisible();
    // Getting started CTA
    const getStartedLink = page.locator('a[href="/getting-started"]:visible').first();
    await expect(getStartedLink).toBeVisible();
    diagnostics.breadcrumb("CTAs visible");
  });

  test("navigation between pages works", async ({ page, diagnostics }) => {
    await page.goto("/");
    diagnostics.breadcrumb("Starting on home page");

    // Navigate to showcase
    await page.locator('a[href="/showcase"]:visible').first().click();
    await page.waitForURL("/showcase");
    await expect(page.locator("main#main-content")).toBeVisible();
    diagnostics.breadcrumb("Navigated to showcase");

    // Navigate to architecture
    await page.locator('a[href="/architecture"]:visible').first().click();
    await page.waitForURL("/architecture");
    await expect(page.locator("main#main-content")).toBeVisible();
    diagnostics.breadcrumb("Navigated to architecture");
  });

  test("getting-started page has install command", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/getting-started");
    await page.goto("/getting-started");
    const codeBlock = page.locator("code");
    await expect(codeBlock.first()).toBeVisible();
    diagnostics.breadcrumb("Install command visible");
  });

  test("glossary page loads and has content", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/glossary");
    await page.goto("/glossary");
    await expect(page.locator("main#main-content")).toBeVisible();
    diagnostics.breadcrumb("Glossary page loaded");
  });
});

test.describe("Route crawl and link integrity", () => {
  for (const route of ROUTES) {
    test(`${route} has valid HTML structure`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      // Check for main landmark
      await expect(page.locator("main")).toBeAttached();

      // Check that page has a heading
      const headings = page.locator("h1, h2");
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);

      diagnostics.breadcrumb(`${route}: ${count} headings found`);
    });

    test(`${route} has no broken internal links`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      const links = page.locator('a[href^="/"]');
      const count = await links.count();
      diagnostics.breadcrumb(`${route}: checking ${count} internal links`);

      const hrefs = new Set<string>();
      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute("href");
        if (href) hrefs.add(href);
      }

      // Verify each unique internal link resolves
      for (const href of hrefs) {
        const basePath = href.split("#")[0];
        if (!basePath) continue;

        const response = await page.request.get(basePath);
        expect(
          response.status(),
          `Link ${href} from ${route} returned ${response.status()}`
        ).toBeLessThan(400);
      }
    });
  }
});
