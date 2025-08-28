// backend/jest.setup.js

// This file is executed once before all test suites.
// We can use this for any global setup that is required.

// The globalSetup file must export a function.
export default async () => {
  console.log('Jest global setup running...');
};