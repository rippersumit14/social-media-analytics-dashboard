import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  timeout: 60000,

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["html"],
  ],

  use: {
    /**
     * Frontend dev server.
     */
    baseURL:
      "http://localhost:5173",

    /**
     * Debugging helpers.
     */
    trace:
      "on-first-retry",

    screenshot:
      "only-on-failure",

    video:
      "retain-on-failure",

    /**
     * Run visible browser for now.
     *
     * Easier learning.
     */
    headless: false,

    viewport: {
      width: 1440,
      height: 900,
    },
  },

  /**
   * Auto-start Vite dev server.
   */
  webServer: {
    command: "npm run dev",

    url: "http://localhost:5173",

    reuseExistingServer:
      !process.env.CI,

    timeout: 120000,
  },
});