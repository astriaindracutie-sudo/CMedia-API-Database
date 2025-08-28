// backend/src/routes/index.js
import { Router } from "express";
import authRoutes from "./auth.js";
import customerRoutes from "./customer.js";
import subscriptionRoutes from "./subscriptions.js";
import servicePlanRoutes from "./servicePlans.js";

const router = Router();

// Mount route modules
router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/service-plans", servicePlanRoutes);

export default router;
