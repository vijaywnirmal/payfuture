# API Testing Guide

This document provides comprehensive guidance for API testing using the Full-Stack Test Automation Framework.

## Overview

The API testing framework uses **Supertest** for HTTP assertions and **Jest** as the test runner. It includes comprehensive testing of REST APIs with focus on reqres.in as the primary test target.

## Test Structure

### Test Files
- `tests/api/users.spec.ts` - User management API tests
- `tests/api/auth.spec.ts` - Authentication API tests
- `tests/api/resources.spec.ts` - Resource API tests
- `tests/api/schema-validation.spec.ts` - Schema validation tests
- `tests/api/mock-server.spec.ts` - Mock server tests

### API Client
The `ReqResApiClient` class provides a clean interface for API interactions:

```typescript
import { ReqResApiClient } from '@api/reqres-api';

const apiClient = new ReqResApiClient();

// Get users
const response = await apiClient.getUsers(1, 6);

// Create user
const userData = { name: 'John Doe', job: 'Developer' };
const createResponse = await apiClient.createUser(userData);
```

## Test Categories

### 1. User Management Tests

#### GET /users
- Retrieve paginated user list
- Validate response structure
- Test pagination parameters
- Handle edge cases (invalid page numbers)

```typescript
it('should retrieve users list successfully', async () => {
  const response = await apiClient.getUsers(1, 6);
  
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('page');
  expect(response.data).toHaveProperty('per_page');
  expect(response.data).toHaveProperty('data');
  expect(Array.isArray(response.data.data)).toBe(true);
});
```

#### GET /users/:id
- Retrieve single user by ID
- Validate user data structure
- Handle non-existent users (404)

#### POST /users
- Create new user
- Validate request/response data
- Test with various data combinations

#### PUT /users/:id
- Update existing user
- Partial updates
- Handle non-existent users

#### PATCH /users/:id
- Partial user updates
- Validate PATCH behavior

#### DELETE /users/:id
- Delete user
- Verify deletion (204 status)

### 2. Authentication Tests

#### POST /login
- Valid credentials
- Invalid credentials
- Missing fields
- Malformed data

```typescript
it('should login successfully with valid credentials', async () => {
  const response = await apiClient.login('eve.holt@reqres.in', 'cityslicka');
  
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('token');
  expect(typeof response.data.token).toBe('string');
});
```

#### POST /register
- Valid registration data
- Invalid email formats
- Password validation
- Duplicate email handling

### 3. Resource Tests

#### GET /unknown
- Retrieve resource list
- Validate resource data structure
- Test resource properties

#### GET /unknown/:id
- Retrieve single resource
- Handle non-existent resources

### 4. Data-Driven Testing

The framework supports data-driven testing with multiple test scenarios:

```typescript
const testCases = [
  { name: 'John Doe', job: 'Developer' },
  { name: 'Jane Smith', job: 'Designer' },
  { name: 'Bob Johnson', job: 'Manager' }
];

testCases.forEach((testCase, index) => {
  it(`should create user with test case ${index + 1}`, async () => {
    const response = await apiClient.createUser(testCase);
    
    expect(response.status).toBe(201);
    expect(response.data.name).toBe(testCase.name);
    expect(response.data.job).toBe(testCase.job);
  });
});
```

## Schema Validation

### Built-in Schemas
The framework includes comprehensive schema validation using Joi:

```typescript
import { SchemaValidator } from '@utils/schema-validator';

// Validate user data
const result = SchemaValidator.validateUser(userData);
if (!result.isValid) {
  console.log('Validation errors:', result.errors);
}

// Validate API response
const responseResult = SchemaValidator.validateApiResponse(response.data);
```

### Custom Validation
Add custom validation rules:

```typescript
// Validate password strength
const passwordResult = SchemaValidator.validatePassword('password123');
if (!passwordResult.isValid) {
  console.log('Password errors:', passwordResult.errors);
}

// Validate email format
const isValidEmail = SchemaValidator.validateEmail('test@example.com');
```

## Error Handling

### Network Errors
```typescript
try {
  const response = await apiClient.getUsers();
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.log('Status:', error.response.status);
    console.log('Data:', error.response.data);
  } else if (error.request) {
    // Network error
    console.log('Network error:', error.message);
  }
}
```

### Retry Mechanism
```typescript
// Automatic retry with exponential backoff
const user = await apiClient.getUserWithRetry(userId, 3);
```

## Mock Server

### Starting Mock Server
```typescript
import { MockServer } from '@utils/mock-server';

const mockServer = new MockServer({
  port: 3001,
  enableLogging: true
});

await mockServer.start();
```

### Mock Endpoints
The mock server provides endpoints for:
- Authentication (`/api/auth/*`)
- User management (`/api/users/*`)
- Product management (`/api/products/*`)
- Order management (`/api/orders/*`)

### Testing with Mock Server
```typescript
// Use mock server for isolated testing
const response = await axios.get('http://localhost:3001/api/users');
expect(response.status).toBe(200);
```

## Test Configuration

### Jest Configuration
```javascript
// jest.api.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/api'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/api/setup.ts'],
  testTimeout: 30000,
  reporters: [
    'default',
    ['jest-allure-reporter', { outputDir: 'allure-results' }]
  ],
};
```

### Environment Variables
```bash
# API Configuration
API_BASE_URL=https://reqres.in/api
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3

# Test Configuration
NODE_ENV=test
CI=true
```

## Running API Tests

### Run All API Tests
```bash
npm run test:api
```

### Run Specific Test File
```bash
npx jest tests/api/users.spec.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:api:watch
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Data Management
- Use test data generators
- Clean up test data after tests
- Use unique identifiers for test data

### 3. Assertions
- Test both success and failure scenarios
- Validate response structure and data
- Check HTTP status codes
- Verify error messages

### 4. Error Testing
- Test invalid input data
- Test missing required fields
- Test malformed requests
- Test server errors

### 5. Performance
- Use appropriate timeouts
- Implement retry mechanisms
- Monitor response times
- Test under load

## Debugging

### Enable Debug Logging
```typescript
// Set log level to debug
logger.setLevel(LogLevel.DEBUG);
```

### Verbose Test Output
```bash
npx jest --verbose tests/api/users.spec.ts
```

### Debug Specific Test
```bash
npx jest --testNamePattern="should create user" --verbose
```

## Integration with CI/CD

### GitLab CI
The API tests are automatically run in the GitLab CI pipeline:

```yaml
api-tests:
  stage: api-tests
  script:
    - npm run test:api
    - npm run test:coverage
  artifacts:
    when: always
    paths:
      - coverage/
      - allure-results/
```

### Test Reports
- JUnit XML reports for CI integration
- Allure reports for detailed analysis
- Coverage reports for code quality

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in Jest configuration
- Check network connectivity
- Verify API endpoint availability

**Authentication failures**
- Verify credentials
- Check token expiration
- Ensure proper headers

**Schema validation errors**
- Review data structure
- Check required fields
- Validate data types

**Mock server issues**
- Verify port availability
- Check server logs
- Ensure proper startup sequence

### Debug Commands
```bash
# Run with debug output
DEBUG=* npm run test:api

# Run specific test with verbose output
npx jest tests/api/users.spec.ts --verbose --no-cache

# Check test coverage
npm run test:coverage
```

## Advanced Features

### Custom API Client
Extend the base API client for specific needs:

```typescript
class CustomApiClient extends ApiClient {
  async customEndpoint(data: any) {
    return this.post('/custom', data);
  }
}
```

### Test Hooks
Use Jest hooks for setup and teardown:

```typescript
beforeAll(async () => {
  // Setup before all tests
});

afterEach(async () => {
  // Cleanup after each test
});
```

### Parallel Testing
Configure Jest for parallel execution:

```javascript
module.exports = {
  maxWorkers: '50%',
  // ... other config
};
```

This comprehensive API testing framework ensures robust, maintainable, and reliable API testing with full CI/CD integration.
