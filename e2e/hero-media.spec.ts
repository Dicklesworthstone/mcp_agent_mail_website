import { test, expect } from "./fixtures";

test.describe("Hero media module", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("production FrankenTUI WASM surface is rendered", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const terminal = hero.getByTestId("hero-agent-mail-terminal");
    await expect(terminal).toBeVisible();
    await expect(hero.getByTestId("hero-agent-mail-canvas")).toBeVisible({ timeout: 30_000 });
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/WASM frame/i, {
      timeout: 30_000,
    });
    diagnostics.breadcrumb("Production DashboardScreen rendered through FrankenTUI WASM");
  });

  test("verified replay exposes real aggregate counts and synthetic-detail boundary", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const hero = page.locator("#home-hero");
    await expect(hero.getByText(/Real aggregate counts from a read-only Agent Mail SQLite export/i)).toBeVisible();
    await expect(hero.getByText(/names, paths, messages, and replay events are synthetic/i)).toBeVisible();
    await expect(hero.getByText(/44 projects · 1,550 agents · 7,916 messages/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/source db:/i)).toHaveCount(0);
    diagnostics.breadcrumb("Public data provenance and aggregate snapshot counts are visible");
  });

  test("terminal accepts keyboard input and pause freezes the deterministic replay", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const canvas = hero.getByTestId("hero-agent-mail-canvas");
    const runtime = hero.getByTestId("hero-dashboard-runtime-status");
    await expect(runtime).toContainText(/WASM frame/i, { timeout: 30_000 });
    await canvas.focus();
    await page.keyboard.press("2");
    const screenReaderMirror = hero.locator("#agent-mail-terminal-screen-reader");
    await expect(screenReaderMirror).toContainText(/MsgRecv|MsgSent/i, {
      timeout: 5_000,
    });
    await expect(screenReaderMirror).not.toContainText(/ResGrant/i);

    await hero.getByRole("button", { name: "Pause dashboard replay" }).click();
    await expect(hero.getByRole("button", { name: "Play dashboard replay" })).toBeVisible();
    await page.waitForTimeout(900);
    const pausedFrame = await runtime.textContent();
    await page.waitForTimeout(900);
    expect(await runtime.textContent()).toBe(pausedFrame);
    diagnostics.breadcrumb("Keyboard input rendered and pause held the deterministic frame");
  });

  test("reduced motion renders a deterministic static frame", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const playButton = hero.getByRole("button", { name: "Play dashboard replay" });
    await expect(playButton).toBeDisabled();
    await expect(hero.getByText(/Reduced motion: deterministic static frame/i)).toBeVisible();
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/WASM frame/i, {
      timeout: 30_000,
    });
    diagnostics.breadcrumb("Reduced-motion mode initialized a static WASM frame");
  });

  test("terminal refits the production responsive layout after viewport resize", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const canvas = hero.getByTestId("hero-agent-mail-canvas");
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/WASM frame/i, {
      timeout: 30_000,
    });
    const initialWidth = Number(await canvas.getAttribute("width"));
    await page.setViewportSize({ width: 720, height: 740 });
    await expect.poll(async () => Number(await canvas.getAttribute("width"))).not.toBe(initialWidth);
    await expect(canvas).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    diagnostics.breadcrumb("ResizeObserver refit the FrankenTUI canvas without horizontal overflow");
  });

  test("verified-loader failure keeps a privacy-safe static fallback", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.route("**/agent-mail-dashboard/manifest.v1.json", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
    );
    await page.goto("/");

    const hero = page.locator("#home-hero");
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/Static fallback/i, {
      timeout: 30_000,
    });
    await expect(hero.getByText(/Interactive dashboard unavailable/i)).toBeVisible();
    await expect(hero.getByText(/no private data was requested/i)).toBeVisible();
    await expect(hero.getByAltText(/Preview of the Agent Mail operations dashboard/i)).toBeVisible();
    diagnostics.breadcrumb("Manifest failure rendered a local poster and privacy-safe error state");
  });

  test("showcase button points to a public route", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const link = page.locator("#home-hero").getByTestId("hero-real-webapp-link");
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    const parsed = new URL(href!, page.url());
    expect(["http:", "https:"]).toContain(parsed.protocol);
    expect(parsed.pathname.startsWith("/")).toBeTruthy();
    diagnostics.breadcrumb(`Showcase href=${href}`);
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
