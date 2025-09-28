import { Config } from '@jest/types';
import { logger } from '@utils/logger';

export default async function globalTeardown(globalConfig: Config.GlobalConfig): Promise<void> {
  logger.info('Global teardown: Cleaning up API test environment');
  
  try {
    // Clean up any global resources
    logger.info('Global teardown: API test environment cleanup completed');
  } catch (error) {
    logger.error('Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}
