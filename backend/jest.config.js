// backend/jest.config.js

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

// Export the Jest configuration
export default {
  testEnvironment: 'node',
  // A global setup file to run once before all test suites.
  globalSetup: path.resolve(__dirname, './jest.setup.js'),
  // Explicitly map the 'db.js' module to its mock version.
  moduleNameMapper: {
    '^\\./utils/db\\.js$': '<rootDir>/__mocks__/src/utils/db.js',
  },
  // Ensure we are transforming both the source files and the mock files
  // by ignoring all node_modules EXCEPT mariadb.
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!mariadb)'],
  // This tells Jest where to find your test files.
  testMatch: ['**/src/__tests__/**/*.test.js'],
};