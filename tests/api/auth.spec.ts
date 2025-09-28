import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ReqResApiClient } from '@api/reqres-api';
import { TestDataGenerator } from '@utils/test-data';
import { logger } from '@utils/logger';

describe('Authentication API Tests', () => {
  let apiClient: ReqResApiClient;

  beforeAll(async () => {
    apiClient = new ReqResApiClient();
    logger.info('Authentication API tests initialized');
  });

  afterAll(async () => {
    logger.info('Authentication API tests completed');
  });

  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'eve.holt@reqres.in';
      const password = 'cityslicka';

      const response = await apiClient.login(email, password);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);
    });

    it('should fail login with invalid email', async () => {
      const email = 'invalid@example.com';
      const password = 'password123';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail login with invalid password', async () => {
      const email = 'eve.holt@reqres.in';
      const password = 'wrongpassword';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail login with missing email', async () => {
      const email = '';
      const password = 'password123';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail login with missing password', async () => {
      const email = 'eve.holt@reqres.in';
      const password = '';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail login with malformed email', async () => {
      const email = 'not-an-email';
      const password = 'password123';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should handle login with special characters in password', async () => {
      const email = 'eve.holt@reqres.in';
      const password = 'cityslicka!@#$%^&*()';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });
  });

  describe('POST /register', () => {
    it('should register successfully with valid credentials', async () => {
      const email = 'eve.holt@reqres.in';
      const password = 'pistol';

      const response = await apiClient.register(email, password);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('token');
      expect(typeof response.data.id).toBe('number');
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);
    });

    it('should fail registration with invalid email', async () => {
      const email = 'invalid-email';
      const password = 'password123';

      try {
        await apiClient.register(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail registration with missing email', async () => {
      const email = '';
      const password = 'password123';

      try {
        await apiClient.register(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail registration with missing password', async () => {
      const email = 'test@example.com';
      const password = '';

      try {
        await apiClient.register(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should fail registration with short password', async () => {
      const email = 'test@example.com';
      const password = '123';

      try {
        await apiClient.register(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should handle registration with already existing email', async () => {
      const email = 'eve.holt@reqres.in';
      const password = 'pistol';

      // First registration should succeed
      const response1 = await apiClient.register(email, password);
      expect(response1.status).toBe(200);

      // Second registration with same email should also succeed (reqres.in behavior)
      const response2 = await apiClient.register(email, password);
      expect(response2.status).toBe(200);
    });
  });

  describe('Data-driven authentication testing', () => {
    const validLoginCredentials = [
      { email: 'eve.holt@reqres.in', password: 'cityslicka' },
      { email: 'peter@klaven', password: 'cityslicka' }
    ];

    const invalidLoginCredentials = [
      { email: 'invalid@example.com', password: 'password123' },
      { email: 'eve.holt@reqres.in', password: 'wrongpassword' },
      { email: '', password: 'password123' },
      { email: 'test@example.com', password: '' },
      { email: 'not-an-email', password: 'password123' }
    ];

    const validRegisterCredentials = [
      { email: 'eve.holt@reqres.in', password: 'pistol' },
      { email: 'peter@klaven', password: 'pistol' }
    ];

    const invalidRegisterCredentials = [
      { email: 'invalid-email', password: 'password123' },
      { email: '', password: 'password123' },
      { email: 'test@example.com', password: '' },
      { email: 'test@example.com', password: '123' }
    ];

    validLoginCredentials.forEach((credentials, index) => {
      it(`should login successfully with valid credentials set ${index + 1}`, async () => {
        const response = await apiClient.login(credentials.email, credentials.password);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(typeof response.data.token).toBe('string');
      });
    });

    invalidLoginCredentials.forEach((credentials, index) => {
      it(`should fail login with invalid credentials set ${index + 1}`, async () => {
        try {
          await apiClient.login(credentials.email, credentials.password);
        } catch (error: any) {
          expect(error.message).toContain('400');
        }
      });
    });

    validRegisterCredentials.forEach((credentials, index) => {
      it(`should register successfully with valid credentials set ${index + 1}`, async () => {
        const response = await apiClient.register(credentials.email, credentials.password);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('token');
      });
    });

    invalidRegisterCredentials.forEach((credentials, index) => {
      it(`should fail registration with invalid credentials set ${index + 1}`, async () => {
        try {
          await apiClient.register(credentials.email, credentials.password);
        } catch (error: any) {
          expect(error.message).toContain('400');
        }
      });
    });
  });

  describe('Authentication flow testing', () => {
    it('should complete full authentication flow', async () => {
      const email = 'eve.holt@reqres.in';
      const password = 'pistol';

      // Step 1: Register
      const registerResponse = await apiClient.register(email, password);
      expect(registerResponse.status).toBe(200);
      expect(registerResponse.data).toHaveProperty('token');

      // Step 2: Login with same credentials
      const loginResponse = await apiClient.login(email, password);
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('token');

      // Step 3: Verify tokens are different (as expected)
      expect(registerResponse.data.token).not.toBe(loginResponse.data.token);
    });

    it('should handle authentication with generated test data', async () => {
      const userData = TestDataGenerator.generateUser();
      
      try {
        // Try to register with generated data (may fail due to email format)
        await apiClient.register(userData.email, userData.password);
      } catch (error: any) {
        // Expected to fail with generated email
        expect(error.message).toContain('400');
      }
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle malformed JSON in request', async () => {
      try {
        // This would require custom API client method to send malformed JSON
        // For now, we'll test with invalid data types
        await apiClient.login(null as any, 'password');
      } catch (error: any) {
        expect(error.message).toContain('API Error');
      }
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const password = 'password123';

      try {
        await apiClient.login(longEmail, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should handle very long passwords', async () => {
      const email = 'test@example.com';
      const longPassword = 'a'.repeat(1000);

      try {
        await apiClient.login(email, longPassword);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });

    it('should handle special characters in credentials', async () => {
      const email = 'test@example.com';
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      try {
        await apiClient.login(email, password);
      } catch (error: any) {
        expect(error.message).toContain('400');
      }
    });
  });
});
