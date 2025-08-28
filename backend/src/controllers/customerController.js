// backend/src/controllers/customerController.js
// Renamed from customer.js for consistency
import bcrypt from "bcrypt";
import AppError from "../utils/appError.js";
import { executeQuery, insertAndGetId } from "../services/databaseService.js";

/**
 * Creates a new customer record in the database.
 * @param {string} fullName - Full name of the customer.
 * @param {string} email - Email of the customer (must be unique).\n * @param {string} password - Raw password of the customer.
 * @returns {Promise<number>} The ID of the newly created customer.
 */
export async function createCustomer(fullName, email, password) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const customerId = await insertAndGetId(
      "INSERT INTO customers (full_name, email, password_hash) VALUES (?, ?, ?)",
      [fullName, email, passwordHash],
    );
    console.log(`Customer created with ID: ${customerId}`);
    return customerId;
  } catch (error) {
    // databaseService.js already handles ER_DUP_ENTRY and throws AppError with 409
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error creating customer:", error);
    throw new AppError("Could not create customer due to a server error.", 500);
  }
}

/**
 * Retrieves a customer record by their ID.
 * @param {number} customerId - The ID of the customer to retrieve.\n * @returns {Promise<object|null>} The customer object if found, otherwise null.
 */
export async function getCustomerById(customerId) {
  try {
    const rows = await executeQuery(
      "SELECT customer_id, full_name, email, created_at FROM customers WHERE customer_id = ?",
      [customerId],
    );
    if (rows.length === 0) {
      throw new AppError("Customer not found.", 404);
    }
    return rows[0];
  } catch (error) {
    // databaseService.js or previous AppError instances will be re-thrown
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error retrieving customer by ID:", error);
    throw new AppError(
      "Could not retrieve customer due to a server error.",
      500,
    );
  }
}
