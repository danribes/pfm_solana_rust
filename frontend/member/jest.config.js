// Jest Configuration for Frontend Unit Tests
// Task 4.7.1: Frontend Unit Tests - Jest setup and configuration

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  
  // Test patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  
  // Module name mapping for imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/../shared/src/$1",
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
    "!src/pages/api/**",
    "!**/*.stories.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // CI optimizations
  maxWorkers: process.env.CI ? 2 : "50%",
  testTimeout: 30000,
  verbose: process.env.CI === "true",
  forceExit: process.env.CI === "true",
  detectOpenHandles: process.env.CI === "true",
  
  // Test environment setup
  testEnvironmentOptions: {
    url: "http://localhost:3002",
  },
  
  // Transform configuration
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  
  // Setup files
  setupFiles: ["<rootDir>/jest.polyfills.js"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
