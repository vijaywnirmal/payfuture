# Full-Stack Test Automation Framework

A comprehensive, enterprise-grade test automation framework covering web UI testing, API testing, and performance testing with full CI/CD integration.

## 🚀 Features

### **Functional Testing (Frontend UI)**
- **Playwright** for cross-browser end-to-end testing
- **Page Object Model** for maintainable test structure
- Support for Chrome, Firefox, Safari, and mobile browsers
- Visual regression testing capabilities
- Screenshot and video recording on failures

### **API Testing (Backend Integration)**
- **Supertest** for REST API testing
- **reqres.in** integration for realistic API testing
- Comprehensive test coverage including:
  - CRUD operations (GET, POST, PUT, PATCH, DELETE)
  - Authentication flows
  - Error handling and edge cases
  - Data-driven testing
  - Schema validation

### **Performance Testing**
- **k6** for load, stress, and spike testing
- Configurable load profiles and thresholds
- Real-time metrics and reporting
- Support for 100+ concurrent users
- Custom performance metrics

### **CI/CD Integration**
- **GitLab CI** pipeline with multiple stages
- Parallel test execution
- Artifact collection and reporting
- Slack notifications
- Docker containerization

### **Additional Features**
- **Schema validation** with Joi
- **Mock server** for isolated testing
- **Comprehensive reporting** with Allure
- **Test data generation** with Faker
- **Docker support** for consistent environments

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)
- GitLab CI (for CI/CD)

## 🛠️ Installation

### Quick Setup (Recommended)

**Windows:**
```bash
git clone <repository-url>
cd fullstack-test-automation
scripts\install.bat
```

**Linux/macOS:**
```bash
git clone <repository-url>
cd fullstack-test-automation
chmod +x scripts/install.sh
./scripts/install.sh
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-test-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   npx playwright install-deps
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Generate test data (optional)**
   ```bash
   npm run generate-test-data
   ```

### Troubleshooting Dependencies

If you encounter dependency issues:

```bash
# Run the dependency fix script
node scripts/fix-dependencies.js

# Or manually fix
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npx playwright install
```

## 🏃‍♂️ Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Web tests only
npm run test:web

# API tests only
npm run test:api

# Performance tests only
npm run test:performance
```

### Run Tests with Different Browsers
```bash
# Run with specific browser
npx playwright test --project=chromium

# Run in headed mode
npm run test:web:headed

# Run with UI mode
npm run test:web:ui
```

## 📁 Project Structure

```
fullstack-test-automation/
├── src/                          # Source code
│   ├── api/                      # API client and utilities
│   │   ├── api-client.ts         # Generic API client
│   │   └── reqres-api.ts         # ReqRes API client
│   ├── config/                   # Configuration files
│   │   └── test.config.ts        # Test configuration
│   ├── pages/                    # Page Object Model
│   │   ├── base-page.ts          # Base page class
│   │   ├── login-page.ts         # Login page
│   │   ├── dashboard-page.ts     # Dashboard page
│   │   └── registration-page.ts  # Registration page
│   └── utils/                    # Utility functions
│       ├── logger.ts             # Logging utility
│       ├── test-data.ts          # Test data generation
│       ├── report-generator.ts   # Report generation
│       ├── slack-notifier.ts     # Slack notifications
│       ├── schema-validator.ts   # Schema validation
│       └── mock-server.ts        # Mock server
├── tests/                        # Test files
│   ├── web/                      # Web UI tests
│   │   ├── login.spec.ts         # Login tests
│   │   ├── registration.spec.ts  # Registration tests
│   │   └── navigation.spec.ts    # Navigation tests
│   ├── api/                      # API tests
│   │   ├── users.spec.ts         # User API tests
│   │   ├── auth.spec.ts          # Authentication tests
│   │   ├── resources.spec.ts     # Resource API tests
│   │   ├── schema-validation.spec.ts # Schema validation tests
│   │   └── mock-server.spec.ts   # Mock server tests
│   └── performance/              # Performance tests
│       ├── api-load-test.js      # API load testing
│       ├── api-stress-test.js    # API stress testing
│       └── api-spike-test.js     # API spike testing
├── scripts/                      # Utility scripts
│   ├── generate-test-data.js     # Test data generation
│   └── slack-notify.js           # Slack notifications
├── test-results/                 # Test results and artifacts
├── allure-results/               # Allure test results
├── test-reports/                 # Generated reports
├── docker-compose.yml            # Docker composition
├── Dockerfile                    # Docker configuration
├── .gitlab-ci.yml               # GitLab CI pipeline
├── playwright.config.ts         # Playwright configuration
├── jest.api.config.js           # Jest API configuration
└── k6.config.js                 # k6 configuration
```

## 🧪 Test Categories

### Web UI Tests
- **Login functionality** - Form validation, authentication flows
- **Registration** - User registration with validation
- **Navigation** - Cross-page navigation and user journeys
- **Responsive design** - Mobile and desktop viewport testing

### API Tests
- **User management** - CRUD operations for users
- **Authentication** - Login, registration, logout flows
- **Resource management** - Product and order management
- **Error handling** - Invalid requests, edge cases
- **Schema validation** - Request/response validation

### Performance Tests
- **Load testing** - Normal expected load
- **Stress testing** - Beyond normal capacity
- **Spike testing** - Sudden traffic spikes
- **Endurance testing** - Extended period testing

## 🔧 Configuration

### Environment Variables
```bash
# Application URLs
BASE_URL=http://localhost:3000
API_BASE_URL=https://reqres.in/api

# Test Configuration
TEST_ENV=development
HEADLESS=true
BROWSER=chromium

# Performance Testing
PERFORMANCE_THRESHOLD_RESPONSE_TIME=2000
PERFORMANCE_VUS=10

# Notifications
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/web',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## 🐳 Docker Support

### Run Tests in Docker
```bash
# Build the image
docker build -t test-automation .

# Run all tests
docker run --rm test-automation

# Run specific test suite
docker run --rm test-automation npm run test:web
```

### Docker Compose
```bash
# Start all services
docker-compose up

# Run specific test suite
docker-compose run web-tests
docker-compose run api-tests
docker-compose run performance-tests

# Run all tests
docker-compose run all-tests
```

## 📊 Reporting

### Allure Reports
```bash
# Generate report
npm run report:generate

# Serve report locally
npm run report
```

### Custom Reports
- HTML reports with detailed test results
- Performance metrics visualization
- Screenshot galleries for failed tests
- Test execution timelines

## 🔄 CI/CD Pipeline

### GitLab CI Stages
1. **Setup** - Install dependencies and browsers
2. **Lint** - Code quality checks
3. **Web Tests** - UI automation tests
4. **API Tests** - API integration tests
5. **Performance Tests** - Load and stress tests
6. **Report** - Generate and publish reports
7. **Deploy** - Notifications and artifacts

### Pipeline Features
- Parallel test execution
- Artifact collection
- Slack notifications
- Test result aggregation
- Performance metrics tracking

## 🚨 Notifications

### Slack Integration
Configure Slack webhook URL to receive:
- Test execution results
- Performance test outcomes
- Pipeline status updates
- Failure alerts

### Custom Notifications
- Email notifications
- Teams integration
- Custom webhook support

## 📈 Performance Testing

### Load Test Scenarios
- **Light Load**: 10 users for 30 seconds
- **Medium Load**: 50 users for 60 seconds
- **Heavy Load**: 100 users for 120 seconds

### Stress Test Scenarios
- **Gradual Ramp**: Up to 200 users
- **Spike Test**: Sudden traffic spikes
- **Endurance Test**: Extended period testing

### Performance Thresholds
- Response time: 95th percentile < 2000ms
- Error rate: < 10%
- Throughput: > 100 requests/second

## 🛠️ Development

### Adding New Tests
1. Create test file in appropriate directory
2. Follow Page Object Model for UI tests
3. Use existing API client for API tests
4. Add performance test scenarios as needed

### Adding New Pages
1. Extend `BasePage` class
2. Define locators and methods
3. Add validation methods
4. Update test files to use new page

### Adding New API Endpoints
1. Add methods to API client
2. Create test cases
3. Add schema validation
4. Update mock server if needed

## 🐛 Troubleshooting

### Common Issues

**Playwright browsers not installed**
```bash
npx playwright install --with-deps
```

**API tests failing**
- Check network connectivity
- Verify API endpoints are accessible
- Check authentication tokens

**Performance tests timing out**
- Increase timeout values
- Check system resources
- Verify test data

**Docker issues**
- Ensure Docker is running
- Check port conflicts
- Verify image build

### Debug Mode
```bash
# Run tests in debug mode
npm run test:web:debug

# Run with verbose logging
DEBUG=* npm test
```

## 📚 Best Practices

### Test Design
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent
- Use data-driven testing where appropriate

### Page Object Model
- One page class per page
- Encapsulate page elements
- Provide meaningful methods
- Handle dynamic content

### API Testing
- Test happy path and edge cases
- Validate response schemas
- Use proper HTTP status codes
- Test error scenarios

### Performance Testing
- Start with light load
- Gradually increase load
- Monitor system resources
- Set realistic thresholds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing test cases
- Contact the development team

## 🔗 Useful Links

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [k6 Documentation](https://k6.io/docs/)
- [Allure Documentation](https://docs.qameta.io/allure/)
- [Docker Documentation](https://docs.docker.com/)
- [GitLab CI Documentation](https://docs.gitlab.com/ee/ci/)

---

**Happy Testing! 🎉**
