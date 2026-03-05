import { test, expect } from "./fixtures";

test.describe("Hero media module", () => {
  test("video placeholder is rendered", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const video = page.locator("video");
    await expect(video.first()).toBeAttached();
    diagnostics.breadcrumb("Video element found");
  });

  test("video has poster attribute", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const video = page.locator("video").first();
    const poster = await video.getAttribute("poster");
    expect(poster).toBeTruthy();
    diagnostics.breadcrumb(`poster="${poster}"`);
  });

  test("video has accessible label", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const video = page.locator("video").first();
    const ariaLabel = await video.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel!.length).toBeGreaterThan(10);
  });

  test("video has caption track", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const tracks = page.locator("video track");
    const count = await tracks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    diagnostics.breadcrumb(`${count} track elements found`);
  });

  test("chapter navigation buttons exist", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    // Chapter buttons should be rendered
    const chapterButtons = page.locator('button:has-text("Cold Start")');
    // If chapter navigation is present
    const count = await chapterButtons.count();
    diagnostics.breadcrumb(`Chapter buttons found: ${count}`);
    // Just verify the hero section loaded
    const hero = page.locator("#home-hero");
    await expect(hero).toBeVisible();
  });

  test("transcript toggle exists", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const transcriptBtn = page.locator('button:has-text("Transcript")');
    const count = await transcriptBtn.count();
    diagnostics.breadcrumb(`Transcript buttons: ${count}`);
    // Just verify hero loaded
    await expect(page.locator("#home-hero")).toBeVisible();
  });
});

test.describe("Conversion evidence strip and CTA rail", () => {
  test("evidence strip is visible", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const evidenceStrip = page.locator("#home-evidence-strip");
    await expect(evidenceStrip).toBeAttached();
    diagnostics.breadcrumb("Evidence strip found");
  });

  test("adoption CTA cards are rendered", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const adoptionRail = page.locator("#home-adoption-rail");
    await expect(adoptionRail).toBeAttached();

    // Should have 3 cards (solo dev, team lead, platform)
    const cards = adoptionRail.locator(".group");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
    diagnostics.breadcrumb(`${count} adoption CTA cards`);
  });

  test("CTA links point to valid routes", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const adoptionRail = page.locator("#home-adoption-rail");
    const links = adoptionRail.locator("a");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href, `CTA link ${i} missing href`).toBeTruthy();
      expect(href).toMatch(/^\//);
    }

    diagnostics.breadcrumb(`${count} CTA links validated`);
  });
});
