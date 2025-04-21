import { test, expect } from "@playwright/test";
import { registerAndValidate } from "./helpers";

test("authenticate", async ({ page }) => {
    const testEmail = "testUser@mymmail.com";
    const response = await page.request.delete('/api/auth/user',
        {
          params : { email: testEmail },
      });
    expect(response.ok()|| response.status() == 404).toBeTruthy();

    await page.goto("/home");
    await page.getByTestId("register-toggle").click();
    await registerAndValidate(
        page,
        testEmail,
        "testPassword123@&",
        "testPassword123@&",
        "Success"
    );
    await page.context().storageState({ path: 'playwright/.auth.json' });
});