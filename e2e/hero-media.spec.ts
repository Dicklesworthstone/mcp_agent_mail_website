import { test, expect } from "./fixtures";

test.describe("Hero media module", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("simulated TUI surface is rendered", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const tuiDemo = page.getByTestId("hero-tui-demo");
    await expect(tuiDemo).toBeVisible();
    diagnostics.breadcrumb("Simulated TUI element found");
  });

  test("event feed has rows", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const feed = page.getByTestId("hero-tui-feed");
    const rows = feed.locator(":scope > div");
    await expect.poll(async () => rows.count()).toBeGreaterThan(0);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    await expect(rows.first()).toBeAttached();
    diagnostics.breadcrumb(`Feed rows found: ${count}`);
  });

  test("playback toggle is present and interactive", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const toggleButton = page.getByRole("button", { name: /pause simulation|play simulation/i });
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
    await expect(page.getByRole("button", { name: /pause simulation|play simulation/i })).toBeVisible();
    diagnostics.breadcrumb("Play/pause toggle clicked");
  });

  test("chapter navigation buttons exist", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle chapter list" }).click();
    const chapterButtons = page.getByRole("button", { name: /Cold Start/i });
    await expect(chapterButtons.first()).toBeVisible();
    diagnostics.breadcrumb("Chapter list opened");
  });

  test("transcript toggle exists", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const transcriptBtn = page.getByRole("button", { name: "Toggle transcript" });
    await transcriptBtn.click();
    await expect(page.getByText(/cold start/i)).toBeVisible();
    diagnostics.breadcrumb("Transcript panel opened");
  });

  test("real web app button points to a public route", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const link = page.getByTestId("hero-real-webapp-link");
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    const parsed = new URL(href!, page.url());
    expect(["http:", "https:"]).toContain(parsed.protocol);
    expect(parsed.pathname.startsWith("/")).toBeTruthy();
    diagnostics.breadcrumb(`Real web app href=${href}`);
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
