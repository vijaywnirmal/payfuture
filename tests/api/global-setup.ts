import { Config } from '@jest/types';
import { logger } from '@utils/logger';

export default async function globalSetup(globalConfig: Config.GlobalConfig): Promise<void> {
  logger.info('Global setup: Starting API test environment');
  
  try {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.API_BASE_URL = 'https://reqres.in/api';
    process.env.API_TIMEOUT = '30000';
    
    // Initialize any global test data
    logger.info('Global setup: Test environment configured');
    
    // Verify external API availability
    const { ReqResApiClient } = await import('@api/reqres-api');
    const apiClient = new ReqResApiClient();
    
    try {
      await apiClient.getUsers(1, 1);
      logger.info('Global setup: External API is available');
    } catch (error) {
      logger.warn('Global setup: External API may not be available', error);
    }
    
    logger.info('Global setup: API test environment ready');
  } catch (error) {
    logger.error('Global setup failed:', error);
    throw error;
  }
}
