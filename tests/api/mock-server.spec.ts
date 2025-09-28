import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MockServer } from '@utils/mock-server';
import axios from 'axios';

describe('Mock Server Tests', () => {
  let mockServer: MockServer;
  const baseURL = 'http://localhost:3001';

  beforeAll(async () => {
    mockServer = new MockServer({
      port: 3001,
      enableLogging: false,
    });
    await mockServer.start();
  });

  afterAll(async () => {
    await mockServer.stop();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await axios.get(`${baseURL}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('uptime');
    });
  });

  describe('Authentication Endpoints', () => {
    it('should handle successful login', async () => {
      const loginData = {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka'
      };

      const response = await axios.post(`${baseURL}/api/auth/login`, loginData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message', 'Login successful');
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('token');
      expect(response.data.data).toHaveProperty('user');
    });

    it('should handle failed login', async () => {
      const loginData = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      try {
        await axios.post(`${baseURL}/api/auth/login`, loginData);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data).toHaveProperty('message', 'Invalid credentials');
      }
    });

    it('should handle registration', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await axios.post(`${baseURL}/api/auth/register`, registerData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message', 'Registration successful');
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data).toHaveProperty('token');
    });

    it('should handle logout', async () => {
      const response = await axios.post(`${baseURL}/api/auth/logout`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('message', 'Logout successful');
    });
  });

  describe('User Endpoints', () => {
    it('should get users list', async () => {
      const response = await axios.get(`${baseURL}/api/users`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('page');
      expect(response.data).toHaveProperty('per_page');
      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('total_pages');
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should get single user', async () => {
      const response = await axios.get(`${baseURL}/api/users/1`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(response.data.data).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent user', async () => {
      try {
        await axios.get(`${baseURL}/api/users/999`);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data).toHaveProperty('message', 'User not found');
      }
    });

    it('should create user', async () => {
      const userData = {
        name: 'John Doe',
        job: 'Developer'
      };

      const response = await axios.post(`${baseURL}/api/users`, userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('name', userData.name);
      expect(response.data).toHaveProperty('job', userData.job);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('createdAt');
    });

    it('should update user', async () => {
      const userData = {
        name: 'Updated Name',
        job: 'Updated Job'
      };

      const response = await axios.put(`${baseURL}/api/users/1`, userData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name', userData.name);
      expect(response.data).toHaveProperty('job', userData.job);
      expect(response.data).toHaveProperty('updatedAt');
    });

    it('should patch user', async () => {
      const userData = {
        name: 'Patched Name'
      };

      const response = await axios.patch(`${baseURL}/api/users/1`, userData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name', userData.name);
      expect(response.data).toHaveProperty('updatedAt');
    });

    it('should delete user', async () => {
      const response = await axios.delete(`${baseURL}/api/users/1`);
      
      expect(response.status).toBe(204);
    });
  });

  describe('Product Endpoints', () => {
    it('should get products list', async () => {
      const response = await axios.get(`${baseURL}/api/products`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should get single product', async () => {
      const response = await axios.get(`${baseURL}/api/products/1`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(response.data.data).toHaveProperty('id', 1);
    });

    it('should create product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        category: 'Test Category',
        inStock: true,
        quantity: 10
      };

      const response = await axios.post(`${baseURL}/api/products`, productData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('name', productData.name);
      expect(response.data).toHaveProperty('price', productData.price);
      expect(response.data).toHaveProperty('id');
    });

    it('should update product', async () => {
      const productData = {
        name: 'Updated Product',
        price: 39.99
      };

      const response = await axios.put(`${baseURL}/api/products/1`, productData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name', productData.name);
      expect(response.data).toHaveProperty('price', productData.price);
      expect(response.data).toHaveProperty('id', 1);
    });

    it('should delete product', async () => {
      const response = await axios.delete(`${baseURL}/api/products/1`);
      
      expect(response.status).toBe(204);
    });
  });

  describe('Order Endpoints', () => {
    it('should get orders list', async () => {
      const response = await axios.get(`${baseURL}/api/orders`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should get single order', async () => {
      const response = await axios.get(`${baseURL}/api/orders/1`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(response.data.data).toHaveProperty('id', 1);
    });

    it('should create order', async () => {
      const orderData = {
        userId: 1,
        productId: 1,
        quantity: 2,
        totalAmount: 59.98
      };

      const response = await axios.post(`${baseURL}/api/orders`, orderData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('userId', orderData.userId);
      expect(response.data).toHaveProperty('totalAmount', orderData.totalAmount);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('createdAt');
    });

    it('should update order', async () => {
      const orderData = {
        status: 'shipped'
      };

      const response = await axios.put(`${baseURL}/api/orders/1`, orderData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', orderData.status);
      expect(response.data).toHaveProperty('id', 1);
      expect(response.data).toHaveProperty('updatedAt');
    });

    it('should delete order', async () => {
      const response = await axios.delete(`${baseURL}/api/orders/1`);
      
      expect(response.status).toBe(204);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      try {
        await axios.post(`${baseURL}/api/users`, 'invalid json', {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        // Missing required fields
      };

      try {
        await axios.post(`${baseURL}/api/users`, invalidData);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('success', false);
        expect(error.response.data).toHaveProperty('message', 'Invalid user data');
        expect(error.response.data).toHaveProperty('errors');
      }
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await axios.options(`${baseURL}/api/users`);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin', '*');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });

  describe('Server Status', () => {
    it('should report server as running', () => {
      expect(mockServer.isServerRunning()).toBe(true);
    });

    it('should return server config', () => {
      const config = mockServer.getConfig();
      
      expect(config).toHaveProperty('port', 3001);
      expect(config).toHaveProperty('basePath', '/api');
      expect(config).toHaveProperty('enableCors', true);
      expect(config).toHaveProperty('enableLogging', false);
    });
  });
});
