import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration for web load testing
export const options = {
  stages: [
    { duration: '10s', target: 5 }, // Ramp up to 5 users
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '60s', target: 50 }, // Ramp up to 50 users
    { duration: '30s', target: 50 }, // Stay at 50 users
    { duration: '10s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    error_rate: ['rate<0.1'], // Custom error rate must be below 10%
    response_time: ['p(95)<3000'], // 95% of requests must complete below 3s
  },
};

// Mock web application endpoints (replace with actual URLs)
const BASE_URL = 'http://localhost:3000';

export function setup() {
  console.log('Starting web load test...');
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const baseUrl = data.baseUrl;
  
  // Simulate user journey
  simulateUserJourney(baseUrl);
  
  sleep(1);
}

function simulateUserJourney(baseUrl) {
  // Step 1: Visit homepage
  const homeResponse = http.get(`${baseUrl}/`);
  check(homeResponse, {
    'Homepage loads successfully': (r) => r.status === 200,
    'Homepage response time < 3000ms': (r) => r.timings.duration < 3000,
    'Homepage contains expected content': (r) => r.body.includes('html') || r.body.includes('<!DOCTYPE'),
  });
  errorRate.add(homeResponse.status !== 200);
  responseTime.add(homeResponse.timings.duration);
  
  sleep(0.5);
  
  // Step 2: Visit login page
  const loginPageResponse = http.get(`${baseUrl}/login`);
  check(loginPageResponse, {
    'Login page loads successfully': (r) => r.status === 200,
    'Login page response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  errorRate.add(loginPageResponse.status !== 200);
  responseTime.add(loginPageResponse.timings.duration);
  
  sleep(0.5);
  
  // Step 3: Attempt login (simulate form submission)
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, JSON.stringify(loginData), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(loginResponse, {
    'Login request processed': (r) => r.status === 200 || r.status === 401, // 401 is expected for invalid credentials
    'Login response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  errorRate.add(loginResponse.status >= 500);
  responseTime.add(loginResponse.timings.duration);
  
  sleep(0.5);
  
  // Step 4: Visit registration page
  const registerPageResponse = http.get(`${baseUrl}/register`);
  check(registerPageResponse, {
    'Registration page loads successfully': (r) => r.status === 200,
    'Registration page response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  errorRate.add(registerPageResponse.status !== 200);
  responseTime.add(registerPageResponse.timings.duration);
  
  sleep(0.5);
  
  // Step 5: Attempt registration
  const registerData = {
    firstName: `TestUser${Math.random().toString(36).substr(2, 5)}`,
    lastName: `TestLast${Math.random().toString(36).substr(2, 5)}`,
    email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
    password: 'password123',
    confirmPassword: 'password123'
  };
  
  const registerResponse = http.post(`${baseUrl}/api/auth/register`, JSON.stringify(registerData), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(registerResponse, {
    'Registration request processed': (r) => r.status === 201 || r.status === 400, // 400 is expected for validation errors
    'Registration response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  errorRate.add(registerResponse.status >= 500);
  responseTime.add(registerResponse.timings.duration);
  
  sleep(0.5);
  
  // Step 6: Visit dashboard (if login was successful)
  if (loginResponse.status === 200) {
    const dashboardResponse = http.get(`${baseUrl}/dashboard`);
    check(dashboardResponse, {
      'Dashboard loads successfully': (r) => r.status === 200,
      'Dashboard response time < 3000ms': (r) => r.timings.duration < 3000,
    });
    errorRate.add(dashboardResponse.status !== 200);
    responseTime.add(dashboardResponse.timings.duration);
  }
  
  sleep(0.5);
  
  // Step 7: Visit API endpoints
  const apiUsersResponse = http.get(`${baseUrl}/api/users`);
  check(apiUsersResponse, {
    'API users endpoint accessible': (r) => r.status === 200 || r.status === 401, // 401 if not authenticated
    'API users response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  errorRate.add(apiUsersResponse.status >= 500);
  responseTime.add(apiUsersResponse.timings.duration);
  
  sleep(0.5);
  
  // Step 8: Visit static assets (CSS, JS)
  const cssResponse = http.get(`${baseUrl}/static/css/main.css`);
  check(cssResponse, {
    'CSS loads successfully': (r) => r.status === 200 || r.status === 404, // 404 is acceptable for missing files
    'CSS response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  errorRate.add(cssResponse.status >= 500);
  responseTime.add(cssResponse.timings.duration);
  
  const jsResponse = http.get(`${baseUrl}/static/js/main.js`);
  check(jsResponse, {
    'JS loads successfully': (r) => r.status === 200 || r.status === 404, // 404 is acceptable for missing files
    'JS response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  errorRate.add(jsResponse.status >= 500);
  responseTime.add(jsResponse.timings.duration);
}

export function teardown(data) {
  console.log('Web load test completed');
}
