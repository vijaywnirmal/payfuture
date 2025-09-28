import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  // Locators
  private readonly welcomeMessage: Locator;
  private readonly userMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly navigationMenu: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly notifications: Locator;
  private readonly profileLink: Locator;
  private readonly settingsLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.welcomeMessage = page.locator('[data-testid="welcome-message"], .welcome-message');
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu, .dropdown-toggle');
    this.logoutButton = page.locator('[data-testid="logout-button"], .logout, a[href*="logout"]');
    this.navigationMenu = page.locator('[data-testid="navigation-menu"], .nav-menu, nav');
    this.searchInput = page.locator('[data-testid="search-input"], #search, input[type="search"]');
    this.searchButton = page.locator('[data-testid="search-button"], .search-button, button[type="submit"]');
    this.notifications = page.locator('[data-testid="notifications"], .notifications, .notification-bell');
    this.profileLink = page.locator('[data-testid="profile-link"], a[href*="profile"]');
    this.settingsLink = page.locator('[data-testid="settings-link"], a[href*="settings"]');
  }

  // Navigation
  async goToDashboard(): Promise<void> {
    await this.navigateTo('/dashboard');
  }

  // User actions
  async logout(): Promise<void> {
    await this.click(this.userMenu);
    await this.click(this.logoutButton);
  }

  async search(query: string): Promise<void> {
    await this.fill(this.searchInput, query);
    await this.click(this.searchButton);
  }

  async goToProfile(): Promise<void> {
    await this.click(this.profileLink);
  }

  async goToSettings(): Promise<void> {
    await this.click(this.settingsLink);
  }

  // Validations
  async validateDashboardLoaded(): Promise<void> {
    await this.shouldBeVisible(this.welcomeMessage);
    await this.shouldBeVisible(this.navigationMenu);
  }

  async validateWelcomeMessage(expectedName?: string): Promise<void> {
    await this.shouldBeVisible(this.welcomeMessage);
    if (expectedName) {
      await this.shouldContainText(this.welcomeMessage, expectedName);
    }
  }

  async validateUserMenuVisible(): Promise<void> {
    await this.shouldBeVisible(this.userMenu);
  }

  async validateSearchFunctionality(): Promise<void> {
    await this.shouldBeVisible(this.searchInput);
    await this.shouldBeVisible(this.searchButton);
  }

  async validateNavigationMenu(): Promise<void> {
    await this.shouldBeVisible(this.navigationMenu);
  }

  // Get data
  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.welcomeMessage);
  }

  async getSearchValue(): Promise<string> {
    return await this.getValue(this.searchInput);
  }

  // Notifications
  async clickNotifications(): Promise<void> {
    await this.click(this.notifications);
  }

  async validateNotificationsVisible(): Promise<void> {
    await this.shouldBeVisible(this.notifications);
  }

  // Responsive behavior
  async validateMobileView(): Promise<void> {
    // Check if mobile menu is visible on smaller screens
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.shouldBeVisible(this.navigationMenu);
  }

  async validateDesktopView(): Promise<void> {
    // Check if full navigation is visible on larger screens
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.shouldBeVisible(this.navigationMenu);
  }
}
