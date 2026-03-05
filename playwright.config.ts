import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ["html", { outputFolder: "test-results/e2e-report", open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
    process.env.CI ? ["github"] : ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    // Deterministic viewport
    viewport: { width: 1280, height: 720 },
    // Stable locale/timezone for deterministic snapshots
    locale: "en-US",
    timezoneId: "America/New_York",
    // Note: Use page.emulateMedia({ reducedMotion: 'reduce' }) in tests for deterministic animations
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "bun run build && bun run start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
