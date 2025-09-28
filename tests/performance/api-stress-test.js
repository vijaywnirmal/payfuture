import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');
const successCount = new Counter('success_count');

// Test configuration for stress testing
export const options = {
  stages: [
    { duration: '5s', target: 10 }, // Warm up
    { duration: '10s', target: 50 }, // Ramp up
    { duration: '20s', target: 100 }, // Ramp up to 100 users
    { duration: '30s', target: 200 }, // Ramp up to 200 users
    { duration: '20s', target: 300 }, // Ramp up to 300 users
    { duration: '30s', target: 300 }, // Stay at 300 users (stress test)
    { duration: '10s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.2'], // Error rate must be below 20% (higher for stress test)
    error_rate: ['rate<0.2'], // Custom error rate must be below 20%
    response_time: ['p(95)<3000'], // 95% of requests must complete below 3s
    request_count: ['count>1000'], // Must make at least 1000 requests
    success_count: ['count>800'], // Must have at least 800 successful requests
  },
};

const BASE_URL = 'https://reqres.in/api';

export function setup() {
  console.log('Starting API stress test...');
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const baseUrl = data.baseUrl;
  
  // Randomly choose which endpoint to test
  const testType = Math.random();
  
  if (testType < 0.3) {
    // 30% chance: GET /users
    testGetUsers(baseUrl);
  } else if (testType < 0.5) {
    // 20% chance: GET /users/:id
    testGetUserById(baseUrl);
  } else if (testType < 0.7) {
    // 20% chance: POST /users
    testCreateUser(baseUrl);
  } else if (testType < 0.85) {
    // 15% chance: POST /login
    testLogin(baseUrl);
  } else {
    // 15% chance: GET /unknown
    testGetResources(baseUrl);
  }
  
  sleep(0.1); // Very short sleep for stress testing
}

function testGetUsers(baseUrl) {
  const response = http.get(`${baseUrl}/users?page=1&per_page=6`);
  requestCount.add(1);
  
  const isSuccess = check(response, {
    'GET /users status is 200': (r) => r.status === 200,
    'GET /users response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  if (isSuccess) {
    successCount.add(1);
  }
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

function testGetUserById(baseUrl) {
  const userId = Math.floor(Math.random() * 12) + 1;
  const response = http.get(`${baseUrl}/users/${userId}`);
  requestCount.add(1);
  
  const isSuccess = check(response, {
    'GET /users/:id status is 200': (r) => r.status === 200,
    'GET /users/:id response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  if (isSuccess) {
    successCount.add(1);
  }
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

function testCreateUser(baseUrl) {
  const userData = {
    name: `Stress Test User ${Math.random().toString(36).substr(2, 9)}`,
    job: `Stress Test Job ${Math.random().toString(36).substr(2, 9)}`
  };
  
  const response = http.post(`${baseUrl}/users`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
  });
  requestCount.add(1);
  
  const isSuccess = check(response, {
    'POST /users status is 201': (r) => r.status === 201,
    'POST /users response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  if (isSuccess) {
    successCount.add(1);
  }
  
  errorRate.add(response.status !== 201);
  responseTime.add(response.timings.duration);
}

function testLogin(baseUrl) {
  const loginData = {
    email: 'eve.holt@reqres.in',
    password: 'cityslicka'
  };
  
  const response = http.post(`${baseUrl}/login`, JSON.stringify(loginData), {
    headers: { 'Content-Type': 'application/json' },
  });
  requestCount.add(1);
  
  const isSuccess = check(response, {
    'POST /login status is 200': (r) => r.status === 200,
    'POST /login response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  if (isSuccess) {
    successCount.add(1);
  }
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

function testGetResources(baseUrl) {
  const response = http.get(`${baseUrl}/unknown`);
  requestCount.add(1);
  
  const isSuccess = check(response, {
    'GET /unknown status is 200': (r) => r.status === 200,
    'GET /unknown response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  if (isSuccess) {
    successCount.add(1);
  }
  
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

export function teardown(data) {
  console.log('API stress test completed');
}
