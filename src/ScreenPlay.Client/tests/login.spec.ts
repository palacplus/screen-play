import { test, expect, request, Page } from "@playwright/test";
import { getClassList } from "./helpers";

const location = "/login";

test.describe("Login Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(location);
  });

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("ScreenPlay");
    await expect(
      page.getByRole("heading", {
        name: "Sign In",
      })
    ).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
    await expect(page.getByTestId("register-toggle")).toBeVisible();

    await expect(page.getByTestId("login-email-input")).toBeVisible();
    await expect(page.getByTestId("login-pwd-input")).toBeVisible();

    const loginClasses = await getClassList(page, 'div.login'); 
    expect(loginClasses).not.toContain('active')
  });

  test("should switch to registration form on click", async ({ page }) => {
    await page.getByTestId("register-toggle").click();
    const loginClasses = await getClassList(page, 'div.login'); 
    expect(loginClasses).toContain('active')
  });

    test("should handle valid login input account not found", async ({ page }) => {
    await page.getByTestId("login-email-input").fill("newfakeuser@domain.test");
    await page.getByTestId("login-pwd-input").fill("fakePwd123@&");

    await page.getByTestId("login-button").click();
    await expect(page.getByText("Account not found").nth(0)).toBeVisible()

    await expect(page.getByTestId("login-email-input")).toHaveCSS("background-color", "rgb(255, 0, 0)")
    await page.getByTestId("login-email-input").click();
    await expect(page.getByTestId("login-email-input")).toHaveCSS("background-color", "rgb(238, 238, 238)")
  });
});



test.describe("Registration Form", () => {
  const registerAndValidate = async (
    page : Page,
    email: string,
    password: string,
    confirmPassword: string,
    expectedOutput: string
  ) => {
    await page.getByTestId(`register-email-input`).fill(email);
    await page.getByTestId(`register-pwd-input`).fill(password);
    await page.getByTestId(`register-conf-pwd-input`).fill(confirmPassword);
    await page.getByTestId(`register-button`).click();
    await expect(page.getByText(expectedOutput).nth(0)).toBeVisible();
  };
  test.beforeEach(async ({ page }) => {
    await page.goto(location);
    await page.getByTestId("register-toggle").click();
  });

  test("should have correct metadata and elements", async ({ page }) => {
    await expect(page).toHaveTitle("ScreenPlay");
    await expect(page.getByRole("heading", {name: "Create Account"})).toBeVisible();
    await expect(page.getByTestId("register-button")).toBeVisible();
    await expect(page.getByTestId("login-toggle")).toBeVisible();

    await expect(page.getByTestId("register-email-input")).toBeVisible();
    await expect(page.getByTestId("register-pwd-input")).toBeVisible();
    await expect(page.getByTestId("register-conf-pwd-input")).toBeVisible();

    const loginClasses = await getClassList(page, 'div.login'); 
    expect(loginClasses).toContain('active')
  });

  test("should switch to registration form on click", async ({ page }) => {
    await page.getByTestId("login-toggle").click();
    const loginClasses = await getClassList(page, 'div.login'); 
    expect(loginClasses).not.toContain('active')
  });

  test.describe("input validation", () => {
    const testEmail = "test@myplace.net";
    const testPassword = "njk99Awen@$jn";

    test.beforeAll(async ({ request }) => {
      const response = await request.delete('/api/auth/user',
        {
          params : { email: testEmail },
      });
      const body = await response.text();
      console.log("Delete user response: ", body);
      expect(response.ok()|| response.status() == 404).toBeTruthy();
    });

    test('should register user successfully', async ({ page }) => {
      await test.step('should register user with valid input', async () => {
        // TODO: This will redirect to home page for now but will eventually redirect to dashboard
        await registerAndValidate(page, testEmail, testPassword, testPassword, 'Hello, world');
      });
      await test.step('should reject second attempt with the same input', async () => {
        await page.goto(location);
        await page.getByTestId("register-toggle").click();
        await registerAndValidate(page, testEmail, testPassword, testPassword, 'already taken');
      });
      await test.step('should execute login successfully', async () => {
        await page.goto(location);
        await page.getByTestId(`login-email-input`).fill(testEmail);
        await page.getByTestId(`login-pwd-input`).fill(testPassword);
        await page.getByTestId(`login-button`).click();
        await expect(page.getByText('Hello, world!').nth(0)).toBeVisible();
      });
    });

    const inputData = [
      { email: "invalid", password: testPassword, confirmPassword: testPassword, expectedOutput: 'Invalid Email' },
      { email: testEmail, password: "invalid", confirmPassword: testPassword, expectedOutput: 'Password must be at least' },
      { email: testEmail, password: testPassword, confirmPassword: "invalid", expectedOutput: 'Passwords do not match' },
    ];

    inputData.forEach(({ email, password, confirmPassword, expectedOutput }) => {
      test(`should handle invalid registration input ${expectedOutput}`, async ({ page }) => {
          await registerAndValidate(page, email, password, confirmPassword, expectedOutput);
      });
    });
  });
});