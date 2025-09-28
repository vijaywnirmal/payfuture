import { describe, it, expect } from '@jest/globals';
import { SchemaValidator } from '@utils/schema-validator';
import { TestDataGenerator } from '@utils/test-data';

describe('Schema Validation Tests', () => {
  describe('User Schema Validation', () => {
    it('should validate valid user data', () => {
      const userData = TestDataGenerator.generateUser();
      const result = SchemaValidator.validateUser(userData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it('should reject user with invalid email', () => {
      const userData = TestDataGenerator.generateUser();
      userData.email = 'invalid-email';
      
      const result = SchemaValidator.validateUser(userData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"email" must be a valid email');
    });

    it('should reject user with short password', () => {
      const userData = TestDataGenerator.generateUser();
      userData.password = '123';
      
      const result = SchemaValidator.validateUser(userData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"password" length must be at least 8 characters long');
    });

    it('should reject user with missing required fields', () => {
      const userData = {
        email: 'test@example.com',
        // Missing firstName, lastName, username, password
      };
      
      const result = SchemaValidator.validateUser(userData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"firstName" is required');
      expect(result.errors).toContain('"lastName" is required');
      expect(result.errors).toContain('"username" is required');
      expect(result.errors).toContain('"password" is required');
    });

    it('should validate optional fields when provided', () => {
      const userData = TestDataGenerator.generateUser();
      userData.phone = '+1-555-123-4567';
      
      const result = SchemaValidator.validateUser(userData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject user with invalid phone number', () => {
      const userData = TestDataGenerator.generateUser();
      userData.phone = 'invalid-phone';
      
      const result = SchemaValidator.validateUser(userData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"phone" with value "invalid-phone" fails to match the required pattern');
    });
  });

  describe('Create User Schema Validation', () => {
    it('should validate valid create user data', () => {
      const userData = {
        name: 'John Doe',
        job: 'Developer'
      };
      
      const result = SchemaValidator.validateCreateUser(userData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject create user with missing name', () => {
      const userData = {
        job: 'Developer'
      };
      
      const result = SchemaValidator.validateCreateUser(userData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"name" is required');
    });

    it('should reject create user with empty name', () => {
      const userData = {
        name: '',
        job: 'Developer'
      };
      
      const result = SchemaValidator.validateCreateUser(userData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"name" is not allowed to be empty');
    });
  });

  describe('Authentication Schema Validation', () => {
    it('should validate valid login data', () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = SchemaValidator.validateLogin(loginData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject login with invalid email', () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = SchemaValidator.validateLogin(loginData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"email" must be a valid email');
    });

    it('should reject login with missing password', () => {
      const loginData = {
        email: 'test@example.com'
      };
      
      const result = SchemaValidator.validateLogin(loginData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"password" is required');
    });

    it('should validate valid registration data', () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = SchemaValidator.validateRegister(registerData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Product Schema Validation', () => {
    it('should validate valid product data', () => {
      const productData = TestDataGenerator.generateProduct();
      
      const result = SchemaValidator.validateProduct(productData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject product with negative price', () => {
      const productData = TestDataGenerator.generateProduct();
      productData.price = -10;
      
      const result = SchemaValidator.validateProduct(productData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"price" must be a positive number');
    });

    it('should reject product with invalid category', () => {
      const productData = TestDataGenerator.generateProduct();
      productData.category = '';
      
      const result = SchemaValidator.validateProduct(productData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"category" is not allowed to be empty');
    });
  });

  describe('Order Schema Validation', () => {
    it('should validate valid order data', () => {
      const orderData = {
        userId: 1,
        userEmail: 'test@example.com',
        items: [
          {
            productId: 1,
            productName: 'Test Product',
            quantity: 2,
            price: 29.99
          }
        ],
        totalAmount: 59.98,
        status: 'pending',
        paymentMethod: 'credit_card',
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      const result = SchemaValidator.validateOrder(orderData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject order with invalid status', () => {
      const orderData = {
        userId: 1,
        userEmail: 'test@example.com',
        items: [
          {
            productId: 1,
            productName: 'Test Product',
            quantity: 2,
            price: 29.99
          }
        ],
        totalAmount: 59.98,
        status: 'invalid_status',
        paymentMethod: 'credit_card',
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      const result = SchemaValidator.validateOrder(orderData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"status" must be one of [pending, processing, shipped, delivered, cancelled]');
    });

    it('should reject order with empty items array', () => {
      const orderData = {
        userId: 1,
        userEmail: 'test@example.com',
        items: [],
        totalAmount: 0,
        status: 'pending',
        paymentMethod: 'credit_card',
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      const result = SchemaValidator.validateOrder(orderData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"items" must contain at least 1 items');
    });
  });

  describe('API Response Schema Validation', () => {
    it('should validate valid API response', () => {
      const responseData = {
        success: true,
        message: 'Operation successful',
        data: { id: 1, name: 'Test' },
        timestamp: new Date().toISOString()
      };
      
      const result = SchemaValidator.validateApiResponse(responseData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject API response without success field', () => {
      const responseData = {
        message: 'Operation successful',
        data: { id: 1, name: 'Test' }
      };
      
      const result = SchemaValidator.validateApiResponse(responseData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('"success" is required');
    });
  });

  describe('Custom Validation Methods', () => {
    it('should validate email format', () => {
      expect(SchemaValidator.validateEmail('test@example.com')).toBe(true);
      expect(SchemaValidator.validateEmail('invalid-email')).toBe(false);
      expect(SchemaValidator.validateEmail('')).toBe(false);
    });

    it('should validate password strength', () => {
      const weakPassword = '123';
      const strongPassword = 'Password123!';
      
      const weakResult = SchemaValidator.validatePassword(weakPassword);
      const strongResult = SchemaValidator.validatePassword(strongPassword);
      
      expect(weakResult.isValid).toBe(false);
      expect(weakResult.errors).toContain('Password must be at least 8 characters long');
      
      expect(strongResult.isValid).toBe(true);
      expect(strongResult.errors).toHaveLength(0);
    });

    it('should validate phone number format', () => {
      expect(SchemaValidator.validatePhone('+1-555-123-4567')).toBe(true);
      expect(SchemaValidator.validatePhone('555-123-4567')).toBe(true);
      expect(SchemaValidator.validatePhone('(555) 123-4567')).toBe(true);
      expect(SchemaValidator.validatePhone('invalid-phone')).toBe(false);
    });

    it('should validate URL format', () => {
      expect(SchemaValidator.validateUrl('https://example.com')).toBe(true);
      expect(SchemaValidator.validateUrl('http://localhost:3000')).toBe(true);
      expect(SchemaValidator.validateUrl('invalid-url')).toBe(false);
      expect(SchemaValidator.validateUrl('')).toBe(false);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple items', () => {
      const users = TestDataGenerator.generateUsers(3);
      const results = SchemaValidator.validateBatch(users, SchemaValidator.userSchema, 'User');
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should identify invalid items in batch', () => {
      const users = [
        TestDataGenerator.generateUser(),
        { email: 'invalid-email' }, // Invalid user
        TestDataGenerator.generateUser()
      ];
      
      const results = SchemaValidator.validateBatch(users, SchemaValidator.userSchema, 'User');
      
      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
    });
  });

  describe('Schema Generation', () => {
    it('should generate schema from data', () => {
      const sampleData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        active: true,
        tags: ['developer', 'tester']
      };
      
      const schema = SchemaValidator.generateSchemaFromData(sampleData, 'Sample');
      
      expect(schema).toBeDefined();
      expect(schema.validate(sampleData).error).toBeUndefined();
    });
  });
});
