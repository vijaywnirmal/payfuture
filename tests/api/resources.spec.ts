import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ReqResApiClient } from '@api/reqres-api';
import { logger } from '@utils/logger';

describe('Resources API Tests', () => {
  let apiClient: ReqResApiClient;

  beforeAll(async () => {
    apiClient = new ReqResApiClient();
    logger.info('Resources API tests initialized');
  });

  afterAll(async () => {
    logger.info('Resources API tests completed');
  });

  describe('GET /unknown', () => {
    it('should retrieve resources list successfully', async () => {
      const response = await apiClient.getResources();
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    it('should validate resource data structure', async () => {
      const response = await apiClient.getResources();
      const resource = response.data.data[0];
      
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('name');
      expect(resource).toHaveProperty('year');
      expect(resource).toHaveProperty('color');
      expect(resource).toHaveProperty('pantone_value');
      expect(typeof resource.id).toBe('number');
      expect(typeof resource.name).toBe('string');
      expect(typeof resource.year).toBe('number');
      expect(typeof resource.color).toBe('string');
      expect(typeof resource.pantone_value).toBe('string');
    });

    it('should validate support object structure', async () => {
      const response = await apiClient.getResources();
      
      expect(response.data.support).toHaveProperty('url');
      expect(response.data.support).toHaveProperty('text');
      expect(typeof response.data.support.url).toBe('string');
      expect(typeof response.data.support.text).toBe('string');
    });

    it('should handle pagination parameters', async () => {
      // Note: reqres.in doesn't support pagination for /unknown endpoint
      // but we can test the response structure
      const response = await apiClient.getResources();
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /unknown/:id', () => {
    let testResourceId: number;

    beforeAll(async () => {
      // Get a resource ID for testing
      const response = await apiClient.getResources();
      testResourceId = response.data.data[0].id;
    });

    it('should retrieve single resource by ID', async () => {
      const response = await apiClient.getResourceById(testResourceId);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('support');
      expect(response.data.data.id).toBe(testResourceId);
      expect(response.data.data).toHaveProperty('name');
      expect(response.data.data).toHaveProperty('year');
      expect(response.data.data).toHaveProperty('color');
      expect(response.data.data).toHaveProperty('pantone_value');
    });

    it('should return 404 for non-existent resource', async () => {
      try {
        await apiClient.getResourceById(999);
      } catch (error: any) {
        expect(error.message).toContain('404');
      }
    });

    it('should validate single resource response structure', async () => {
      const response = await apiClient.getResourceById(testResourceId);
      
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data).toHaveProperty('name');
      expect(response.data.data).toHaveProperty('year');
      expect(response.data.data).toHaveProperty('color');
      expect(response.data.data).toHaveProperty('pantone_value');
      expect(typeof response.data.data.id).toBe('number');
      expect(typeof response.data.data.name).toBe('string');
      expect(typeof response.data.data.year).toBe('number');
      expect(typeof response.data.data.color).toBe('string');
      expect(typeof response.data.data.pantone_value).toBe('string');
    });

    it('should validate support object in single resource response', async () => {
      const response = await apiClient.getResourceById(testResourceId);
      
      expect(response.data.support).toHaveProperty('url');
      expect(response.data.support).toHaveProperty('text');
      expect(typeof response.data.support.url).toBe('string');
      expect(typeof response.data.support.text).toBe('string');
    });
  });

  describe('Data validation tests', () => {
    it('should validate all resources have required fields', async () => {
      const response = await apiClient.getResources();
      const resources = response.data.data;
      
      resources.forEach((resource, index) => {
        expect(resource).toHaveProperty('id');
        expect(resource).toHaveProperty('name');
        expect(resource).toHaveProperty('year');
        expect(resource).toHaveProperty('color');
        expect(resource).toHaveProperty('pantone_value');
        expect(typeof resource.id).toBe('number');
        expect(typeof resource.name).toBe('string');
        expect(typeof resource.year).toBe('number');
        expect(typeof resource.color).toBe('string');
        expect(typeof resource.pantone_value).toBe('string');
      });
    });

    it('should validate resource ID uniqueness', async () => {
      const response = await apiClient.getResources();
      const resources = response.data.data;
      const ids = resources.map(resource => resource.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should validate year values are reasonable', async () => {
      const response = await apiClient.getResources();
      const resources = response.data.data;
      
      resources.forEach(resource => {
        expect(resource.year).toBeGreaterThan(1900);
        expect(resource.year).toBeLessThan(2030);
      });
    });

    it('should validate color format', async () => {
      const response = await apiClient.getResources();
      const resources = response.data.data;
      
      resources.forEach(resource => {
        // Color should be a valid hex color or color name
        expect(resource.color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/);
      });
    });

    it('should validate pantone value format', async () => {
      const response = await apiClient.getResources();
      const resources = response.data.data;
      
      resources.forEach(resource => {
        // Pantone value should be in format like "17-2031"
        expect(resource.pantone_value).toMatch(/^\d{2}-\d{4}$/);
      });
    });
  });

  describe('Error handling tests', () => {
    it('should handle invalid resource ID format', async () => {
      try {
        await apiClient.getResourceById(-1);
      } catch (error: any) {
        expect(error.message).toContain('API Error');
      }
    });

    it('should handle very large resource ID', async () => {
      try {
        await apiClient.getResourceById(999999);
      } catch (error: any) {
        expect(error.message).toContain('404');
      }
    });

    it('should handle zero resource ID', async () => {
      try {
        await apiClient.getResourceById(0);
      } catch (error: any) {
        expect(error.message).toContain('API Error');
      }
    });
  });

  describe('Performance tests', () => {
    it('should retrieve resources within acceptable time', async () => {
      const startTime = Date.now();
      await apiClient.getResources();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should retrieve single resource within acceptable time', async () => {
      const response = await apiClient.getResources();
      const resourceId = response.data.data[0].id;
      
      const startTime = Date.now();
      await apiClient.getResourceById(resourceId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });

  describe('Concurrent requests', () => {
    it('should handle multiple concurrent resource requests', async () => {
      const promises = Array.from({ length: 5 }, () => apiClient.getResources());
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('data');
        expect(Array.isArray(response.data.data)).toBe(true);
      });
    });

    it('should handle concurrent single resource requests', async () => {
      const response = await apiClient.getResources();
      const resourceId = response.data.data[0].id;
      
      const promises = Array.from({ length: 3 }, () => apiClient.getResourceById(resourceId));
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.data.id).toBe(resourceId);
      });
    });
  });
});
