// backend/src/routes/servicePlans.js
import { Router } from "express";
import {
  createServicePlan,
  getServicePlanById,
  getServicePlans,
  updateServicePlan,
  getServiceTypes,
  getSlas,
  deleteServicePlan,
} from "../controllers/servicePlanController.js";

const router = Router();

// Get all service plans with optional filtering
router.get("/", async (req, res) => {
  const { serviceTypeCode, isActive, maxPrice } = req.query;

  try {
    const filters = {};
    if (serviceTypeCode) filters.serviceTypeCode = serviceTypeCode;
    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    console.log("Fetching service plans with filters:", filters);
    const plans = await getServicePlans(filters);
    console.log("Service plans retrieved successfully:", plans.length, "plans");
    res.json(plans);
  } catch (error) {
    console.error("Get service plans error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);

    // Handle AppError instances
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

// Get service types (for plan creation) - must come before /:id route
router.get("/types", async (req, res) => {
  try {
    console.log("Getting service types...");
    const types = await getServiceTypes();
    console.log("Service types retrieved:", types.length, "types");
    res.json(types);
  } catch (error) {
    console.error("Get service types error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);

    // Handle AppError instances
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

// Get SLAs (for plan creation) - must come before /:id route
router.get("/types/slas", async (req, res) => {
  try {
    const slas = await getSlas();
    res.json(slas);
  } catch (error) {
    console.error("Get SLAs error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Debug route to test service types function directly
router.get("/debug/types", async (req, res) => {
  try {
    console.log("Debug: Testing getServiceTypes function");
    const types = await getServiceTypes();
    console.log("Debug: Service types retrieved:", types);
    res.json({ debug: true, data: types, count: types.length });
  } catch (error) {
    console.error("Debug service types error:", error);
    console.error("Debug error message:", error.message);
    console.error("Debug error stack:", error.stack);
    res.status(500).json({
      debug: true,
      error: error.message,
      stack: error.stack,
    });
  }
});

// Get service plan by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Getting service plan by ID:", id);
    const plan = await getServicePlanById(id);
    res.json(plan);
  } catch (error) {
    console.error("Get service plan by ID error:", error);

    // Handle AppError instances
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal server error." });
  }
});

// Create new service plan
router.post("/", async (req, res) => {
  const {
    serviceTypeId,
    name,
    description,
    monthlyFee,
    currency,
    isActive,
    slaId,
    attributes,
  } = req.body;

  try {
    const plan = await createServicePlan({
      serviceTypeId,
      name,
      description,
      monthlyFee,
      currency,
      isActive,
      slaId,
      attributes,
    });

    res.status(201).json({
      message: "Service plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Create service plan error:", error);

    res.status(500).json({
      error: "Internal server error during service plan creation.",
    });
  }
});

// Update service plan
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const plan = await updateServicePlan(id, updateData);
    res.json({
      message: "Service plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update service plan error:", error);
    if (error.message === "Service plan not found or no changes made.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error." });
  }
});

// Delete service plan
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteServicePlan(id);
    if (deleted) {
      res.json({ message: "Service plan deleted successfully." });
    } else {
      res.status(404).json({ error: "Service plan not found." });
    }
  } catch (error) {
    console.error("Delete service plan error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
