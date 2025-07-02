/** @type {import('jest').Config} */
const config = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/testing/setup/jest.setup.js'
  ],
  
  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapping: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/frontend/shared/$1',
    '^@admin/(.*)$': '<rootDir>/frontend/admin/$1',
    '^@member/(.*)$': '<rootDir>/frontend/member/$1',
    '^@public/(.*)$': '<rootDir>/frontend/public/$1',
    '^@backend/(.*)$': '<rootDir>/backend/$1',
    '^@testing/(.*)$': '<rootDir>/testing/$1',
    
    // Handle CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/testing/__mocks__/fileMock.js'
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'frontend/**/*.{js,jsx,ts,tsx}',
    'backend/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.config.{js,ts}',
    '!**/index.{js,ts}',
    '!**/*stories.{js,jsx,ts,tsx}',
    '!**/*mock*.{js,jsx,ts,tsx}'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Component-specific thresholds
    'frontend/shared/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'frontend/member/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'frontend/admin/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'clover'
  ],
  
  // Test projects for different environments
  projects: [
    {
      displayName: 'Frontend Components',
      testMatch: ['<rootDir>/frontend/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/testing/setup/frontend.setup.js']
    },
    {
      displayName: 'Backend API',
      testMatch: ['<rootDir>/backend/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/testing/setup/backend.setup.js']
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/testing/integration/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/testing/setup/integration.setup.js']
    },
    {
      displayName: 'E2E Tests',
      testMatch: ['<rootDir>/testing/e2e/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/testing/setup/e2e.setup.js']
    }
  ],
  
  // Global configuration
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // Clear mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'testing/reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }],
    ['jest-html-reporter', {
      pageTitle: 'PFM Test Report',
      outputPath: 'testing/reports/index.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ],
  
  // Custom configuration for different test types
  testEnvironmentOptions: {
    url: 'http://localhost:3002'
  }
};

module.exports = config;