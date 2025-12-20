import { test, expect } from "@playwright/test";

test("website loads", async ({ page }) => {
  const res = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(res).not.toBeNull();
  expect(res!.status()).toBeLessThan(400);
  await expect(page.locator("body")).toBeVisible();
  await expect(page).toHaveTitle(/.+/);
});
