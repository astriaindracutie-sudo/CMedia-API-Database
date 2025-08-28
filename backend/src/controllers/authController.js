// backend/src/controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import AppError from "../utils/appError.js";
import {
  executeQuery,
  insertAndGetId,
  updateAndGetAffectedRows,
  deleteAndGetAffectedRows,
} from "../services/databaseService.js";

/**
 * Handles customer registration.
 * Hashes the password and inserts a new customer into the customers table.
 */
export const register = async (req, res) => {
  const { full_name, email, password, company_name, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const customerId = await insertAndGetId(
      "INSERT INTO customers (full_name, email, password_hash, company_name, phone) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, company_name || null, phone || null],
    );
    res.status(201).json({
      message: "Customer registered successfully!",
      customerId: customerId,
    });
  } catch (err) {
    console.error("Customer registration error:", err);
    // databaseService.js already handles ER_DUP_ENTRY and throws AppError with 409
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("An error occurred during customer registration.", 500);
  }
};

/**
 * Handles staff registration.
 * Hashes the password and inserts a new user into the staff table.
 */
export const registerStaff = async (req, res) => {
  const { full_name, email, password, role_id } = req.body; // Include role_id for staff registration

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await insertAndGetId(
      "INSERT INTO staff (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
      [full_name, email, hashedPassword, role_id],
    );
    res.status(201).json({
      message: "Staff registered successfully!",
      userId: userId,
    });
  } catch (err) {
    console.error("Staff registration error:", err);
    // databaseService.js already handles ER_DUP_ENTRY and throws AppError with 409
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("An error occurred during staff registration.", 500);
  }
};

/**
 * Handles customer login.
 * Finds the customer by email, compares the password, and issues a JWT token.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check customers table first
    const customerRows = await executeQuery(
      "SELECT * FROM customers WHERE email = ?",
      [email],
    );

    if (customerRows.length > 0) {
      const customer = customerRows[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        customer.password_hash,
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const token = jwt.sign(
        {
          userId: customer.customer_id,
          email: customer.email,
          role: "customer",
          userType: "customer",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      
      const userResponse = {
        customer_id: customer.customer_id,
        full_name: customer.full_name,
        email: customer.email,
        company_name: customer.company_name,
        phone: customer.phone,
        userType: "customer"
      };
      
      return res.json({ 
        message: "Login successful!", 
        token,
        user: userResponse
      });
    }

    // If not found in customers, check staff table
    const staffRows = await executeQuery(
      "SELECT * FROM staff WHERE email = ?",
      [email],
    );

    if (staffRows.length > 0) {
      const staff = staffRows[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        staff.password_hash,
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      const token = jwt.sign(
        {
          userId: staff.staff_id,
          email: staff.email,
          role: "staff",
          roleId: staff.role_id,
          userType: "staff",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      
      const userResponse = {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role_id: staff.role_id,
        userType: "staff"
      };
      
      return res.json({ 
        message: "Login successful!", 
        token,
        user: userResponse
      });
    }

    // Neither customer nor staff found
    return res.status(401).json({ error: "Invalid email or password." });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "An error occurred during login." });
  }
};

/**
 * Handles staff login specifically.
 * Finds the user by email, compares the password, and issues a JWT token.
 */
export const staffLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = await executeQuery("SELECT * FROM staff WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = jwt.sign(
      {
        userId: user.staff_id,
        email: user.email,
        role: "staff",
        roleId: user.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.json({ message: "Staff login successful!", token });
  } catch (err) {
    console.error("Staff login error:", err);
    return res.status(500).json({ error: "An error occurred during login." });
  }
};

/**
 * Retrieves all staff members from the database.
 * @returns {Promise<Array<object>>} An array of staff objects.
 */
export const getAllStaff = async (req, res) => {
  try {
    const rows = await executeQuery(
      "SELECT staff_id, full_name, email, role_id, created_at FROM staff",
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching all staff:", error);
    throw new AppError("Internal server error when fetching staff.", 500);
  }
};

/**
 * Retrieves a single staff member by their ID.
 * @param {number} staffId - The ID of the staff member to retrieve.\n * @returns {Promise<object|null>} The staff object if found, otherwise null.
 */
export const getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await executeQuery(
      "SELECT staff_id, full_name, email, role_id, created_at FROM staff WHERE staff_id = ?",
      [id],
    );
    if (rows.length === 0) {
      throw new AppError("Staff member not found.", 404);
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error fetching staff by ID:", error);
    throw new AppError(
      "Internal server error when fetching staff member.",
      500,
    );
  }
};

/**
 * Updates an existing staff member's details.
 * @param {number} staffId - The ID of the staff member to update.
 * @param {string} full_name - New full name.
 * @param {string} email - New email.
 * @param {number} role_id - New role ID.
 */
export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, role_id } = req.body;

  try {
    const affectedRows = await updateAndGetAffectedRows(
      "UPDATE staff SET full_name = ?, email = ?, role_id = ? WHERE staff_id = ?",
      [full_name, email, role_id, id],
    );

    if (affectedRows === 0) {
      throw new AppError("Staff member not found.", 404);
    }

    res.status(200).json({ message: "Staff member updated successfully." });
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error updating staff member:", error);
    throw new AppError(
      "Internal server error when updating staff member.",
      500,
    );
  }
};

/**
 * Deletes a staff member from the database.
 * @param {number} staffId - The ID of the staff member to delete.
 */
export const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const affectedRows = await deleteAndGetAffectedRows(
      "DELETE FROM staff WHERE staff_id = ?",
      [id],
    );

    if (affectedRows === 0) {
      throw new AppError("Staff member not found.", 404);
    }

    res.status(200).json({ message: "Staff member deleted successfully." });
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error deleting staff member:", error);
    throw new AppError(
      "Internal server error when deleting staff member.",
      500,
    );
  }
};

/**
 * Retrieves all roles from the database.
 * @returns {Promise<Array<object>>} An array of role objects.
 */
export const getAllRoles = async (req, res) => {
  try {
    const rows = await executeQuery("SELECT role_id, role_name FROM roles");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw new AppError("Internal server error when fetching roles.", 500);
  }
};

const authController = {
  register,
  login,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getAllRoles,
};

export default authController;
