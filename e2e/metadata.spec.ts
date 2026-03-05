import { test, expect, ROUTES } from "./fixtures";

function parseJsonLdObject(raw: string, context: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    throw new Error("Expected a JSON object");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${context} contains invalid JSON-LD: ${detail}`);
  }
}

test.describe("Metadata and SEO validation", () => {
  for (const route of ROUTES) {
    test(`${route} has meta description`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description, `${route} missing meta description`).toBeTruthy();
      const descriptionText = description ?? "";
      expect(descriptionText.length).toBeGreaterThan(20);

      diagnostics.breadcrumb(`${route}: description="${descriptionText.slice(0, 50)}..."`);
    });

    test(`${route} has viewport meta`, async ({ page, diagnostics }) => {
      diagnostics.setRoute(route);
      await page.goto(route);

      const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
      expect(viewport).toBeTruthy();
      expect(viewport).toContain("width=device-width");
    });
  }

  test("home page has JSON-LD structured data", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(2); // WebSite + SoftwareApplication at minimum

    // Validate each is parseable JSON
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      expect(content, `JSON-LD script ${i} should have content`).toBeTruthy();
      const parsed = parseJsonLdObject(content ?? "", `JSON-LD script ${i}`);
      expect(parsed["@context"]).toBe("https://schema.org");

      diagnostics.breadcrumb(`JSON-LD ${i}: @type=${parsed["@type"]}`);
    }
  });

  test("getting-started page has FAQ structured data", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/getting-started");
    await page.goto("/getting-started");

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();

    let hasFaq = false;
    let hasHowTo = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      expect(content, `JSON-LD script ${i} should have content`).toBeTruthy();
      const parsed = parseJsonLdObject(content ?? "", `JSON-LD script ${i}`);
      if (parsed["@type"] === "FAQPage") hasFaq = true;
      if (parsed["@type"] === "HowTo") hasHowTo = true;
    }

    expect(hasFaq, "Getting-started page should have FAQPage JSON-LD").toBe(true);
    expect(hasHowTo, "Getting-started page should have HowTo JSON-LD").toBe(true);

    diagnostics.breadcrumb("FAQ and HowTo structured data verified");
  });

  test("robots.txt is accessible", async ({ page, diagnostics }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-Agent");
    diagnostics.breadcrumb("robots.txt validated");
  });

  test("sitemap.xml is accessible", async ({ page, diagnostics }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<?xml");
    expect(body).toContain("<urlset");
    diagnostics.breadcrumb("sitemap.xml validated");
  });
});
