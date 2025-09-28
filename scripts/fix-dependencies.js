#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dependency issues...');

try {
  // Remove node_modules and package-lock.json
  console.log('🧹 Cleaning existing dependencies...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // Clear npm cache
  console.log('🗑️  Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Install dependencies with specific versions
  console.log('📦 Installing dependencies with compatible versions...');
  
  // Install core dependencies first
  const coreDeps = [
    'axios@^1.6.2',
    'dotenv@^16.3.1',
    '@faker-js/faker@^8.4.1',
    'joi@^17.11.0',
    'moment@^2.29.4',
    'supertest@^6.3.3',
    'express@^4.18.2'
  ];

  execSync(`npm install ${coreDeps.join(' ')}`, { stdio: 'inherit' });

  // Install dev dependencies
  const devDeps = [
    '@playwright/test@^1.40.0',
    '@types/jest@^29.5.8',
    '@types/node@^20.9.0',
    '@types/supertest@^2.0.16',
    '@types/express@^4.17.21',
    '@typescript-eslint/eslint-plugin@^6.12.0',
    '@typescript-eslint/parser@^6.12.0',
    'allure-commandline@^2.24.0',
    'allure-playwright@^2.10.0',
    'eslint@^8.54.0',
    'eslint-config-prettier@^9.0.0',
    'eslint-plugin-prettier@^5.0.1',
    'jest@^29.7.0',
    'jest-allure-reporter@^0.1.0',
    'prettier@^3.1.0',
    'ts-jest@^29.1.1',
    'typescript@^5.2.2'
  ];

  execSync(`npm install --save-dev ${devDeps.join(' ')}`, { stdio: 'inherit' });

  console.log('✅ Dependencies installed successfully');

  // Install Playwright browsers
  console.log('🎭 Installing Playwright browsers...');
  execSync('npx playwright install', { stdio: 'inherit' });

  // Install system dependencies (Linux/macOS)
  if (process.platform !== 'win32') {
    console.log('🔧 Installing system dependencies...');
    execSync('npx playwright install-deps', { stdio: 'inherit' });
  }

  console.log('✅ Playwright browsers installed successfully');

  // Create necessary directories
  console.log('📁 Creating necessary directories...');
  const dirs = ['test-results', 'allure-results', 'test-reports', 'test-data'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('✅ Directories created successfully');

  // Copy environment file if it doesn't exist
  if (!fs.existsSync('.env')) {
    console.log('📝 Creating environment file...');
    if (fs.existsSync('env.example')) {
      fs.copyFileSync('env.example', '.env');
      console.log('✅ Environment file created');
    }
  }

  console.log('');
  console.log('🎉 Dependency fix completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('  1. Run tests: npm test');
  console.log('  2. Generate test data: npm run generate-test-data');
  console.log('  3. View reports: npm run report');
  console.log('');

} catch (error) {
  console.error('❌ Error fixing dependencies:', error.message);
  console.log('');
  console.log('🔧 Manual fix steps:');
  console.log('  1. Delete node_modules and package-lock.json');
  console.log('  2. Run: npm cache clean --force');
  console.log('  3. Run: npm install');
  console.log('  4. Run: npx playwright install');
  process.exit(1);
}
