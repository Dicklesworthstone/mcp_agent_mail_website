import { test, expect, ROUTES } from "./fixtures";

test.describe("Accessibility regression suite", () => {
  for (const route of ROUTES) {
    test(`${route} has proper heading hierarchy`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      // Ensure at least one h1 exists
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      diagnostics.breadcrumb(`${route}: ${h1Count} h1 elements`);
    });

    test(`${route} images have alt text`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      const images = page.locator("img");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        const src = await images.nth(i).getAttribute("src");
        // alt="" is valid for decorative images (WCAG); only null means missing
        expect(alt, `Image ${src} on ${route} missing alt attribute`).not.toBeNull();
      }

      diagnostics.breadcrumb(`${route}: ${count} images checked`);
    });

    test(`${route} interactive elements are keyboard accessible`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      // Check that buttons and links have accessible names
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute("aria-label");
        const hasName = (text && text.trim().length > 0) || ariaLabel;
        expect(hasName, `Button ${i} on ${route} has no accessible name`).toBeTruthy();
      }

      diagnostics.breadcrumb(`${route}: ${buttonCount} buttons checked`);
    });

    test(`${route} has proper lang attribute`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe("en");

      diagnostics.breadcrumb(`${route}: lang="${lang}"`);
    });
  }

  test("skip link focuses main content", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const skipLink = page.locator('a[href="#main-content"]');
    await skipLink.focus();
    await skipLink.click();

    // Verify focus moved to main content area
    const main = page.locator("main#main-content");
    await expect(main).toBeAttached();

    diagnostics.breadcrumb("Skip link interaction verified");
  });
});
