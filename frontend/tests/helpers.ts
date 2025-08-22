import { Page, request } from "@playwright/test";
import { STORAGE_STATE_PATH } from "./constants";

export async function getClassList(page: Page, locator: string) {
  const element = page.locator(locator);
  const classAttribute = await element.getAttribute('class');
  return classAttribute?.split(' ')
}

export async function register(
  page: Page,
  email: string,
  password: string,
  confirmPassword: string,
) {
  await page.getByTestId(`register-email-input`).fill(email);
  await page.getByTestId(`register-pwd-input`).fill(password);
  await page.getByTestId(`register-conf-pwd-input`).fill(confirmPassword);
  await page.getByTestId(`register-button`).click();
};

export async function login(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByTestId(`login-email-input`).fill(email);
  await page.getByTestId(`login-pwd-input`).fill(password);
  await page.getByTestId(`login-button`).click();
};

export async function adminApiContext(page: Page) {
  const storageState = await page.context().storageState();
  let token = storageState.origins[0].localStorage.find((item: any) => item.name === "token")?.value;

  if (!token) {
    throw new Error("Bearer token not found in storageState");
  }
  token = token.replace(/^"|"$/g, "");

  const apiContext = await request.newContext({
    storageState: STORAGE_STATE_PATH,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return apiContext;
}

export function generateRandomEmail(): string {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `testuser_${randomString}@example.com`;
}
