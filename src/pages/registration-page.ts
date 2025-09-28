import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { UserData } from '@utils/test-data';

export class RegistrationPage extends BasePage {
  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly phoneInput: Locator;
  private readonly termsCheckbox: Locator;
  private readonly newsletterCheckbox: Locator;
  private readonly registerButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.firstNameInput = page.locator('[data-testid="first-name"], #firstName, #first_name');
    this.lastNameInput = page.locator('[data-testid="last-name"], #lastName, #last_name');
    this.emailInput = page.locator('[data-testid="email"], #email, input[type="email"]');
    this.usernameInput = page.locator('[data-testid="username"], #username');
    this.passwordInput = page.locator('[data-testid="password"], #password, input[type="password"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password"], #confirmPassword, #confirm_password');
    this.phoneInput = page.locator('[data-testid="phone"], #phone, input[type="tel"]');
    this.termsCheckbox = page.locator('[data-testid="terms"], #terms, #terms_and_conditions');
    this.newsletterCheckbox = page.locator('[data-testid="newsletter"], #newsletter');
    this.registerButton = page.locator('[data-testid="register-button"], #register-button, button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, .alert-danger');
    this.successMessage = page.locator('[data-testid="success-message"], .success-message, .alert-success');
    this.loginLink = page.locator('[data-testid="login-link"], a[href*="login"]');
  }

  // Navigation
  async goToRegistrationPage(): Promise<void> {
    await this.navigateTo('/register');
  }

  // Registration actions
  async register(userData: UserData, acceptTerms: boolean = true, subscribeNewsletter: boolean = false): Promise<void> {
    await this.fillFirstName(userData.firstName);
    await this.fillLastName(userData.lastName);
    await this.fillEmail(userData.email);
    await this.fillUsername(userData.username);
    await this.fillPassword(userData.password);
    await this.fillConfirmPassword(userData.password);
    
    if (userData.phone) {
      await this.fillPhone(userData.phone);
    }
    
    if (acceptTerms) {
      await this.acceptTerms();
    }
    
    if (subscribeNewsletter) {
      await this.subscribeToNewsletter();
    }
    
    await this.clickRegisterButton();
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.clearAndFill(this.firstNameInput, firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.clearAndFill(this.lastNameInput, lastName);
  }

  async fillEmail(email: string): Promise<void> {
    await this.clearAndFill(this.emailInput, email);
  }

  async fillUsername(username: string): Promise<void> {
    await this.clearAndFill(this.usernameInput, username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.clearAndFill(this.passwordInput, password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.clearAndFill(this.confirmPasswordInput, password);
  }

  async fillPhone(phone: string): Promise<void> {
    await this.clearAndFill(this.phoneInput, phone);
  }

  async acceptTerms(): Promise<void> {
    await this.check(this.termsCheckbox);
  }

  async rejectTerms(): Promise<void> {
    await this.uncheck(this.termsCheckbox);
  }

  async subscribeToNewsletter(): Promise<void> {
    await this.check(this.newsletterCheckbox);
  }

  async unsubscribeFromNewsletter(): Promise<void> {
    await this.uncheck(this.newsletterCheckbox);
  }

  async clickRegisterButton(): Promise<void> {
    await this.click(this.registerButton);
  }

  async goToLogin(): Promise<void> {
    await this.click(this.loginLink);
  }

  // Validations
  async validateRegistrationForm(): Promise<void> {
    await this.shouldBeVisible(this.firstNameInput);
    await this.shouldBeVisible(this.lastNameInput);
    await this.shouldBeVisible(this.emailInput);
    await this.shouldBeVisible(this.usernameInput);
    await this.shouldBeVisible(this.passwordInput);
    await this.shouldBeVisible(this.confirmPasswordInput);
    await this.shouldBeVisible(this.termsCheckbox);
    await this.shouldBeVisible(this.registerButton);
  }

  async validateErrorMessage(expectedMessage: string): Promise<void> {
    await this.shouldBeVisible(this.errorMessage);
    await this.shouldContainText(this.errorMessage, expectedMessage);
  }

  async validateSuccessMessage(expectedMessage: string): Promise<void> {
    await this.shouldBeVisible(this.successMessage);
    await this.shouldContainText(this.successMessage, expectedMessage);
  }

  async validateRegisterButtonDisabled(): Promise<void> {
    await this.shouldBeDisabled(this.registerButton);
  }

  async validateRegisterButtonEnabled(): Promise<void> {
    await this.shouldBeEnabled(this.registerButton);
  }

  // Field validation
  async validateRequiredFields(): Promise<void> {
    await this.shouldBeVisible(this.firstNameInput);
    await this.shouldBeVisible(this.lastNameInput);
    await this.shouldBeVisible(this.emailInput);
    await this.shouldBeVisible(this.usernameInput);
    await this.shouldBeVisible(this.passwordInput);
    await this.shouldBeVisible(this.confirmPasswordInput);
  }

  async validateEmailFormat(email: string): Promise<void> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }

  async validatePasswordMatch(password: string, confirmPassword: string): Promise<void> {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
  }

  // Error scenarios
  async submitEmptyForm(): Promise<void> {
    await this.clickRegisterButton();
  }

  async submitWithInvalidEmail(): Promise<void> {
    await this.fillFirstName('John');
    await this.fillLastName('Doe');
    await this.fillEmail('invalid-email');
    await this.fillUsername('johndoe');
    await this.fillPassword('password123');
    await this.fillConfirmPassword('password123');
    await this.acceptTerms();
    await this.clickRegisterButton();
  }

  async submitWithMismatchedPasswords(): Promise<void> {
    await this.fillFirstName('John');
    await this.fillLastName('Doe');
    await this.fillEmail('john@example.com');
    await this.fillUsername('johndoe');
    await this.fillPassword('password123');
    await this.fillConfirmPassword('different123');
    await this.acceptTerms();
    await this.clickRegisterButton();
  }

  async submitWithoutAcceptingTerms(): Promise<void> {
    await this.fillFirstName('John');
    await this.fillLastName('Doe');
    await this.fillEmail('john@example.com');
    await this.fillUsername('johndoe');
    await this.fillPassword('password123');
    await this.fillConfirmPassword('password123');
    // Don't accept terms
    await this.clickRegisterButton();
  }

  // Get field values
  async getFirstNameValue(): Promise<string> {
    return await this.getValue(this.firstNameInput);
  }

  async getLastNameValue(): Promise<string> {
    return await this.getValue(this.lastNameInput);
  }

  async getEmailValue(): Promise<string> {
    return await this.getValue(this.emailInput);
  }

  async getUsernameValue(): Promise<string> {
    return await this.getValue(this.usernameInput);
  }

  async getPasswordValue(): Promise<string> {
    return await this.getValue(this.passwordInput);
  }

  async getConfirmPasswordValue(): Promise<string> {
    return await this.getValue(this.confirmPasswordInput);
  }

  async getPhoneValue(): Promise<string> {
    return await this.getValue(this.phoneInput);
  }

  async isTermsAccepted(): Promise<boolean> {
    return await this.termsCheckbox.isChecked();
  }

  async isNewsletterSubscribed(): Promise<boolean> {
    return await this.newsletterCheckbox.isChecked();
  }
}
