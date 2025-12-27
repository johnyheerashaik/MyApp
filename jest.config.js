/**
 * @type {import('jest').Config}
 */

const config = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest/setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(' +
    '@react-native' +
    '|react-native' +
    '|@react-navigation' +
    '|@react-native-firebase' +
    ')/)',
  ],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/jest/__mocks__/fileMock.js',
  },
};

export default config;
