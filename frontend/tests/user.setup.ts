import { test, expect } from "@playwright/test";
import { adminApiContext } from "./helpers";
import { testUser } from "./constants";
import { existsSync } from "fs";

const storageStatePath = "playwright/.auth.json";

if (existsSync(storageStatePath)) {
  test.use({ storageState: storageStatePath });

  test("delete test user", async ({ page }) => {
    const apiContext = await adminApiContext(page);
    const response = await apiContext.delete("/api/auth/user", {
      params: { email: testUser.email },
    });
    expect(response.ok() || response.status() === 404).toBeTruthy();
  });
} else {
  test.skip(true, "Storage state file does not exist. Skipping test.");
}