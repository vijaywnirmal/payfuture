# Performance Testing Guide

This document provides comprehensive guidance for performance testing using k6 in the Full-Stack Test Automation Framework.

## Overview

Performance testing is implemented using **k6**, a modern load testing tool that provides:
- High-performance load testing
- Real-time metrics and reporting
- JavaScript-based test scripts
- Cloud and on-premises execution
- Integration with CI/CD pipelines

## Test Structure

### Test Files
- `tests/performance/api-load-test.js` - Standard load testing
- `tests/performance/api-stress-test.js` - Stress testing beyond normal capacity
- `tests/performance/api-spike-test.js` - Spike testing for traffic bursts
- `tests/performance/web-load-test.js` - Web application load testing

### Configuration
- `k6.config.js` - Global k6 configuration
- Environment-specific settings
- Threshold definitions
- Custom metrics

## Test Scenarios

### 1. Load Testing

**Purpose**: Test system under expected normal load conditions.

**Configuration**:
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Ramp up to 10 users
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '60s', target: 100 },  // Ramp up to 100 users
    { duration: '30s', target: 100 },  // Stay at 100 users
    { duration: '10s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
    http_req_failed: ['rate<0.1'],     // Error rate < 10%
  },
};
```

**Test Flow**:
1. GET /users - Retrieve user list
2. GET /users/:id - Get specific user
3. POST /users - Create new user
4. PUT /users/:id - Update user
5. POST /login - Authentication
6. GET /unknown - Resource endpoints

### 2. Stress Testing

**Purpose**: Test system beyond normal capacity to find breaking point.

**Configuration**:
```javascript
export const options = {
  stages: [
    { duration: '5s', target: 10 },    // Warm up
    { duration: '10s', target: 50 },   // Ramp up
    { duration: '20s', target: 100 },  // Ramp up to 100 users
    { duration: '30s', target: 200 },  // Ramp up to 200 users
    { duration: '20s', target: 300 },  // Ramp up to 300 users
    { duration: '30s', target: 300 },  // Stay at 300 users
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests < 3s
    http_req_failed: ['rate<0.2'],     // Error rate < 20%
  },
};
```

**Features**:
- Random endpoint selection
- Custom metrics tracking
- Higher error rate tolerance
- Extended duration testing

### 3. Spike Testing

**Purpose**: Test system behavior under sudden traffic spikes.

**Configuration**:
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Normal load
    { duration: '5s', target: 200 },   // Spike to 200 users
    { duration: '10s', target: 10 },   // Back to normal
    { duration: '5s', target: 300 },   // Another spike to 300 users
    { duration: '10s', target: 10 },   // Back to normal
    { duration: '5s', target: 500 },   // Final spike to 500 users
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests < 5s
    http_req_failed: ['rate<0.3'],     // Error rate < 30%
  },
};
```

**Features**:
- Multiple endpoint testing per iteration
- Rapid load changes
- Recovery testing
- Higher threshold tolerances

## Custom Metrics

### Built-in Metrics
- `http_req_duration` - Request duration
- `http_req_failed` - Failed request rate
- `http_reqs` - Total requests
- `vus` - Virtual users

### Custom Metrics
```javascript
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');

// Usage in test
errorRate.add(response.status !== 200);
responseTime.add(response.timings.duration);
requestCount.add(1);
```

## Test Data Management

### Dynamic Data Generation
```javascript
// Generate random user data
const userData = {
  name: `Load Test User ${Math.random().toString(36).substr(2, 9)}`,
  job: `Load Test Job ${Math.random().toString(36).substr(2, 9)}`
};

// Random user ID selection
const userId = Math.floor(Math.random() * 12) + 1;
```

### Test Data Variations
- Random user IDs (1-12)
- Dynamic user names and jobs
- Varied request patterns
- Different authentication scenarios

## Thresholds and SLAs

### Response Time Thresholds
```javascript
thresholds: {
  http_req_duration: ['p(95)<2000'],  // 95th percentile < 2s
  http_req_duration: ['p(99)<5000'],  // 99th percentile < 5s
  http_req_duration: ['avg<1000'],    // Average < 1s
}
```

### Error Rate Thresholds
```javascript
thresholds: {
  http_req_failed: ['rate<0.1'],      // Error rate < 10%
  error_rate: ['rate<0.05'],          // Custom error rate < 5%
}
```

### Throughput Thresholds
```javascript
thresholds: {
  http_reqs: ['rate>100'],            // > 100 requests/second
  custom_metric: ['value>50'],        // Custom metric threshold
}
```

## Running Performance Tests

### Local Execution
```bash
# Run load test
k6 run tests/performance/api-load-test.js

# Run stress test
k6 run tests/performance/api-stress-test.js

# Run spike test
k6 run tests/performance/api-spike-test.js
```

### Docker Execution
```bash
# Using Docker
docker run --rm -v ${PWD}:/app loadimpact/k6:latest run /app/tests/performance/api-load-test.js

# Using docker-compose
docker-compose run performance-tests
```

### CI/CD Integration
```yaml
performance-tests:
  stage: performance-tests
  image: loadimpact/k6:latest
  script:
    - k6 run tests/performance/api-load-test.js
    - k6 run tests/performance/api-stress-test.js
    - k6 run tests/performance/api-spike-test.js
  artifacts:
    when: always
    paths:
      - test-results/performance/
```

## Environment Configuration

### Environment Variables
```bash
# Performance test configuration
PERFORMANCE_THRESHOLD_RESPONSE_TIME=2000
PERFORMANCE_THRESHOLD_THROUGHPUT=100
PERFORMANCE_DURATION=30s
PERFORMANCE_VUS=10

# Target URLs
BASE_URL=https://reqres.in/api
WEB_BASE_URL=http://localhost:3000
```

### k6 Configuration
```javascript
// k6.config.js
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '60s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
};
```

## Monitoring and Metrics

### Real-time Metrics
- Request rate (RPS)
- Response time percentiles
- Error rate
- Virtual users
- Data transfer

### Custom Metrics Tracking
```javascript
// Track custom business metrics
const businessMetric = new Counter('business_operations');
businessMetric.add(1);

// Track performance by endpoint
const endpointDuration = new Trend('endpoint_duration');
endpointDuration.add(response.timings.duration, { endpoint: 'users' });
```

### Performance Baselines
- Establish baseline metrics
- Set performance budgets
- Monitor trends over time
- Alert on threshold breaches

## Test Scenarios

### API Load Testing
```javascript
export default function(data) {
  // Test multiple API endpoints
  const endpoints = [
    () => testGetUsers(baseUrl),
    () => testGetUserById(baseUrl),
    () => testCreateUser(baseUrl),
    () => testLogin(baseUrl),
    () => testGetResources(baseUrl),
  ];
  
  // Randomly select 2-3 endpoints per iteration
  const numEndpoints = Math.floor(Math.random() * 2) + 2;
  const selectedEndpoints = endpoints.sort(() => 0.5 - Math.random()).slice(0, numEndpoints);
  
  selectedEndpoints.forEach(endpoint => {
    endpoint();
  });
}
```

### Web Application Testing
```javascript
export default function(data) {
  // Simulate user journey
  simulateUserJourney(baseUrl);
}

function simulateUserJourney(baseUrl) {
  // Step 1: Visit homepage
  const homeResponse = http.get(`${baseUrl}/`);
  check(homeResponse, {
    'Homepage loads successfully': (r) => r.status === 200,
    'Homepage response time < 3000ms': (r) => r.timings.duration < 3000,
  });
  
  // Step 2: Visit login page
  const loginPageResponse = http.get(`${baseUrl}/login`);
  // ... more steps
}
```

## Reporting and Analysis

### k6 Output Formats
```bash
# JSON output
k6 run --out json=results.json tests/performance/api-load-test.js

# InfluxDB output
k6 run --out influxdb=http://localhost:8086/k6 tests/performance/api-load-test.js

# Cloud output
k6 run --out cloud tests/performance/api-load-test.js
```

### Custom Reporting
```javascript
// Generate custom performance report
export function teardown(data) {
  console.log('Performance test completed');
  console.log('Final metrics:', JSON.stringify(data, null, 2));
}
```

### Integration with Allure
- Performance test results in Allure reports
- Custom performance metrics
- Historical trend analysis
- Threshold violation tracking

## Best Practices

### 1. Test Design
- Start with light load and gradually increase
- Test realistic user scenarios
- Include both happy path and error scenarios
- Test different user types and behaviors

### 2. Threshold Setting
- Set realistic performance expectations
- Consider business requirements
- Account for system capabilities
- Monitor trends over time

### 3. Data Management
- Use realistic test data
- Avoid data conflicts
- Clean up test data
- Use data variation

### 4. Environment Preparation
- Ensure test environment stability
- Monitor system resources
- Prepare for high load
- Have rollback plans

### 5. Monitoring
- Monitor system resources during tests
- Track application performance
- Monitor database performance
- Watch for memory leaks

## Troubleshooting

### Common Issues

**Tests failing due to timeouts**
- Increase timeout values
- Check system resources
- Verify network connectivity
- Review test data

**High error rates**
- Check application logs
- Verify test data validity
- Review system capacity
- Check for rate limiting

**Inconsistent results**
- Ensure test environment stability
- Check for external dependencies
- Review test data generation
- Monitor system resources

### Debug Commands
```bash
# Run with verbose output
k6 run --verbose tests/performance/api-load-test.js

# Run with specific VUs
k6 run --vus 10 --duration 30s tests/performance/api-load-test.js

# Run with custom thresholds
k6 run --threshold http_req_duration=p(95)<1000 tests/performance/api-load-test.js
```

### Performance Analysis
```bash
# Analyze results
k6 run --out json=results.json tests/performance/api-load-test.js
# Process results.json for analysis

# Compare with previous runs
k6 run --out json=results-$(date +%Y%m%d).json tests/performance/api-load-test.js
```

## Advanced Features

### Custom Functions
```javascript
// Reusable test functions
function testGetUsers(baseUrl) {
  const response = http.get(`${baseUrl}/users?page=1&per_page=6`);
  check(response, {
    'GET /users status is 200': (r) => r.status === 200,
    'GET /users response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  return response;
}
```

### Conditional Logic
```javascript
export default function(data) {
  // Test different scenarios based on conditions
  if (Math.random() < 0.5) {
    testGetUsers(baseUrl);
  } else {
    testCreateUser(baseUrl);
  }
}
```

### External Data Sources
```javascript
// Load test data from external sources
import { SharedArray } from 'k6/data';

const testData = new SharedArray('users', function () {
  return JSON.parse(open('./test-data/users.json'));
});

export default function(data) {
  const user = testData[Math.floor(Math.random() * testData.length)];
  // Use user data in test
}
```

This comprehensive performance testing framework ensures your application can handle expected and unexpected load conditions while maintaining acceptable performance levels.
