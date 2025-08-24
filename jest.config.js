module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Coverage thresholds
  collectCoverageFrom: [
    'src/utils/financialCalculations.ts',
    'src/utils/security.ts', 
    'src/utils/validations.ts',
    'src/hooks/**/*.ts',
    'src/App.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    },
    // Critical files need higher coverage
    'src/utils/financialCalculations.ts': {
      functions: 95,
      lines: 90
    },
    'src/utils/security.ts': {
      functions: 100,
      lines: 95
    }
  },

  // Test timeout for performance tests
  testTimeout: 10000,

  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)'
  ]
};
