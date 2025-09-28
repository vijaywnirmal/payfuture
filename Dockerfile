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
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
RUN npx playwright install --with-deps chromium
EXPOSE 3000
CMD ["npm", "run", "test"]

# Test stage
FROM base AS test
RUN npm ci
COPY . .
RUN npx playwright install --with-deps chromium
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV CI=true
ENV NODE_ENV=test
CMD ["npm", "run", "test"]

# Production stage
FROM base AS production
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN npx playwright install --with-deps chromium
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]

# Performance testing stage
FROM loadimpact/k6:latest AS performance
WORKDIR /app
COPY tests/performance/ ./tests/performance/
COPY k6.config.js ./
CMD ["k6", "run", "tests/performance/api-load-test.js"]

# All-in-one test runner
FROM node:18-alpine AS test-runner
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy source code
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Set environment variables
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV CI=true
ENV NODE_ENV=test

# Create directories for test results
RUN mkdir -p test-results allure-results test-reports

# Default command
CMD ["npm", "run", "test"]
