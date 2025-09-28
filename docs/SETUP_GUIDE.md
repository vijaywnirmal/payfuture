# Setup Guide

This guide provides step-by-step instructions for setting up the Full-Stack Test Automation Framework in your environment.

## Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher (or yarn 1.22+)
- **Git**: 2.0 or higher
- **Docker**: 20.10+ (optional)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Disk Space**: At least 2GB free space

### Operating System Support
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 18.04+, CentOS 7+, RHEL 7+)

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd fullstack-test-automation

# Verify the clone
ls -la
```

### 2. Install Node.js Dependencies

```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Install Playwright Browsers

```bash
# Install Playwright browsers
npx playwright install

# Install system dependencies (Linux/macOS)
npx playwright install-deps

# Verify installation
npx playwright --version
```

### 4. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

#### Required Environment Variables
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
```

#### Optional Environment Variables
```bash
# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
GITHUB_TOKEN=your_github_token

# Database (if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_db
DB_USER=test_user
DB_PASSWORD=test_password
```

### 5. Generate Test Data (Optional)

```bash
# Generate test data
npm run generate-test-data

# Verify test data generation
ls -la test-data/
```

### 6. Verify Installation

```bash
# Run a quick verification
npm run test:web -- --grep "should display login form elements"

# Check API tests
npm run test:api -- --testNamePattern="should retrieve users list"

# Verify performance tests
k6 run tests/performance/api-load-test.js --duration 10s --vus 1
```

## Docker Setup (Optional)

### 1. Build Docker Image

```bash
# Build the test automation image
docker build -t test-automation .

# Verify the build
docker images | grep test-automation
```

### 2. Run Tests in Docker

```bash
# Run all tests
docker run --rm test-automation

# Run specific test suite
docker run --rm test-automation npm run test:web

# Run with volume mounting for results
docker run --rm -v $(pwd)/test-results:/app/test-results test-automation
```

### 3. Docker Compose

```bash
# Start all services
docker-compose up -d

# Run specific test suite
docker-compose run web-tests
docker-compose run api-tests
docker-compose run performance-tests

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## IDE Setup

### Visual Studio Code

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-playwright.playwright",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.test-adapter-converter",
    "hbenl.vscode-test-explorer"
  ]
}
```

#### Workspace Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true
}
```

### IntelliJ IDEA / WebStorm

#### Configuration
1. Install Node.js plugin
2. Configure TypeScript compiler
3. Set up Jest test runner
4. Configure Playwright integration

## Project Structure Verification

After installation, verify the project structure:

```
fullstack-test-automation/
├── src/                          # Source code
│   ├── api/                      # API client and utilities
│   ├── config/                   # Configuration files
│   ├── pages/                    # Page Object Model
│   └── utils/                    # Utility functions
├── tests/                        # Test files
│   ├── web/                      # Web UI tests
│   ├── api/                      # API tests
│   └── performance/              # Performance tests
├── scripts/                      # Utility scripts
├── test-results/                 # Test results (created after first run)
├── allure-results/               # Allure results (created after first run)
├── test-reports/                 # Generated reports (created after first run)
├── docker-compose.yml            # Docker composition
├── Dockerfile                    # Docker configuration
├── .gitlab-ci.yml               # GitLab CI pipeline
├── playwright.config.ts         # Playwright configuration
├── jest.api.config.js           # Jest API configuration
├── k6.config.js                 # k6 configuration
└── package.json                 # Node.js dependencies
```

## Running Tests

### Web Tests
```bash
# Run all web tests
npm run test:web

# Run specific test file
npx playwright test tests/web/login.spec.ts

# Run in headed mode
npm run test:web:headed

# Run with UI mode
npm run test:web:ui

# Run specific browser
npx playwright test --project=chromium
```

### API Tests
```bash
# Run all API tests
npm run test:api

# Run specific test file
npx jest tests/api/users.spec.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:api:watch
```

### Performance Tests
```bash
# Run load test
k6 run tests/performance/api-load-test.js

# Run stress test
k6 run tests/performance/api-stress-test.js

# Run spike test
k6 run tests/performance/api-spike-test.js

# Run with custom parameters
k6 run --vus 10 --duration 30s tests/performance/api-load-test.js
```

### All Tests
```bash
# Run all tests
npm test

# Run with specific environment
NODE_ENV=staging npm test
```

## Configuration Files

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

## Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

#### Playwright Installation Issues
```bash
# Clear Playwright cache
npx playwright install --force

# Install system dependencies
npx playwright install-deps

# Check browser installation
npx playwright install --dry-run
```

#### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use nvm to avoid permission issues
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Start Docker service (Linux)
sudo systemctl start docker

# Check Docker daemon
docker info
```

#### Network Issues
```bash
# Check network connectivity
ping reqres.in

# Test API endpoint
curl -I https://reqres.in/api/users

# Check proxy settings
npm config get proxy
npm config get https-proxy
```

### Debug Commands

#### Playwright Debug
```bash
# Run with debug output
DEBUG=pw:api npx playwright test

# Run in debug mode
npx playwright test --debug

# Show browser
npx playwright test --headed
```

#### Jest Debug
```bash
# Run with verbose output
npx jest --verbose

# Run specific test
npx jest --testNamePattern="should create user"

# Run with coverage
npx jest --coverage
```

#### k6 Debug
```bash
# Run with verbose output
k6 run --verbose tests/performance/api-load-test.js

# Run with specific VUs
k6 run --vus 1 --duration 10s tests/performance/api-load-test.js
```

## Verification Checklist

After setup, verify the following:

- [ ] Node.js 18+ installed
- [ ] npm dependencies installed
- [ ] Playwright browsers installed
- [ ] Environment variables configured
- [ ] Web tests run successfully
- [ ] API tests run successfully
- [ ] Performance tests run successfully
- [ ] Docker setup working (if using)
- [ ] IDE configured properly
- [ ] Test reports generated

## Next Steps

1. **Read the Documentation**
   - [API Testing Guide](API_TESTING.md)
   - [Performance Testing Guide](PERFORMANCE_TESTING.md)
   - [CI/CD Integration Guide](CI_CD_GUIDE.md)

2. **Explore Examples**
   - Review test files in `tests/` directory
   - Check Page Object Model implementation
   - Examine API client usage

3. **Customize Configuration**
   - Modify test configurations
   - Add custom test data
   - Configure notifications

4. **Set Up CI/CD**
   - Configure GitLab CI variables
   - Set up Slack notifications
   - Configure Docker registry

5. **Start Testing**
   - Write your first test
   - Run test suites
   - Generate reports

## Support

If you encounter issues during setup:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Verify all prerequisites are met
4. Check the documentation
5. Create an issue in the repository

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [k6 Documentation](https://k6.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitLab CI Documentation](https://docs.gitlab.com/ee/ci/)

---

**Setup Complete! 🎉**

You're now ready to start using the Full-Stack Test Automation Framework. Happy testing!
