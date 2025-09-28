module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/api'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    'tests/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/api/setup.ts'],
  testTimeout: 30000,
  reporters: [
    'default',
    ['jest-allure-reporter', { outputDir: 'allure-results' }]
  ],
  globalSetup: '<rootDir>/tests/api/global-setup.ts',
  globalTeardown: '<rootDir>/tests/api/global-teardown.ts',
  verbose: true,
  maxWorkers: '50%',
};
