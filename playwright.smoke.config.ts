import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:7001",
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
});
