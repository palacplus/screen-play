import { test } from "@playwright/test";
import { login } from "./helpers";
import { ADMIN_USER, PAGES, STORAGE_STATE_PATH } from "./constants";
import { expect } from "@playwright/test";

test.describe.serial("Authentication Setup", () => {
  test("authenticate admin user", async ({ page }) => {
    await page.goto(PAGES.home);
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    await expect(page.getByText("View Library")).toBeVisible();
    await page.goto(PAGES.home);
    await expect(page.getByText("Sign Out")).toBeVisible();
    await page.context().storageState({ path: STORAGE_STATE_PATH });
  });
});