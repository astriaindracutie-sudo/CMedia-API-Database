// backend/src/routes/customer.js
// This file will now handle customer-specific routes, e.g., registration
import { Router } from "express";
import {
  createCustomer,
  getCustomerById,
} from "../controllers/customerController.js";
import {
  validate,
  createCustomerValidationRules,
} from "../middlewares/validation.js";

const router = Router();

// Route for new customer registration
router.post(
  "/",
  createCustomerValidationRules(),
  validate,
  async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
      console.log("Customer registration attempt:", { fullName, email });
      const customerId = await createCustomer(fullName, email, password);
      console.log("Customer registered successfully with ID:", customerId);
      res
        .status(201)
        .json({ message: "Customer registered successfully", customerId });
    } catch (error) {
      console.error("Registration route error:", error);

      // Handle AppError instances
      if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      // Handle database duplicate entry errors
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        return res.status(409).json({ error: "Email already registered." });
      }

      // Generic error handler
      return res
        .status(500)
        .json({ error: "Internal server error during registration." });
    }
  },
);

// Example route to get customer by ID (might require authentication/authorization in a real app)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log("Getting customer by ID:", id);
    const customer = await getCustomerById(id);
    res.json(customer);
  } catch (error) {
    console.error("Get customer route error:", error);

    // Handle AppError instances
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    // Generic error handler
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
