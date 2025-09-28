import dotenv from 'dotenv';

dotenv.config();

export const testConfig = {
  // Application URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  graphqlUrl: process.env.GRAPHQL_URL || 'http://localhost:3000/graphql',

  // Test Configuration
  testEnv: process.env.TEST_ENV || 'development',
  headless: process.env.HEADLESS === 'true',
  browser: process.env.BROWSER || 'chromium',
  parallelWorkers: parseInt(process.env.PARALLEL_WORKERS || '4'),

  // API Testing
  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
  apiRetryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),

  // Performance Testing
  performance: {
    thresholdResponseTime: parseInt(process.env.PERFORMANCE_THRESHOLD_RESPONSE_TIME || '2000'),
    thresholdThroughput: parseInt(process.env.PERFORMANCE_THRESHOLD_THROUGHPUT || '100'),
    duration: process.env.PERFORMANCE_DURATION || '30s',
    vus: parseInt(process.env.PERFORMANCE_VUS || '10'),
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'test_db',
    user: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
  },

  // External Services
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  },

  // Reporting
  allure: {
    resultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
  },
  reports: {
    outputDir: process.env.REPORT_OUTPUT_DIR || 'test-reports',
  },

  // CI/CD
  ci: process.env.CI === 'true',
  githubToken: process.env.GITHUB_TOKEN,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
};
