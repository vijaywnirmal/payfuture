import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { UserData } from '@utils/test-data';

export class LoginPage extends BasePage {
  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly registerLink: Locator;
  private readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.emailInput = page.locator('[data-testid="email-input"], #email, input[type="email"]');
    this.passwordInput = page.locator('[data-testid="password-input"], #password, input[type="password"]');
    this.loginButton = page.locator('[data-testid="login-button"], #login-button, button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, .alert-danger');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password"], a[href*="forgot"]');
    this.registerLink = page.locator('[data-testid="register-link"], a[href*="register"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"], #remember-me');
  }

  // Navigation
  async goToLoginPage(): Promise<void> {
    await this.navigateTo('/login');
  }

  // Login actions
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    
    if (rememberMe) {
      await this.checkRememberMe();
    }
    
    await this.clickLoginButton();
  }

  async loginWithUserData(userData: UserData, rememberMe: boolean = false): Promise<void> {
    await this.login(userData.email, userData.password, rememberMe);
  }

  async fillEmail(email: string): Promise<void> {
    await this.clearAndFill(this.emailInput, email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.clearAndFill(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.loginButton);
  }

  async checkRememberMe(): Promise<void> {
    await this.check(this.rememberMeCheckbox);
  }

  async uncheckRememberMe(): Promise<void> {
    await this.uncheck(this.rememberMeCheckbox);
  }

  // Navigation to other pages
  async goToForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  async goToRegister(): Promise<void> {
    await this.click(this.registerLink);
  }

  // Validations
  async validateLoginForm(): Promise<void> {
    await this.shouldBeVisible(this.emailInput);
    await this.shouldBeVisible(this.passwordInput);
    await this.shouldBeVisible(this.loginButton);
  }

  async validateErrorMessage(expectedMessage: string): Promise<void> {
    await this.shouldBeVisible(this.errorMessage);
    await this.shouldContainText(this.errorMessage, expectedMessage);
  }

  async validateLoginButtonDisabled(): Promise<void> {
    await this.shouldBeDisabled(this.loginButton);
  }

  async validateLoginButtonEnabled(): Promise<void> {
    await this.shouldBeEnabled(this.loginButton);
  }

  // Field validation
  async validateEmailField(): Promise<void> {
    await this.shouldBeVisible(this.emailInput);
    await this.shouldBeEnabled(this.emailInput);
  }

  async validatePasswordField(): Promise<void> {
    await this.shouldBeVisible(this.passwordInput);
    await this.shouldBeEnabled(this.passwordInput);
  }

  // Get field values for validation
  async getEmailValue(): Promise<string> {
    return await this.getValue(this.emailInput);
  }

  async getPasswordValue(): Promise<string> {
    return await this.getValue(this.passwordInput);
  }

  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  // Error handling
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  // Form submission validation
  async submitEmptyForm(): Promise<void> {
    await this.clickLoginButton();
  }

  async submitWithInvalidEmail(): Promise<void> {
    await this.fillEmail('invalid-email');
    await this.fillPassword('password123');
    await this.clickLoginButton();
  }

  async submitWithInvalidPassword(): Promise<void> {
    await this.fillEmail('test@example.com');
    await this.fillPassword('wrong');
    await this.clickLoginButton();
  }
}
