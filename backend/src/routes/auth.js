// backend/src/routes/auth.js

import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.js";
import {
  login,
  staffLogin,
  register,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getAllRoles,
} from "../controllers/authController.js";
import {
  validate,
  loginValidationRules,
  createCustomerValidationRules,
} from "../middlewares/validation.js";

const router = Router();

// Public route for customer/staff login
router.post("/login", loginValidationRules(), validate, login);

// Public route for staff login specifically
router.post("/staff/login", loginValidationRules(), validate, staffLogin);

// Public route for user registration (for new staff, not customers)
router.post("/register", createCustomerValidationRules(), validate, register);

// Routes for Staff Management (Admin Only) - Temporarily disabled auth for testing
router.get("/staff", getAllStaff);
router.get("/staff/roles", getAllRoles);
router.get("/staff/:id", getStaffById);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

// Routes that require authentication
router.get("/profile", authenticateToken, (req, res) => {
  // req.user will contain id, email, and role from the JWT payload
  res.json({ message: "Authenticated user profile", user: req.user });
});

// Example route that requires authentication and specific roles
router.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin access granted", user: req.user });
});

export default router;
