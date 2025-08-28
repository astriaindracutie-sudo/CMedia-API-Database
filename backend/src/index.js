// backend/src/index.js

// 1. Load environment variables FIRST. This must be at the top.
import "dotenv/config";

// 2. Import other modules AFTER environment variables are loaded.
import express from "express";
import cors from "cors"; // Re-enable cors import
import rootRouter from "./routes/index.js";
import pool from "./utils/db.js"; // The database pool import is moved here
import {
  compatibilityMiddleware,
  logDeprecatedFields,
} from "./middlewares/compatibility.js";

// Validate critical environment variables early
const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_DATABASE",
  "JWT_SECRET",
  "PORT",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Critical environment variables missing:",
    missingVars.join(", "),
  );
  process.exit(1);
}

// Log important config for debugging (be careful in production)
console.log("✅ Loaded DB config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
});
console.log("✅ JWT_SECRET loaded");
console.log("✅ PORT:", process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS properly
const corsOrigin = "http://localhost:5173";
app.use(
  cors({
    origin: corsOrigin, // Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Log CORS configuration for debugging
console.log(`✅ CORS configured for origin: ${corsOrigin}`);

// Middleware
app.use(express.json());

// Add compatibility middleware for legacy API support
app.use(compatibilityMiddleware);
app.use(logDeprecatedFields);

// Basic route for health check
app.get("/", (req, res) => {
  res.send("CMedia API is running!");
});

// Use the root router
app.use("/", rootRouter);

// Global error handling middleware
app.use((err, req, res, _next) => {
  console.error(err); // Log the full error for debugging purposes

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";
  const details =
    process.env.NODE_ENV === "development" ? err.stack : undefined; // Only expose stack in development

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    details,
  });
});

// Start the server only after the database connection is verified
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Database connection pool verified.");
    conn.release();
    app.listen(PORT, () => {
      console.log(`⚡️ CMedia API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database on startup:", err);
    process.exit(1);
  });
