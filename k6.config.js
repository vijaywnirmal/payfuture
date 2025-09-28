// k6 configuration file
export const options = {
  // Default thresholds for all tests
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
  },
  
  // Default stages for load testing
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '60s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  
  // Environment variables
  env: {
    BASE_URL: 'https://reqres.in/api',
    WEB_BASE_URL: 'http://localhost:3000',
  },
  
  // Tags for test categorization
  tags: {
    test_type: 'performance',
    environment: 'staging',
  },
};

// Helper function to get test configuration
export function getTestConfig(testType) {
  const configs = {
    load: {
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 50 },
        { duration: '60s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.1'],
      },
    },
    stress: {
      stages: [
        { duration: '5s', target: 10 },
        { duration: '10s', target: 50 },
        { duration: '20s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '20s', target: 300 },
        { duration: '30s', target: 300 },
        { duration: '10s', target: 0 },
      ],
      thresholds: {
        http_req_duration: ['p(95)<3000'],
        http_req_failed: ['rate<0.2'],
      },
    },
    spike: {
      stages: [
        { duration: '10s', target: 10 },
        { duration: '5s', target: 200 },
        { duration: '10s', target: 10 },
        { duration: '5s', target: 300 },
        { duration: '10s', target: 10 },
        { duration: '5s', target: 500 },
        { duration: '10s', target: 0 },
      ],
      thresholds: {
        http_req_duration: ['p(95)<5000'],
        http_req_failed: ['rate<0.3'],
      },
    },
  };
  
  return configs[testType] || configs.load;
}
