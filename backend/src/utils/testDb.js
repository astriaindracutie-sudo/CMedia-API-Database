// backend/src/utils/testDb.js
// Fully updated version using mariadb
import dotenv from "dotenv";
import path from "path";
import mariadb from "mariadb";

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });

console.log("🔍 Testing DB_HOST:", process.env.DB_HOST);
console.log("🔍 Testing DB_USER:", process.env.DB_USER);
console.log("🔍 Testing DB_DATABASE:", process.env.DB_DATABASE);
console.log(
  "🔍 Testing DB_PASSWORD:",
  process.env.DB_PASSWORD ? "✅ Loaded" : "❌ Missing",
);

async function testDatabaseConnection() {
  let connection;
  try {
    // Create a direct connection for testing purposes, not from the pool
    connection = await mariadb.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectTimeout: 10000, // 10 seconds for connection
    });

    console.log("✅ Connected to MariaDB successfully for testing.");

    // Test query: Describe the 'staff' table
    console.log("🔄 Describing the `staff` table...");
    const staffRows = await connection.query("DESCRIBE staff");
    if (staffRows.length > 0) {
      console.log("✅ `staff` table structure:");
      console.table(staffRows);
    } else {
      console.warn(
        "⚠️ `staff` table exists but has no columns, or query returned no rows.",
      );
    }

    // Test query: Describe the 'customers' table
    console.log("🔄 Describing the `customers` table...");
    const customerRows = await connection.query("DESCRIBE customers");
    if (customerRows.length > 0) {
      console.log("✅ `customers` table structure:");
      console.table(customerRows);
    } else {
      console.warn(
        "⚠️ `customers` table exists but has no columns, or query returned no rows.",
      );
    }

    // Example: Fetch a few records from staff
    console.log("🔄 Fetching a few records from `staff`...");
    const [staffRecords] = await connection.query(
      "SELECT staff_id, full_name, email, role_id FROM staff LIMIT 2",
    );
    if (staffRecords.length > 0) {
      console.log("✅ Example `staff` records:");
      console.table(staffRecords);
    } else {
      console.log("ℹ️ `staff` table is empty or no records found.");
    }

    // Example: Fetch a few records from customers
    console.log("🔄 Fetching a few records from `customers`...");
    const [customerRecords] = await connection.query(
      "SELECT customer_id, full_name, email FROM customers LIMIT 2",
    );
    if (customerRecords.length > 0) {
      console.log("✅ Example `customers` records:");
      console.table(customerRecords);
    } else {
      console.log("ℹ️ `customers` table is empty or no records found.");
    }

    console.log("✅ Database connection test complete.");
  } catch (err) {
    console.error("❌ Database connection test error:", err);
    console.error(
      "   Please check your .env file credentials and ensure the database server is running and accessible.",
    );
    process.exit(1); // Exit with error code if connection fails
  } finally {
    if (connection) {
      await connection.end();
      console.log("✅ Connection closed.");
    }
  }
}

// Call the test function
testDatabaseConnection();
