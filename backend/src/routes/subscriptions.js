// backend/src/routes/subscriptions.js
import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import {
  createSubscription,
  getSubscriptionById,
  getSubscriptionsByCustomerId,
  updateSubscriptionStatus,
} from "../controllers/subscriptionController.js";

const router = Router();

// Get current user's subscriptions (authenticated)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType || req.user.role;
    
    if (userType === 'customer') {
      const subscriptions = await getSubscriptionsByCustomerId(userId);
      res.json(subscriptions);
    } else {
      res.status(403).json({ error: "Access denied. Customer access required." });
    }
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Create new subscription (accepts both planId and packageId for compatibility)
router.post("/", async (req, res) => {
  const {
    customerId,
    planId,
    packageId,
    status = "pending",
    startDate,
    endDate,
    billingCycle = "monthly",
    siteLocationId,
  } = req.body;

  if (!customerId || (!planId && !packageId) || !startDate) {
    return res.status(400).json({
      error: "customerId, startDate, and either planId or packageId are required.",
    });
  }

  try {
    const subscription = await createSubscription({
      customerId,
      planId,
      packageId,
      status,
      startDate,
      endDate,
      billingCycle,
      siteLocationId,
    });

    // Add deprecation warning if packageId was used
    const headers = {};
    if (packageId && !planId) {
      headers["X-Deprecation-Warning"] = "packageId is deprecated, use planId instead";
    }

    res.status(201).json({
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    res.status(500).json({
      error: "Internal server error during subscription creation.",
    });
  }
});

// Get subscription by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const subscription = await getSubscriptionById(id);
    if (subscription) {
      res.json(subscription);
    } else {
      res.status(404).json({ error: "Subscription not found." });
    }
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get all subscriptions for a customer
router.get("/customer/:customerId", async (req, res) => {
  const { customerId } = req.params;

  try {
    const subscriptions = await getSubscriptionsByCustomerId(customerId);
    res.json(subscriptions);
  } catch (error) {
    console.error("Get customer subscriptions error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Update subscription status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  const validStatuses = ["pending", "active", "suspended", "terminated"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const subscription = await updateSubscriptionStatus(id, status);
    if (subscription) {
      res.json({
        message: "Subscription status updated successfully",
        subscription,
      });
    } else {
      res.status(404).json({ error: "Subscription not found." });
    }
  } catch (error) {
    console.error("Update subscription status error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;

