import { test, expect } from "@playwright/test";

test("admin loads", async ({ page }) => {
  const res = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(res, "no response from server").not.toBeNull();
  expect(res!.status(), "admin did not return a successful status").toBeLessThan(400);

  await expect(page.locator("body")).toBeVisible();
  await expect(page).toHaveTitle(/.+/);
});
