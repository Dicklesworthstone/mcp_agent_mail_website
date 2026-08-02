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
    await expect(terminal).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/dashboard screen ready/i);
    diagnostics.breadcrumb("Production Agent Mail shell and DashboardScreen rendered through FrankenTUI WASM");
  });

  test("desktop embed starts in the native mega-density geometry without mascot overlap", async ({
    page,
    diagnostics,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop density contract");
    diagnostics.setRoute("/");
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const terminal = hero.getByTestId("hero-agent-mail-terminal");
    await expect(terminal).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    await expect.poll(async () => Number(await terminal.getAttribute("data-terminal-cols"))).toBeGreaterThanOrEqual(220);

    const mascotBox = await hero.getByTestId("hero-robot-mascot").boundingBox();
    const demoBox = await hero.getByTestId("hero-tui-demo").boundingBox();
    const ctaBox = await hero.getByRole("link", { name: /see agent mail in action/i }).boundingBox();
    const viewport = page.viewportSize();
    expect(mascotBox).not.toBeNull();
    expect(demoBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(demoBox!.width).toBeGreaterThanOrEqual(viewport!.width * 0.92);
    expect(demoBox!.width / demoBox!.height).toBeGreaterThanOrEqual(1.9);
    expect(demoBox!.width / demoBox!.height).toBeLessThanOrEqual(2.1);
    expect(demoBox!.y - (ctaBox!.y + ctaBox!.height)).toBeLessThanOrEqual(64);
    expect(mascotBox!.y + mascotBox!.height).toBeLessThanOrEqual(demoBox!.y);
    diagnostics.breadcrumb("Full-bleed 2:1 shell opened at >=220 columns with <=64px CTA gap and zero mascot overlap");
  });

  test("verified artifacts are fetched once and JavaScript executes from verified bytes", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");
    const artifactRequests = new Map<string, number>();
    const artifactRequestUrls = new Map<string, URL>();
    const checkedArtifacts = new Set([
      "/agent-mail-dashboard/demo_pack.v1.json",
      "/agent-mail-dashboard/runner/agent_mail_dashboard.js",
      "/agent-mail-dashboard/runner/agent_mail_dashboard_bg.wasm",
      "/agent-mail-dashboard/renderer/FrankenTerm.js",
      "/agent-mail-dashboard/renderer/FrankenTerm_bg.wasm",
      "/agent-mail-dashboard/fonts/pragmasevka-nf-subset.woff2",
    ]);
    page.on("request", (request) => {
      const pathname = new URL(request.url()).pathname;
      if (checkedArtifacts.has(pathname)) {
        artifactRequests.set(pathname, (artifactRequests.get(pathname) ?? 0) + 1);
        artifactRequestUrls.set(pathname, new URL(request.url()));
      }
    });
    await page.goto("/");
    await expect(page.getByTestId("hero-agent-mail-terminal")).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    for (const pathname of checkedArtifacts) {
      expect(artifactRequests.get(pathname), pathname).toBe(1);
      expect(artifactRequestUrls.get(pathname)?.searchParams.get("sha256"), pathname)
        .toMatch(/^[a-f0-9]{64}$/);
    }
    diagnostics.breadcrumb("Each digest-keyed verified artifact crossed the network exactly once");
  });

  test("verified replay exposes real aggregate counts and synthetic-detail boundary", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const runtime = hero.getByTestId("hero-dashboard-runtime-status");
    await expect(runtime).toContainText(/aggregate counts come from a read-only Agent Mail SQLite export/i);
    await expect(runtime).toContainText(/names, paths, messages, and replay events are synthetic/i);
    await expect(runtime).toContainText(/45 projects, 1554 agents, 8059 messages/i, {
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
    const demo = hero.getByTestId("hero-tui-demo");
    await expect(demo).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    await hero.getByRole("button", { name: "Pause dashboard replay" }).click();
    await expect(hero.getByRole("button", { name: "Play dashboard replay" })).toBeVisible();
    const beforeInputFrame = Number(await demo.getAttribute("data-frame-index"));
    await canvas.focus();
    await page.keyboard.press("2");
    await expect(demo).toHaveAttribute("data-active-screen", "messages");
    await expect.poll(async () => Number(await demo.getAttribute("data-frame-index"))).toBeGreaterThan(beforeInputFrame);

    await page.keyboard.press("Tab");
    await expect(demo).toHaveAttribute("data-active-screen", "threads");
    await expect(canvas).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(demo).toHaveAttribute("data-active-screen", "messages");
    await expect(canvas).toBeFocused();

    const liveUpdate = hero.locator("#agent-mail-terminal-screen-reader");
    await expect(liveUpdate).not.toBeEmpty();
    expect((await liveUpdate.textContent())?.length ?? Number.POSITIVE_INFINITY).toBeLessThan(500);

    await page.waitForTimeout(900);
    const pausedFrame = await demo.getAttribute("data-frame-index");
    await page.waitForTimeout(900);
    expect(await demo.getAttribute("data-frame-index")).toBe(pausedFrame);
    diagnostics.breadcrumb("Keyboard input rendered and pause held the deterministic frame");
  });

  test("mouse clicks switch native tabs and select public replay rows", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto("/");

    const terminal = page.getByTestId("hero-agent-mail-terminal");
    const canvas = page.getByTestId("hero-agent-mail-canvas");
    await expect(terminal).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    const box = await canvas.boundingBox();
    const cols = Number(await terminal.getAttribute("data-terminal-cols"));
    const rows = Number(await terminal.getAttribute("data-terminal-rows"));
    expect(box).not.toBeNull();
    expect(cols).toBeGreaterThan(0);
    expect(rows).toBeGreaterThan(0);

    const clickCell = async (x: number, y: number) => {
      await page.mouse.click(
        box!.x + ((x + 0.5) / cols) * box!.width,
        box!.y + ((y + 0.5) / rows) * box!.height,
      );
    };
    await clickCell(18, 0);
    await expect(terminal).toHaveAttribute("data-active-screen", "messages");
    const pointerLatencyMs = await terminal.evaluate((element) => {
      const host = element as HTMLElement;
      return Number(host.dataset.statusPublishedAt) - Number(host.dataset.lastInputAt);
    });
    expect(pointerLatencyMs).toBeGreaterThanOrEqual(0);
    expect(pointerLatencyMs).toBeLessThan(50);

    const beforeRevision = Number(await terminal.getAttribute("data-interaction-revision"));
    await clickCell(8, 6);
    await expect.poll(async () => Number(await terminal.getAttribute("data-interaction-revision")))
      .toBeGreaterThan(beforeRevision);
    diagnostics.breadcrumb("Canvas pointer input switched a native shell tab and selected a replay row");
  });

  test("one-click fullscreen fills the browser and exits back to the trigger", async ({
    page,
    diagnostics,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Fullscreen API is browser-shell dependent on mobile");
    diagnostics.setRoute("/");
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto("/");

    const demo = page.getByTestId("hero-tui-demo");
    const enter = page.getByRole("button", { name: "Open dashboard fullscreen" });
    await expect(demo).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    await enter.click();
    await expect(demo).toHaveAttribute("data-fullscreen", "true");
    const box = await demo.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(Math.abs(box!.width - viewport!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box!.height - viewport!.height)).toBeLessThanOrEqual(1);
    const terminalBox = await page.getByTestId("hero-agent-mail-terminal").boundingBox();
    expect(terminalBox).not.toBeNull();
    expect(Math.abs(terminalBox!.width - viewport!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(terminalBox!.height - viewport!.height)).toBeLessThanOrEqual(1);

    const exit = page.getByRole("button", { name: "Exit dashboard fullscreen" });
    await exit.click();
    await expect(demo).toHaveAttribute("data-fullscreen", "false");
    await expect(page.getByRole("button", { name: "Open dashboard fullscreen" })).toBeFocused();
    diagnostics.breadcrumb("Fullscreen entered at viewport bounds and restored focus on exit");
  });

  test("reduced motion renders a deterministic static frame", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const hero = page.locator("#home-hero");
    const playButton = hero.getByRole("button", { name: "Play dashboard replay" });
    await expect(playButton).toBeDisabled();
    await expect(hero.getByTestId("hero-tui-demo")).toHaveAttribute("data-reduced-motion", "true");
    await expect(hero.getByTestId("hero-agent-mail-terminal")).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
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
    await expect(hero.getByTestId("hero-agent-mail-terminal")).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
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
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/interactive terminal unavailable/i, {
      timeout: 30_000,
    });
    await expect(hero.getByText(/Interactive dashboard unavailable/i)).toBeVisible();
    await expect(hero.getByText(/no private data was requested/i)).toBeVisible();
    await expect(hero.getByAltText(/Preview of the Agent Mail operations dashboard/i)).toBeVisible();
    diagnostics.breadcrumb("Manifest failure rendered a local poster and privacy-safe error state");
  });

  test("artifact-integrity failure stops before WASM execution and uses the safe fallback", async ({
    page,
    diagnostics,
  }) => {
    diagnostics.setRoute("/");
    await page.route("**/agent-mail-dashboard/runner/agent_mail_dashboard_bg.wasm?**", async (route) => {
      const response = await route.fetch();
      const body = await response.body();
      body[0] ^= 0xff;
      await route.fulfill({ response, body });
    });
    await page.goto("/");

    const hero = page.locator("#home-hero");
    await expect(hero.getByTestId("hero-dashboard-runtime-status")).toContainText(/interactive terminal unavailable/i, {
      timeout: 30_000,
    });
    await expect(hero.getByText(/failed SHA-256 verification/i)).toBeVisible();
    await expect(hero.getByText(/no private data was requested/i)).toBeVisible();
    diagnostics.breadcrumb("A mutated WASM response failed closed at the SHA-256 gate");
  });

  test("overlay controls do not consume terminal layout height", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await page.goto("/");

    const demo = page.getByTestId("hero-tui-demo");
    const terminal = page.getByTestId("hero-agent-mail-terminal");
    await expect(terminal).toHaveAttribute("data-active-screen", "dashboard", { timeout: 30_000 });
    const demoBox = await demo.boundingBox();
    const terminalBox = await terminal.boundingBox();
    expect(demoBox).not.toBeNull();
    expect(terminalBox).not.toBeNull();
    expect(Math.abs(demoBox!.height - terminalBox!.height)).toBeLessThanOrEqual(1);
    diagnostics.breadcrumb("Pause/reset/fullscreen controls overlay the terminal without a framing tray");
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
