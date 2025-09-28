import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration for spike testing
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Normal load
    { duration: '5s', target: 200 }, // Spike to 200 users
    { duration: '10s', target: 10 }, // Back to normal
    { duration: '5s', target: 300 }, // Another spike to 300 users
    { duration: '10s', target: 10 }, // Back to normal
    { duration: '5s', target: 500 }, // Final spike to 500 users
    { duration: '10s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s (higher for spike test)
    http_req_failed: ['rate<0.3'], // Error rate must be below 30% (higher for spike test)
    error_rate: ['rate<0.3'], // Custom error rate must be below 30%
    response_time: ['p(95)<5000'], // 95% of requests must complete below 5s
  },
};

const BASE_URL = 'https://reqres.in/api';

export function setup() {
  console.log('Starting API spike test...');
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const baseUrl = data.baseUrl;
  
  // Test multiple endpoints during spike
  const endpoints = [
    () => testGetUsers(baseUrl),
    () => testGetUserById(baseUrl),
    () => testCreateUser(baseUrl),
    () => testLogin(baseUrl),
    () => testGetResources(baseUrl),
  ];
  
  // Randomly select 2-3 endpoints to test per iteration
  const numEndpoints = Math.floor(Math.random() * 2) + 2; // 2 or 3 endpoints
  const selectedEndpoints = endpoints.sort(() => 0.5 - Math.random()).slice(0, numEndpoints);
  
  selectedEndpoints.forEach(endpoint => {
    endpoint();
  });
  
  sleep(0.5); // Short sleep between requests
}

function testGetUsers(baseUrl) {
  const response = http.get(`${baseUrl}/users?page=1&per_page=6`);
  check(response, {
    'GET /users status is 200': (r) => r.status === 200,
    'GET /users response time < 5000ms': (r) => r.timings.duration < 5000,
  });
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

function testGetUserById(baseUrl) {
  const userId = Math.floor(Math.random() * 12) + 1;
  const response = http.get(`${baseUrl}/users/${userId}`);
  check(response, {
    'GET /users/:id status is 200': (r) => r.status === 200,
    'GET /users/:id response time < 5000ms': (r) => r.timings.duration < 5000,
  });
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

function testCreateUser(baseUrl) {
  const userData = {
    name: `Spike Test User ${Math.random().toString(36).substr(2, 9)}`,
    job: `Spike Test Job ${Math.random().toString(36).substr(2, 9)}`
  };
  
  const response = http.post(`${baseUrl}/users`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(response, {
    'POST /users status is 201': (r) => r.status === 201,
    'POST /users response time < 5000ms': (r) => r.timings.duration < 5000,
  });
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
  check(response, {
    'POST /login status is 200': (r) => r.status === 200,
    'POST /login response time < 5000ms': (r) => r.timings.duration < 5000,
  });
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

function testGetResources(baseUrl) {
  const response = http.get(`${baseUrl}/unknown`);
  check(response, {
    'GET /unknown status is 200': (r) => r.status === 200,
    'GET /unknown response time < 5000ms': (r) => r.timings.duration < 5000,
  });
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
}

export function teardown(data) {
  console.log('API spike test completed');
}
