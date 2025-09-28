import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { ReqResApiClient } from '@api/reqres-api';
import { logger } from '@utils/logger';

// Global test setup
beforeAll(async () => {
  logger.info('Starting API test suite');
  
  // Initialize any global test data or configurations
  process.env.NODE_ENV = 'test';
  
  // Set up any global mocks or stubs if needed
  logger.info('API test suite initialized');
});

afterAll(async () => {
  logger.info('API test suite completed');
  
  // Clean up any global resources
  logger.info('API test suite cleanup completed');
});

beforeEach(async () => {
  // Setup before each test
  logger.debug('Setting up individual test');
});

afterEach(async () => {
  // Cleanup after each test
  logger.debug('Cleaning up individual test');
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
