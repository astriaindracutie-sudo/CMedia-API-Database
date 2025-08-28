// backend/src/__tests__/authController.test.js

// Import the module you want to test.
// The moduleNameMapper in jest.config.js will automatically use the mock.
import authController from "../controllers/authController.js";

describe("Auth Controller", () => {
  test("should have a login function defined", () => {
    // This test will now use the mock version of the 'db.js' module.
    // The original db.js file will not be imported or executed.
    expect(authController.login).toBeDefined();
  });

  test("should have a register function defined", () => {
    expect(authController.register).toBeDefined();
  });
});
