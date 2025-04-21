import { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function getClassList(page: Page, locator: string) {
  const element = page.locator(locator);
  const classAttribute = await element.getAttribute('class');
  return classAttribute?.split(' ')
}

export async function registerAndValidate(
  page : Page,
  email: string,
  password: string,
  confirmPassword: string,
  expectedOutput: string
) {
  await page.getByTestId(`register-email-input`).fill(email);
  await page.getByTestId(`register-pwd-input`).fill(password);
  await page.getByTestId(`register-conf-pwd-input`).fill(confirmPassword);
  await page.getByTestId(`register-button`).click();
  await expect(page.getByText(expectedOutput).nth(0)).toBeVisible();
};
