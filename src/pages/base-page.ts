import { Page, Locator, expect } from '@playwright/test';
import { logger } from '@utils/logger';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = 'http://localhost:3000') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  // Common navigation methods
  async navigateTo(path: string = ''): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // Common interaction methods
  async click(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Clicking element: ${locator}`);
    await locator.click({ timeout });
  }

  async fill(locator: Locator, text: string, timeout: number = 10000): Promise<void> {
    logger.debug(`Filling field with: ${text}`);
    await locator.fill(text, { timeout });
  }

  async clearAndFill(locator: Locator, text: string, timeout: number = 10000): Promise<void> {
    logger.debug(`Clearing and filling field with: ${text}`);
    await locator.clear({ timeout });
    await locator.fill(text, { timeout });
  }

  async selectOption(locator: Locator, value: string, timeout: number = 10000): Promise<void> {
    logger.debug(`Selecting option: ${value}`);
    await locator.selectOption(value, { timeout });
  }

  async check(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Checking checkbox`);
    await locator.check({ timeout });
  }

  async uncheck(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Unchecking checkbox`);
    await locator.uncheck({ timeout });
  }

  // Common assertion methods
  async shouldBeVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Asserting element is visible`);
    await expect(locator).toBeVisible({ timeout });
  }

  async shouldNotBeVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Asserting element is not visible`);
    await expect(locator).not.toBeVisible({ timeout });
  }

  async shouldContainText(locator: Locator, text: string, timeout: number = 10000): Promise<void> {
    logger.debug(`Asserting element contains text: ${text}`);
    await expect(locator).toContainText(text, { timeout });
  }

  async shouldHaveValue(locator: Locator, value: string, timeout: number = 10000): Promise<void> {
    logger.debug(`Asserting element has value: ${value}`);
    await expect(locator).toHaveValue(value, { timeout });
  }

  async shouldBeEnabled(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Asserting element is enabled`);
    await expect(locator).toBeEnabled({ timeout });
  }

  async shouldBeDisabled(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Asserting element is disabled`);
    await expect(locator).toBeDisabled({ timeout });
  }

  // Common utility methods
  async getText(locator: Locator): Promise<string> {
    const text = await locator.textContent();
    logger.debug(`Retrieved text: ${text}`);
    return text || '';
  }

  async getValue(locator: Locator): Promise<string> {
    const value = await locator.inputValue();
    logger.debug(`Retrieved value: ${value}`);
    return value;
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Waiting for element to be visible`);
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForElementToDisappear(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Waiting for element to disappear`);
    await locator.waitFor({ state: 'hidden', timeout });
  }

  // Screenshot and debugging methods
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${name}-${timestamp}.png`;
    await this.page.screenshot({ path: `test-results/screenshots/${filename}` });
    logger.info(`Screenshot saved: ${filename}`);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
