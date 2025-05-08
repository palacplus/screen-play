import { test } from "@playwright/test";
import { login } from "./helpers";
import { adminUser } from "./constants";
import { expect } from "@playwright/test";

const storageStatePath = "playwright/.auth.json";

test.describe.serial("Authentication Setup", () => {
  test("authenticate admin user", async ({ page }) => {
    await page.goto("/home");
    await login(page, adminUser.email, adminUser.password);
    await expect(page.getByText("View Library")).toBeVisible();
    await page.goto("/home");
    await expect(page.getByText("You are signed in").nth(0)).toBeVisible();
    await page.context().storageState({ path: storageStatePath });
  });
});