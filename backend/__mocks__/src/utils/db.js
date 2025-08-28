// backend/__mocks__/src/utils/db.js

// This is a mock database module for testing.
// It avoids making a real connection to a database.

const mockPool = {
  getConnection: async () => {
    return {
      release: () => {},
      query: async () => {},
    };
  },
  end: async () => {
    // This is the function we call in jest.teardown.js
    console.log('Mock database connection pool closed.');
  },
};

export default mockPool;
