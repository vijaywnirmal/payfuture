import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard-page';
import { TestDataGenerator } from '@utils/test-data';
import { testConfig } from '@config/test.config';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goToLoginPage();
  });

  test('should display login form elements', async () => {
    await loginPage.validateLoginForm();
    await loginPage.validateEmailField();
    await loginPage.validatePasswordField();
  });

  test('should login successfully with valid credentials', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock successful login response
    await loginPage.page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: userData,
          token: 'mock-jwt-token'
        })
      });
    });

    await loginPage.login(userData.email, userData.password);
    
    // Verify redirect to dashboard
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
    await dashboardPage.validateDashboardLoaded();
  });

  test('should show error message for invalid credentials', async () => {
    // Mock failed login response
    await loginPage.page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        })
      });
    });

    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.validateErrorMessage('Invalid email or password');
  });

  test('should validate required fields', async () => {
    await loginPage.submitEmptyForm();
    await loginPage.validateErrorMessage('Email is required');
  });

  test('should validate email format', async () => {
    await loginPage.submitWithInvalidEmail();
    await loginPage.validateErrorMessage('Please enter a valid email address');
  });

  test('should validate password field', async () => {
    await loginPage.submitWithInvalidPassword();
    await loginPage.validateErrorMessage('Password is required');
  });

  test('should remember user when remember me is checked', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await loginPage.page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: userData,
          token: 'mock-jwt-token',
          rememberMe: true
        })
      });
    });

    await loginPage.login(userData.email, userData.password, true);
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to forgot password page', async () => {
    await loginPage.goToForgotPassword();
    await expect(loginPage.page).toHaveURL(/.*forgot-password/);
  });

  test('should navigate to registration page', async () => {
    await loginPage.goToRegister();
    await expect(loginPage.page).toHaveURL(/.*register/);
  });

  test('should handle network errors gracefully', async () => {
    // Mock network error
    await loginPage.page.route('**/api/auth/login', route => {
      route.abort('Failed');
    });

    await loginPage.login('test@example.com', 'password123');
    await loginPage.validateErrorMessage('Network error. Please try again.');
  });

  test('should disable login button when form is invalid', async () => {
    await loginPage.fillEmail('invalid-email');
    await loginPage.validateLoginButtonDisabled();
  });

  test('should enable login button when form is valid', async () => {
    await loginPage.fillEmail('valid@example.com');
    await loginPage.fillPassword('password123');
    await loginPage.validateLoginButtonEnabled();
  });
});
