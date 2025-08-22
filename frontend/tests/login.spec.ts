import { test, expect } from "@playwright/test";
import { adminApiContext, generateRandomEmail, getClassList, login, register } from "./helpers";
import { TEST_USER, PAGES, ENDPOINTS } from "./constants";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.home);
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("ScreenPlay");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
    await expect(page.getByTestId("register-toggle")).toBeVisible();

    await expect(page.getByTestId("login-email-input")).toBeVisible();
    await expect(page.getByTestId("login-pwd-input")).toBeVisible();

    const loginClasses = await getClassList(page, "div.login");
    expect(loginClasses).not.toContain("active");
  });

  test("should switch to registration form on click", async ({ page }) => {
    await page.getByTestId("register-toggle").click();
    const loginClasses = await getClassList(page, "div.login");
    expect(loginClasses).toContain("active");
  });

  test("should handle valid login input account not found", async ({ page }) => {
    await page.getByTestId("login-email-input").fill("newfakeuser@domain.test");
    await page.getByTestId("login-pwd-input").fill("fakePwd123@&");

    await page.getByTestId("login-button").click();
    await expect(page.getByText("Account not found").nth(0)).toBeVisible();

    await expect(page.getByTestId("login-email-input")).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await page.getByTestId("login-email-input").click();
    await expect(page.getByTestId("login-email-input")).toHaveCSS("background-color", "rgb(238, 238, 238)");
  });
});

test.describe("Registration Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGES.home);
    await page.getByTestId("register-toggle").click();
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("ScreenPlay");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByTestId("register-button")).toBeVisible();
    await expect(page.getByTestId("login-toggle")).toBeVisible();

    await expect(page.getByTestId("register-email-input")).toBeVisible();
    await expect(page.getByTestId("register-pwd-input")).toBeVisible();
    await expect(page.getByTestId("register-conf-pwd-input")).toBeVisible();

    const loginClasses = await getClassList(page, "div.login");
    expect(loginClasses).toContain("active");
  });

  test("should switch to registration form on click", async ({ page }) => {
    await page.getByTestId("login-toggle").click();
    const loginClasses = await getClassList(page, "div.login");
    expect(loginClasses).not.toContain("active");
  });

  test.describe.serial("input validation", () => {
    let randomEmail: string;

    test.beforeAll(() => {
      randomEmail = generateRandomEmail();
      console.log("Generated random email:", randomEmail);
    });
    test("should register user successfully", async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
        await register(page, randomEmail, TEST_USER.password, TEST_USER.password);
        await expect(page.getByText("View Library")).toBeVisible();
        await page.goto(PAGES.home);
        await expect(page.getByText("Success!").nth(0)).toBeVisible();

      });
  
      test("should execute login and logout successfully", async ({page}) => {
        await page.goto(PAGES.home);
        await login(page, randomEmail, TEST_USER.password);
        await expect(page.getByText("View Library")).toBeVisible();
        await page.goto(PAGES.home);
        await expect(page.getByText("Hello, Friend!").nth(0)).toBeVisible();
      });

      test("should logout on invalid refresh token", async ({ page }) => {
        await page.goto(PAGES.home);
        await login(page, randomEmail, TEST_USER.password);
        await expect(page.getByText("View Library")).toBeVisible();
        await page.goto(PAGES.home);
        await expect(page.getByText("Hello, Friend!").nth(0)).toBeVisible();

        const apiContext = await adminApiContext(page);
        const response = await apiContext.get(ENDPOINTS.logout, {
          params: { email: randomEmail },
        });
        expect(response.ok()).toBeTruthy();

        await page.goto(PAGES.home);
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
        await expect(page.getByTestId("login-email-input")).toBeVisible();
      });
    });

    const inputData = [
      { email: "invalid", password: TEST_USER.password, confirmPassword: TEST_USER.password, expectedOutput: "Invalid Email" },
      { email: TEST_USER.email, password: "invalid", confirmPassword: TEST_USER.password, expectedOutput: "Password must be at least" },
      { email: TEST_USER.email, password: TEST_USER.password, confirmPassword: "invalid", expectedOutput: "Passwords do not match" },
    ];

    inputData.forEach(({ email, password, confirmPassword, expectedOutput }) => {
      test(`should handle invalid registration input ${expectedOutput}`, async ({ page }) => {
        await register(page, email, password, confirmPassword);
        await expect(page.getByText(expectedOutput).nth(0)).toBeVisible();
      });
    });
});
