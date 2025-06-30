module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!tests/**',
    '!**/*.config.js'
  ],
  coverageReporters: [
    'text',
    'html',
    'json',
    'lcov'
  ],
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};
