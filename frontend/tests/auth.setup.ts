import { test } from "@playwright/test";
import { loginAndValidate } from "./helpers";
import { adminUser } from "./constants";

const storageStatePath = "playwright/.auth.json";

test.describe.serial("Authentication Setup", () => {
  test("authenticate admin user", async ({ page }) => {
    await page.goto("/");
    await loginAndValidate(
      page,
      adminUser.email,
      adminUser.password,
      "You are signed in"
    );
    await page.context().storageState({ path: storageStatePath });
  });
});