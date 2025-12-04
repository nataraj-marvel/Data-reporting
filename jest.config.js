module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFiles: ['<rootDir>/tests/setup/dbMock.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};