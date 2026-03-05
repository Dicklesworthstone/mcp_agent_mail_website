import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    setupFiles: ["./__tests__/setup.ts"],
    globals: true,
    css: false,
    outputFile: {
      json: "test-results/unit-results.json",
    },
    reporters: ["default", "json", "verbose"],
    // Log test timing for performance regression detection
    logHeapUsage: true,
    coverage: {
      provider: "v8",
      include: ["components/**", "lib/**", "app/**"],
      exclude: ["**/*.d.ts", "**/*.test.*", "node_modules"],
      reportsDirectory: "test-results/coverage",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
