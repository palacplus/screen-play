import { Page } from "@playwright/test";

export async function getClassList(page: Page, locator: string) {
  const element = page.locator(locator);
  const classAttribute = await element.getAttribute('class');
  return classAttribute?.split(' ')
}
