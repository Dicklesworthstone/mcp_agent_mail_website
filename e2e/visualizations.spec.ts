import type { Locator, Page, TestInfo } from "@playwright/test";

import { test, expect, gotoRoute } from "./fixtures";

function collectUnexpectedErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

function expectNoUnexpectedErrors(errors: string[]) {
  const allowlistedNoise = [/Failed to load resource: net::ERR_FILE_NOT_FOUND/i];
  const realErrors = errors.filter(
    (error) => !allowlistedNoise.some((pattern) => pattern.test(error))
  );

  expect(realErrors).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth + 1);

  return widths;
}

async function attachLocatorScreenshot(testInfo: TestInfo, name: string, locator: Locator) {
  await testInfo.attach(name, {
    body: await locator.screenshot(),
    contentType: "image/png",
  });
}

async function gotoAndWaitForMain(page: Page, route: string) {
  await gotoRoute(page, route);
  const main = page.locator("main#main-content");
  await expect(main).toBeVisible();
  return main;
}

test.describe("Interactive visualizations", () => {
  test("showcase page loads all visualization sections", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/showcase");
    await gotoAndWaitForMain(page, "/showcase");
    await expect(page.locator("#showcase-viz-gallery")).toBeVisible();
    await expect(page.locator("#file-reservations")).toBeAttached();

    diagnostics.breadcrumb("Showcase page loaded");
  });

  test("home page visualization components render", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/");
    await gotoAndWaitForMain(page, "/");

    const conceptsSection = page.locator("#home-concepts");
    await expect(conceptsSection).toBeVisible();

    diagnostics.breadcrumb("Concepts section with visualizations present");
  });

  test("architecture page loads visualization", async ({ page, diagnostics }) => {
    diagnostics.setRoute("/architecture");
    await gotoAndWaitForMain(page, "/architecture");
    await expect(page.locator("#overview")).toBeAttached();

    diagnostics.breadcrumb("Architecture page with visualizations loaded");
  });

  test("visualizations handle reduced motion gracefully", async ({ page, diagnostics }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    diagnostics.setRoute("/showcase");
    await gotoAndWaitForMain(page, "/showcase");
    await expect(page.locator("#showcase-viz-gallery")).toBeVisible();

    diagnostics.breadcrumb("Reduced motion: showcase page renders correctly");
  });
});

test.describe("Mobile visualization regressions", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Mobile-only regression coverage");
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("home page renders on mobile without hydration or runtime errors", async ({
    page,
    diagnostics,
  }, testInfo) => {
    const errors = collectUnexpectedErrors(page);

    diagnostics.setRoute("/#flywheel");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoAndWaitForMain(page, "/#flywheel");
    const flywheel = page.locator("#flywheel");
    await flywheel.scrollIntoViewIfNeeded();
    await expect(flywheel.getByRole("button", { name: /NTM/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(1200);

    await attachLocatorScreenshot(testInfo, "mobile-home-flywheel", flywheel);
    expectNoUnexpectedErrors(errors);
    diagnostics.breadcrumb("Mobile home render completed without hydration/runtime console errors");
  });

  test("hero media stays inside the mobile viewport", async ({ page, diagnostics }, testInfo) => {
    diagnostics.setRoute("/");
    await gotoAndWaitForMain(page, "/");

    const hero = page.getByTestId("hero-tui-demo");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/sqlite snapshot replay/i)).toBeVisible({ timeout: 30_000 });

    const widths = await expectNoHorizontalOverflow(page);
    const heroBox = await hero.boundingBox();
    expect(heroBox?.width ?? 0).toBeLessThanOrEqual(widths.innerWidth + 1);

    await attachLocatorScreenshot(testInfo, "mobile-hero-media", hero);
    diagnostics.breadcrumb(`Hero media fits within ${widths.innerWidth}px mobile viewport`);
  });

  test("file reservations visualization stays inside the mobile viewport", async ({
    page,
    diagnostics,
  }, testInfo) => {
    diagnostics.setRoute("/showcase#file-reservations");
    await gotoAndWaitForMain(page, "/showcase#file-reservations");

    const section = page.locator("#file-reservations");
    await section.waitFor({ state: "visible" });
    await page.evaluate(() => {
      document.querySelector("#file-reservations")?.scrollIntoView({ block: "start" });
    });
    await page.waitForTimeout(1200);

    await expect(
      section.getByRole("heading", { name: /Advisory File Reservations/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/File Reservations \+ Guardrail Policy/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(section.getByText("BlueLake")).toBeVisible({ timeout: 30_000 });
    await expect(section.getByText("RedBear")).toBeVisible({ timeout: 30_000 });

    const widths = await expectNoHorizontalOverflow(page);
    const sectionBox = await section.boundingBox();
    expect(sectionBox?.width ?? 0).toBeLessThanOrEqual(widths.innerWidth + 1);

    await attachLocatorScreenshot(testInfo, "mobile-file-reservations", section);
    diagnostics.breadcrumb("File reservations visualization stays within the mobile viewport");
  });

  test("flywheel uses the mobile bottom-sheet interaction without overflow", async ({
    page,
    diagnostics,
  }, testInfo) => {
    const errors = collectUnexpectedErrors(page);

    diagnostics.setRoute("/#flywheel");
    await gotoAndWaitForMain(page, "/#flywheel");

    const section = page.locator("#flywheel");
    await section.waitFor({ state: "visible" });
    await page.evaluate(() => {
      document.querySelector("#flywheel")?.scrollIntoView({ block: "start" });
    });
    await page.waitForTimeout(1800);

    await expect(section.getByRole("button", { name: /NTM/i })).toBeVisible({ timeout: 30_000 });

    const widths = await expectNoHorizontalOverflow(page);
    const sectionBox = await section.boundingBox();
    expect(sectionBox?.width ?? 0).toBeLessThanOrEqual(widths.innerWidth + 1);

    await attachLocatorScreenshot(testInfo, "mobile-flywheel-idle", section);

    const ntmButton = section.getByRole("button", { name: /NTM/i });
    await expect(ntmButton).toBeVisible();
    await ntmButton.click();

    const dialog = page.getByRole("dialog", { name: /Named Tmux Manager/i });
    await expect(dialog).toBeVisible();
    expect(await page.getByText(/Node_Analysis_Active/i).count()).toBe(0);

    await attachLocatorScreenshot(testInfo, "mobile-flywheel-dialog", dialog);

    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();

    expectNoUnexpectedErrors(errors);
    diagnostics.breadcrumb("Flywheel uses the mobile bottom sheet and stays within viewport bounds");
  });
});
