import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ReqResApiClient, User, CreateUserRequest, UpdateUserRequest } from '@api/reqres-api';
import { TestDataGenerator } from '@utils/test-data';
import { logger } from '@utils/logger';

describe('Users API Tests', () => {
  let apiClient: ReqResApiClient;
  let testUser: User;

  beforeAll(async () => {
    apiClient = new ReqResApiClient();
    logger.info('Users API tests initialized');
  });

  afterAll(async () => {
    logger.info('Users API tests completed');
  });

  describe('GET /users', () => {
    it('should retrieve users list successfully', async () => {
      const response = await apiClient.getUsers(1, 6);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('page');
      expect(response.data).toHaveProperty('per_page');
      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('total_pages');
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    it('should retrieve users with pagination', async () => {
      const response = await apiClient.getUsers(2, 3);
      
      expect(response.status).toBe(200);
      expect(response.data.page).toBe(2);
      expect(response.data.per_page).toBe(3);
      expect(response.data.data.length).toBeLessThanOrEqual(3);
    });

    it('should handle invalid page parameter', async () => {
      try {
        await apiClient.getUsers(999, 6);
      } catch (error: any) {
        expect(error.message).toContain('API Error');
      }
    });

    it('should validate user data structure', async () => {
      const response = await apiClient.getUsers(1, 1);
      const user = response.data.data[0];
      
      expect(apiClient.validateUser(user)).toBe(true);
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      expect(user).toHaveProperty('avatar');
      expect(typeof user.id).toBe('number');
      expect(typeof user.email).toBe('string');
      expect(typeof user.first_name).toBe('string');
      expect(typeof user.last_name).toBe('string');
      expect(typeof user.avatar).toBe('string');
    });
  });

  describe('GET /users/:id', () => {
    beforeAll(async () => {
      // Get a test user for subsequent tests
      const response = await apiClient.getUsers(1, 1);
      testUser = response.data.data[0];
    });

    it('should retrieve single user by ID', async () => {
      const response = await apiClient.getUserById(testUser.id);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(response.data.data.id).toBe(testUser.id);
      expect(response.data.data.email).toBe(testUser.email);
      expect(response.data.data.first_name).toBe(testUser.first_name);
      expect(response.data.data.last_name).toBe(testUser.last_name);
    });

    it('should return 404 for non-existent user', async () => {
      try {
        await apiClient.getUserById(999);
      } catch (error: any) {
        expect(error.message).toContain('404');
      }
    });

    it('should validate single user response structure', async () => {
      const response = await apiClient.getUserById(testUser.id);
      
      expect(apiClient.validateUser(response.data.data)).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data).toHaveProperty('email');
      expect(response.data.data).toHaveProperty('first_name');
      expect(response.data.data).toHaveProperty('last_name');
      expect(response.data.data).toHaveProperty('avatar');
    });
  });

  describe('POST /users', () => {
    it('should create a new user successfully', async () => {
      const userData: CreateUserRequest = {
        name: TestDataGenerator.generateRandomString(10),
        job: TestDataGenerator.generateRandomString(10)
      };

      const response = await apiClient.createUser(userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('job');
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data.name).toBe(userData.name);
      expect(response.data.job).toBe(userData.job);
      expect(apiClient.validateCreateUserResponse(response.data)).toBe(true);
    });

    it('should create user with empty name', async () => {
      const userData: CreateUserRequest = {
        name: '',
        job: 'Developer'
      };

      const response = await apiClient.createUser(userData);
      
      expect(response.status).toBe(201);
      expect(response.data.name).toBe('');
      expect(response.data.job).toBe(userData.job);
    });

    it('should create user with special characters', async () => {
      const userData: CreateUserRequest = {
        name: 'Test User @#$%',
        job: 'Developer & Tester'
      };

      const response = await apiClient.createUser(userData);
      
      expect(response.status).toBe(201);
      expect(response.data.name).toBe(userData.name);
      expect(response.data.job).toBe(userData.job);
    });

    it('should handle missing required fields', async () => {
      const userData = {} as CreateUserRequest;

      const response = await apiClient.createUser(userData);
      
      expect(response.status).toBe(201);
      expect(response.data.name).toBeUndefined();
      expect(response.data.job).toBeUndefined();
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updateData: UpdateUserRequest = {
        name: 'Updated Name',
        job: 'Updated Job'
      };

      const response = await apiClient.updateUser(testUser.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('job');
      expect(response.data).toHaveProperty('updatedAt');
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.job).toBe(updateData.job);
      expect(apiClient.validateUpdateUserResponse(response.data)).toBe(true);
    });

    it('should update user with partial data', async () => {
      const updateData: UpdateUserRequest = {
        name: 'Partially Updated Name'
      };

      const response = await apiClient.updateUser(testUser.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updateData.name);
    });

    it('should update non-existent user', async () => {
      const updateData: UpdateUserRequest = {
        name: 'Updated Name',
        job: 'Updated Job'
      };

      const response = await apiClient.updateUser(999, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.job).toBe(updateData.job);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should partially update user successfully', async () => {
      const updateData: UpdateUserRequest = {
        name: 'Patched Name'
      };

      const response = await apiClient.patchUser(testUser.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('job');
      expect(response.data).toHaveProperty('updatedAt');
      expect(response.data.name).toBe(updateData.name);
    });

    it('should patch user with job only', async () => {
      const updateData: UpdateUserRequest = {
        job: 'Patched Job'
      };

      const response = await apiClient.patchUser(testUser.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.job).toBe(updateData.job);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      const response = await apiClient.deleteUser(testUser.id);
      
      expect(response.status).toBe(204);
      expect(response.data).toBeUndefined();
    });

    it('should handle delete non-existent user', async () => {
      const response = await apiClient.deleteUser(999);
      
      expect(response.status).toBe(204);
    });
  });

  describe('Data-driven testing', () => {
    const testCases = [
      { name: 'John Doe', job: 'Developer' },
      { name: 'Jane Smith', job: 'Designer' },
      { name: 'Bob Johnson', job: 'Manager' },
      { name: 'Alice Brown', job: 'Tester' },
      { name: 'Charlie Wilson', job: 'Analyst' }
    ];

    testCases.forEach((testCase, index) => {
      it(`should create user with test case ${index + 1}`, async () => {
        const response = await apiClient.createUser(testCase);
        
        expect(response.status).toBe(201);
        expect(response.data.name).toBe(testCase.name);
        expect(response.data.job).toBe(testCase.job);
        expect(apiClient.validateCreateUserResponse(response.data)).toBe(true);
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle network timeout', async () => {
      const clientWithShortTimeout = new ReqResApiClient();
      clientWithShortTimeout.setBaseURL('https://httpstat.us/200?sleep=5000');
      
      try {
        await clientWithShortTimeout.getUsers();
      } catch (error: any) {
        expect(error.message).toContain('timeout');
      }
    });

    it('should handle retry mechanism', async () => {
      const response = await apiClient.getUserWithRetry(testUser.id, 3);
      
      expect(response).toBeDefined();
      expect(response.id).toBe(testUser.id);
    });

    it('should handle create user with retry', async () => {
      const userData: CreateUserRequest = {
        name: 'Retry Test User',
        job: 'Retry Test Job'
      };

      const response = await apiClient.createUserWithRetry(userData, 3);
      
      expect(response).toBeDefined();
      expect(response.name).toBe(userData.name);
      expect(response.job).toBe(userData.job);
    });
  });
});
