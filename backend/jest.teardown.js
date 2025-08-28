// backend/jest.teardown.js

// This file is executed once after all test suites have completed.
// We use it to clean up resources, like closing the database connection.
import pool from './src/utils/db.js';

export default async () => {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection pool closed.');
  }
};
