import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login-page';
import { DashboardPage } from '@pages/dashboard-page';
import { RegistrationPage } from '@pages/registration-page';
import { TestDataGenerator } from '@utils/test-data';

test.describe('Navigation Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    registrationPage = new RegistrationPage(page);
  });

  test('should complete full user journey from registration to dashboard', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock successful registration
    await loginPage.page.route('**/api/auth/register', route => {
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

    // Mock successful login
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

    // Step 1: Navigate to registration
    await registrationPage.goToRegistrationPage();
    await registrationPage.validateRegistrationForm();

    // Step 2: Register new user
    await registrationPage.register(userData, true, false);
    await registrationPage.validateSuccessMessage('Registration successful');

    // Step 3: Navigate to login
    await registrationPage.goToLogin();
    await loginPage.validateLoginForm();

    // Step 4: Login with registered credentials
    await loginPage.login(userData.email, userData.password);
    await expect(loginPage.page).toHaveURL(/.*dashboard/);

    // Step 5: Verify dashboard access
    await dashboardPage.validateDashboardLoaded();
    await dashboardPage.validateWelcomeMessage(userData.firstName);
  });

  test('should handle navigation between pages', async () => {
    // Test login page navigation
    await loginPage.goToLoginPage();
    await loginPage.goToRegister();
    await expect(loginPage.page).toHaveURL(/.*register/);

    // Test registration page navigation
    await registrationPage.goToLogin();
    await expect(registrationPage.page).toHaveURL(/.*login/);
  });

  test('should maintain session across page refreshes', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock successful login
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

    // Mock session validation
    await loginPage.page.route('**/api/auth/validate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: userData
        })
      });
    });

    await loginPage.goToLoginPage();
    await loginPage.login(userData.email, userData.password);
    await expect(loginPage.page).toHaveURL(/.*dashboard/);

    // Refresh page
    await loginPage.page.reload();
    await dashboardPage.validateDashboardLoaded();
  });

  test('should handle logout and redirect to login', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock successful login
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

    // Mock logout
    await loginPage.page.route('**/api/auth/logout', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Logged out successfully'
        })
      });
    });

    await loginPage.goToLoginPage();
    await loginPage.login(userData.email, userData.password);
    await expect(loginPage.page).toHaveURL(/.*dashboard/);

    // Logout
    await dashboardPage.logout();
    await expect(loginPage.page).toHaveURL(/.*login/);
  });

  test('should handle unauthorized access to protected pages', async () => {
    // Mock unauthorized access
    await loginPage.page.route('**/api/auth/validate', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized'
        })
      });
    });

    // Try to access dashboard without login
    await dashboardPage.goToDashboard();
    await expect(loginPage.page).toHaveURL(/.*login/);
  });

  test('should handle browser back/forward navigation', async () => {
    await loginPage.goToLoginPage();
    await loginPage.goToRegister();
    
    // Go back
    await loginPage.page.goBack();
    await expect(loginPage.page).toHaveURL(/.*login/);
    
    // Go forward
    await loginPage.page.goForward();
    await expect(loginPage.page).toHaveURL(/.*register/);
  });

  test('should handle direct URL access', async () => {
    // Direct access to dashboard
    await loginPage.page.goto('/dashboard');
    await expect(loginPage.page).toHaveURL(/.*login/);

    // Direct access to registration
    await loginPage.page.goto('/register');
    await expect(loginPage.page).toHaveURL(/.*register/);
  });

  test('should validate responsive navigation on mobile', async () => {
    await loginPage.page.setViewportSize({ width: 375, height: 667 });
    await loginPage.goToLoginPage();
    await loginPage.validateLoginForm();

    // Test mobile menu if it exists
    await loginPage.page.setViewportSize({ width: 1920, height: 1080 });
    await loginPage.validateLoginForm();
  });

  test('should handle multiple tab scenarios', async () => {
    const userData = TestDataGenerator.generateUser();
    
    // Mock successful login
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

    await loginPage.goToLoginPage();
    await loginPage.login(userData.email, userData.password);
    await expect(loginPage.page).toHaveURL(/.*dashboard/);

    // Open new tab
    const newPage = await loginPage.page.context().newPage();
    const newDashboardPage = new DashboardPage(newPage);
    
    // Mock session validation for new tab
    await newPage.route('**/api/auth/validate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: userData
        })
      });
    });

    await newDashboardPage.goToDashboard();
    await newDashboardPage.validateDashboardLoaded();
    
    await newPage.close();
  });
});
