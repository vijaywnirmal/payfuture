# CI/CD Integration Guide

This document provides comprehensive guidance for integrating the Full-Stack Test Automation Framework with CI/CD pipelines, specifically GitLab CI.

## Overview

The framework includes a complete CI/CD pipeline that:
- Runs tests automatically on code changes
- Generates comprehensive reports
- Provides notifications and alerts
- Supports multiple environments
- Integrates with Docker and containerization

## GitLab CI Pipeline

### Pipeline Stages

```yaml
stages:
  - setup
  - lint
  - web-tests
  - api-tests
  - performance-tests
  - report
  - deploy
```

### 1. Setup Stage
```yaml
setup:
  stage: setup
  image: node:${NODE_VERSION}
  before_script:
    - npm ci --cache .npm --prefer-offline
    - npx playwright install --with-deps
  script:
    - echo "Dependencies installed successfully"
    - echo "Playwright browsers installed"
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour
```

**Purpose**: Install dependencies and prepare test environment.

### 2. Lint Stage
```yaml
lint:
  stage: lint
  image: node:${NODE_VERSION}
  dependencies:
    - setup
  script:
    - npm run lint
    - npm run format -- --check
  allow_failure: true
  artifacts:
    reports:
      junit: test-results/lint-results.xml
```

**Purpose**: Code quality checks and formatting validation.

### 3. Web Tests Stage
```yaml
web-tests:
  stage: web-tests
  image: node:${NODE_VERSION}
  dependencies:
    - setup
  before_script:
    - npm ci --cache .npm --prefer-offline
    - npx playwright install --with-deps
  script:
    - npm run test:web
  artifacts:
    when: always
    paths:
      - test-results/
      - allure-results/
      - playwright-report/
    reports:
      junit: test-results/results.xml
  parallel:
    matrix:
      - BROWSER: [chromium, firefox, webkit]
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
```

**Purpose**: Execute web UI tests across multiple browsers in parallel.

### 4. API Tests Stage
```yaml
api-tests:
  stage: api-tests
  image: node:${NODE_VERSION}
  dependencies:
    - setup
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm run test:api
    - npm run test:coverage
  artifacts:
    when: always
    paths:
      - coverage/
      - allure-results/
    reports:
      junit: test-results/api-results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
```

**Purpose**: Execute API tests with coverage reporting.

### 5. Performance Tests Stage
```yaml
performance-tests:
  stage: performance-tests
  image: loadimpact/k6:latest
  dependencies:
    - setup
  before_script:
    - echo "Setting up k6 performance tests"
  script:
    - k6 run tests/performance/api-load-test.js
    - k6 run tests/performance/api-stress-test.js
    - k6 run tests/performance/api-spike-test.js
  artifacts:
    when: always
    paths:
      - test-results/performance/
  retry:
    max: 1
    when:
      - runner_system_failure
  allow_failure: true
```

**Purpose**: Execute performance tests with k6.

### 6. Report Generation Stage
```yaml
generate-reports:
  stage: report
  image: node:${NODE_VERSION}
  dependencies:
    - web-tests
    - api-tests
    - performance-tests
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm run report:generate
    - echo "Reports generated successfully"
  artifacts:
    when: always
    paths:
      - allure-report/
      - test-reports/
    expire_in: 1 month
  only:
    - main
    - develop
    - merge_requests
```

**Purpose**: Generate comprehensive test reports and documentation.

### 7. Deploy Stage
```yaml
notify-success:
  stage: deploy
  image: node:${NODE_VERSION}
  dependencies:
    - generate-reports
  script:
    - |
      if [ -n "$SLACK_WEBHOOK_URL" ]; then
        node scripts/slack-notify.js success
      else
        echo "Slack webhook URL not configured, skipping notification"
      fi
  when: on_success
  only:
    - main
    - develop
```

**Purpose**: Send notifications and deploy artifacts.

## Environment Configuration

### GitLab CI Variables

Set these variables in GitLab CI/CD settings:

```bash
# Required Variables
NODE_VERSION=18
PLAYWRIGHT_BROWSERS=0

# Optional Variables
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
GITHUB_TOKEN=your_github_token
DOCKER_REGISTRY=your-registry.com
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password
```

### Environment-Specific Configuration

```yaml
# Development Environment
.development: &development
  variables:
    NODE_ENV: development
    BASE_URL: http://localhost:3000
    API_BASE_URL: https://reqres.in/api

# Staging Environment
.staging: &staging
  variables:
    NODE_ENV: staging
    BASE_URL: https://staging.example.com
    API_BASE_URL: https://staging-api.example.com

# Production Environment
.production: &production
  variables:
    NODE_ENV: production
    BASE_URL: https://example.com
    API_BASE_URL: https://api.example.com
```

## Docker Integration

### Dockerfile
```dockerfile
# Multi-stage Dockerfile for Full-Stack Test Automation
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Test stage
FROM base AS test
RUN npm ci
COPY . .
RUN npx playwright install --with-deps chromium
ENV CI=true
ENV NODE_ENV=test
CMD ["npm", "run", "test"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  web-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development

  web-tests:
    build:
      context: .
      dockerfile: Dockerfile
      target: test
    depends_on:
      - web-app
    environment:
      - BASE_URL=http://web-app:3000
      - CI=true

  api-tests:
    build:
      context: .
      dockerfile: Dockerfile
      target: test
    environment:
      - API_BASE_URL=https://reqres.in/api
      - CI=true

  performance-tests:
    build:
      context: .
      dockerfile: Dockerfile
      target: performance
    environment:
      - BASE_URL=https://reqres.in/api
```

## Notification Integration

### Slack Notifications

#### Setup
1. Create a Slack webhook URL
2. Add `SLACK_WEBHOOK_URL` to GitLab CI variables
3. Configure notification triggers

#### Notification Types
- **Test Results**: Success/failure with metrics
- **Performance Results**: Load test outcomes
- **Pipeline Status**: Build success/failure
- **Failure Alerts**: Critical test failures

#### Slack Script
```javascript
// scripts/slack-notify.js
const axios = require('axios');

const status = process.argv[2] || 'unknown';
const webhookUrl = process.env.SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.log('Slack webhook URL not configured');
  process.exit(0);
}

const message = {
  text: `Pipeline ${status.toUpperCase()}`,
  attachments: [
    {
      color: status === 'success' ? 'good' : 'danger',
      title: `Pipeline: ${process.env.CI_PROJECT_NAME}`,
      fields: [
        { title: 'Branch', value: process.env.CI_COMMIT_REF_NAME, short: true },
        { title: 'Commit', value: process.env.CI_COMMIT_SHA, short: true },
        { title: 'Pipeline', value: process.env.CI_PIPELINE_URL, short: true },
      ],
    },
  ],
};

axios.post(webhookUrl, message);
```

### Email Notifications

```yaml
email-notification:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - |
      if [ -n "$EMAIL_SMTP_HOST" ]; then
        node scripts/email-notify.js
      fi
  when: always
  only:
    - main
    - develop
```

## Artifact Management

### Test Results
```yaml
artifacts:
  when: always
  paths:
    - test-results/
    - allure-results/
    - coverage/
    - test-reports/
  reports:
    junit: test-results/results.xml
    coverage_report:
      coverage_format: cobertura
      path: coverage/cobertura-coverage.xml
  expire_in: 1 month
```

### Report Generation
```yaml
generate-reports:
  stage: report
  script:
    - npm run report:generate
  artifacts:
    paths:
      - allure-report/
      - test-reports/
    expire_in: 1 month
```

## Parallel Execution

### Matrix Strategy
```yaml
web-tests:
  parallel:
    matrix:
      - BROWSER: [chromium, firefox, webkit]
      - VIEWPORT: [desktop, mobile]
```

### Resource Optimization
```yaml
web-tests:
  script:
    - npm run test:web
  parallel:
    matrix:
      - BROWSER: [chromium, firefox, webkit]
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
```

## Security Integration

### Security Scanning
```yaml
security-scan:
  stage: lint
  image: node:${NODE_VERSION}
  script:
    - npm audit --audit-level moderate
    - npx snyk test --severity-threshold=high
  allow_failure: true
  artifacts:
    reports:
      sast: gl-sast-report.json
```

### Secret Management
```yaml
variables:
  SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL
  GITHUB_TOKEN: $GITHUB_TOKEN
  DOCKER_PASSWORD: $DOCKER_PASSWORD
```

## Environment-Specific Pipelines

### Development Pipeline
```yaml
.development-pipeline:
  extends: .base-pipeline
  variables:
    NODE_ENV: development
    BASE_URL: http://localhost:3000
  only:
    - develop
    - feature/*
```

### Production Pipeline
```yaml
.production-pipeline:
  extends: .base-pipeline
  variables:
    NODE_ENV: production
    BASE_URL: https://example.com
  only:
    - main
  when: manual
```

## Monitoring and Alerting

### Pipeline Monitoring
- Monitor pipeline success rates
- Track test execution times
- Monitor resource usage
- Alert on failures

### Test Metrics
- Test pass/fail rates
- Test execution duration
- Coverage metrics
- Performance benchmarks

### Custom Metrics
```yaml
performance-metrics:
  stage: report
  script:
    - |
      echo "Test execution time: $CI_JOB_DURATION seconds"
      echo "Test success rate: $(calculate_success_rate)"
      echo "Coverage: $(calculate_coverage)"
```

## Troubleshooting

### Common Issues

**Pipeline failures**
- Check GitLab CI logs
- Verify environment variables
- Check resource availability
- Review test configuration

**Test timeouts**
- Increase timeout values
- Check system resources
- Optimize test execution
- Review parallel execution

**Artifact issues**
- Check artifact paths
- Verify file permissions
- Review artifact expiration
- Check storage limits

### Debug Commands
```bash
# Check pipeline status
gitlab-ci-multi-runner status

# View pipeline logs
gitlab-ci-multi-runner logs

# Test locally
docker-compose run web-tests
```

## Best Practices

### 1. Pipeline Design
- Use stages for logical grouping
- Implement proper dependencies
- Use parallel execution where possible
- Set appropriate timeouts

### 2. Resource Management
- Use appropriate Docker images
- Implement caching strategies
- Monitor resource usage
- Optimize test execution

### 3. Error Handling
- Implement retry mechanisms
- Use allow_failure appropriately
- Provide meaningful error messages
- Log detailed information

### 4. Security
- Use secret management
- Implement security scanning
- Follow least privilege principle
- Regular security updates

### 5. Monitoring
- Track pipeline metrics
- Monitor test trends
- Alert on failures
- Regular performance reviews

## Advanced Features

### Custom Runners
```yaml
# Use custom GitLab runners
web-tests:
  tags:
    - docker
    - linux
  script:
    - npm run test:web
```

### Conditional Execution
```yaml
# Run tests based on file changes
web-tests:
  script:
    - npm run test:web
  only:
    changes:
      - src/**/*
      - tests/web/**/*
```

### Dynamic Configuration
```yaml
# Dynamic test configuration
web-tests:
  script:
    - |
      if [ "$CI_COMMIT_BRANCH" = "main" ]; then
        npm run test:web -- --browser=all
      else
        npm run test:web -- --browser=chromium
      fi
```

This comprehensive CI/CD integration ensures reliable, automated testing with full pipeline visibility and reporting capabilities.
