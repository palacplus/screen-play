module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts',
    '!**/vendor/**'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  transform: {
    ".(ts|tsx)": "ts-jest"
  },

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage",
    "package.json",
    "package-lock.json",
    "reportWebVitals.ts",
    "setupTests.ts",
    "index.tsx",
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/cypress/',
    '/e2e/',
    '/integration-tests/',
    '/path/to/ignore/',
    '__snapshots__', // Automatically generated snapshot directories
    '\\.storybook',  // Storybook configuration directory
    "/tests/",
    "/tests-examples/"
  ],
}