module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.[jt]s'],
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.transform.cjs',
  },
  modulePaths: ['<rootDir>/../frontend/node_modules'],
};
