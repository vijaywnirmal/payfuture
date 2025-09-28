import { test, expect } from '@playwright/test';
import { RegistrationPage } from '@pages/registration-page';
import { LoginPage } from '@pages/login-page';
import { TestDataGenerator } from '@utils/test-data';

test.describe('Registration Functionality', () => {
  let registrationPage: RegistrationPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    loginPage = new LoginPage(page);
    await registrationPage.goToRegistrationPage();
  });

  test('should display registration form elements', async () => {
    await registrationPage.validateRegistrationForm();
    await registrationPage.validateRequiredFields();
  });

  test('should register successfully with valid data', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock successful registration response
    await registrationPage.page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: userData
        })
      });
    });

    await registrationPage.register(userData, true, false);
    await registrationPage.validateSuccessMessage('Registration successful');
  });

  test('should show error for duplicate email', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock duplicate email error
    await registrationPage.page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Email already exists'
        })
      });
    });

    await registrationPage.register(userData, true, false);
    await registrationPage.validateErrorMessage('Email already exists');
  });

  test('should validate required fields', async () => {
    await registrationPage.submitEmptyForm();
    await registrationPage.validateErrorMessage('All fields are required');
  });

  test('should validate email format', async () => {
    await registrationPage.submitWithInvalidEmail();
    await registrationPage.validateErrorMessage('Please enter a valid email address');
  });

  test('should validate password confirmation', async () => {
    await registrationPage.submitWithMismatchedPasswords();
    await registrationPage.validateErrorMessage('Passwords do not match');
  });

  test('should require terms acceptance', async () => {
    await registrationPage.submitWithoutAcceptingTerms();
    await registrationPage.validateErrorMessage('You must accept the terms and conditions');
  });

  test('should validate password strength', async () => {
    const weakPasswordUser = TestDataGenerator.generateUser();
    weakPasswordUser.password = '123';
    
    await registrationPage.page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Password must be at least 8 characters long'
        })
      });
    });

    await registrationPage.register(weakPasswordUser, true, false);
    await registrationPage.validateErrorMessage('Password must be at least 8 characters long');
  });

  test('should validate username uniqueness', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock username already exists error
    await registrationPage.page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Username already taken'
        })
      });
    });

    await registrationPage.register(userData, true, false);
    await registrationPage.validateErrorMessage('Username already taken');
  });

  test('should handle optional phone field', async () => {
    const userData = TestDataGenerator.generateUser();
    userData.phone = undefined; // No phone number
    
    await registrationPage.page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: userData
        })
      });
    });

    await registrationPage.register(userData, true, false);
    await registrationPage.validateSuccessMessage('Registration successful');
  });

  test('should subscribe to newsletter when checked', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await registrationPage.page.route('**/api/auth/register', route => {
      const requestBody = JSON.parse(route.request().postData() || '{}');
      expect(requestBody.newsletter).toBe(true);
      
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: userData
        })
      });
    });

    await registrationPage.register(userData, true, true);
    await registrationPage.validateSuccessMessage('Registration successful');
  });

  test('should navigate to login page', async () => {
    await registrationPage.goToLogin();
    await expect(registrationPage.page).toHaveURL(/.*login/);
  });

  test('should validate form field values', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await registrationPage.fillFirstName(userData.firstName);
    await registrationPage.fillLastName(userData.lastName);
    await registrationPage.fillEmail(userData.email);
    await registrationPage.fillUsername(userData.username);
    await registrationPage.fillPassword(userData.password);
    await registrationPage.fillConfirmPassword(userData.password);
    
    expect(await registrationPage.getFirstNameValue()).toBe(userData.firstName);
    expect(await registrationPage.getLastNameValue()).toBe(userData.lastName);
    expect(await registrationPage.getEmailValue()).toBe(userData.email);
    expect(await registrationPage.getUsernameValue()).toBe(userData.username);
  });

  test('should handle server errors gracefully', async () => {
    // Mock server error
    await registrationPage.page.route('**/api/auth/register', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error'
        })
      });
    });

    const userData = TestDataGenerator.generateUser();
    await registrationPage.register(userData, true, false);
    await registrationPage.validateErrorMessage('Internal server error');
  });
});
