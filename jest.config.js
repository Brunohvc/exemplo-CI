module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  coveragePathIgnorePatterns: ['.*\\.spec\\.ts$'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
}
