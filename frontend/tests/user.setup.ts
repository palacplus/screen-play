import { test, expect } from "@playwright/test";
import { adminApiContext } from "./helpers";
import { TEST_USER, STORAGE_STATE_PATH } from "./constants";
import { existsSync } from "fs";

if (existsSync(STORAGE_STATE_PATH)) {
  test.use({ storageState: STORAGE_STATE_PATH });

  test("delete test user", async ({ page }) => {
    const apiContext = await adminApiContext(page);
    const response = await apiContext.delete("/api/auth/user", {
      params: { email: TEST_USER.email },
    });
    expect(response.ok() || response.status() === 404).toBeTruthy();
  });
} else {
  test.skip(true, "Storage state file does not exist. Skipping test.");
}