module.exports = {
  displayName: 'domain',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/domain',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@api/domain$': '<rootDir>/src/index.ts',
    '^@api/domain/(.*)$': '<rootDir>/src/$1',
  },
};
