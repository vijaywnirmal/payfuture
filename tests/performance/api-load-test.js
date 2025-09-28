import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp up to 10 users
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '60s', target: 100 }, // Ramp up to 100 users
    { duration: '30s', target: 100 }, // Stay at 100 users
    { duration: '10s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    error_rate: ['rate<0.1'], // Custom error rate must be below 10%
    response_time: ['p(95)<2000'], // 95% of requests must complete below 2s
  },
};

const BASE_URL = 'https://reqres.in/api';

export function setup() {
  console.log('Starting API load test...');
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const baseUrl = data.baseUrl;
  
  // Test 1: GET /users
  const usersResponse = http.get(`${baseUrl}/users?page=1&per_page=6`);
  check(usersResponse, {
    'GET /users status is 200': (r) => r.status === 200,
    'GET /users response time < 2000ms': (r) => r.timings.duration < 2000,
    'GET /users has data array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.data);
    },
    'GET /users has pagination info': (r) => {
      const body = JSON.parse(r.body);
      return body.hasOwnProperty('page') && body.hasOwnProperty('per_page');
    },
  });
  errorRate.add(usersResponse.status !== 200);
  responseTime.add(usersResponse.timings.duration);
  
  sleep(1);
  
  // Test 2: GET /users/:id
  const userId = Math.floor(Math.random() * 12) + 1; // Random user ID between 1-12
  const userResponse = http.get(`${baseUrl}/users/${userId}`);
  check(userResponse, {
    'GET /users/:id status is 200': (r) => r.status === 200,
    'GET /users/:id response time < 2000ms': (r) => r.timings.duration < 2000,
    'GET /users/:id has user data': (r) => {
      const body = JSON.parse(r.body);
      return body.hasOwnProperty('data') && body.data.hasOwnProperty('id');
    },
  });
  errorRate.add(userResponse.status !== 200);
  responseTime.add(userResponse.timings.duration);
  
  sleep(1);
  
  // Test 3: POST /users
  const userData = {
    name: `Load Test User ${Math.random().toString(36).substr(2, 9)}`,
    job: `Load Test Job ${Math.random().toString(36).substr(2, 9)}`
  };
  
  const createUserResponse = http.post(`${baseUrl}/users`, JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(createUserResponse, {
    'POST /users status is 201': (r) => r.status === 201,
    'POST /users response time < 2000ms': (r) => r.timings.duration < 2000,
    'POST /users returns created user': (r) => {
      const body = JSON.parse(r.body);
      return body.hasOwnProperty('name') && body.hasOwnProperty('job');
    },
  });
  errorRate.add(createUserResponse.status !== 201);
  responseTime.add(createUserResponse.timings.duration);
  
  sleep(1);
  
  // Test 4: PUT /users/:id
  const updateData = {
    name: `Updated Load Test User ${Math.random().toString(36).substr(2, 9)}`,
    job: `Updated Load Test Job ${Math.random().toString(36).substr(2, 9)}`
  };
  
  const updateUserResponse = http.put(`${baseUrl}/users/${userId}`, JSON.stringify(updateData), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(updateUserResponse, {
    'PUT /users/:id status is 200': (r) => r.status === 200,
    'PUT /users/:id response time < 2000ms': (r) => r.timings.duration < 2000,
    'PUT /users/:id returns updated user': (r) => {
      const body = JSON.parse(r.body);
      return body.hasOwnProperty('name') && body.hasOwnProperty('job');
    },
  });
  errorRate.add(updateUserResponse.status !== 200);
  responseTime.add(updateUserResponse.timings.duration);
  
  sleep(1);
  
  // Test 5: POST /login
  const loginData = {
    email: 'eve.holt@reqres.in',
    password: 'cityslicka'
  };
  
  const loginResponse = http.post(`${baseUrl}/login`, JSON.stringify(loginData), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(loginResponse, {
    'POST /login status is 200': (r) => r.status === 200,
    'POST /login response time < 2000ms': (r) => r.timings.duration < 2000,
    'POST /login returns token': (r) => {
      const body = JSON.parse(r.body);
      return body.hasOwnProperty('token');
    },
  });
  errorRate.add(loginResponse.status !== 200);
  responseTime.add(loginResponse.timings.duration);
  
  sleep(1);
  
  // Test 6: GET /unknown
  const resourcesResponse = http.get(`${baseUrl}/unknown`);
  check(resourcesResponse, {
    'GET /unknown status is 200': (r) => r.status === 200,
    'GET /unknown response time < 2000ms': (r) => r.timings.duration < 2000,
    'GET /unknown has data array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.data);
    },
  });
  errorRate.add(resourcesResponse.status !== 200);
  responseTime.add(resourcesResponse.timings.duration);
  
  sleep(1);
}

export function teardown(data) {
  console.log('API load test completed');
}
