// backend/src/utils/seedDb.js

// Load environment variables for this specific script
import "dotenv/config";

import db from "./db.js";
import bcrypt from "bcrypt";

async function seedDb() {
  let conn;
  try {
    conn = await db.getConnection();
    console.log("🔄 Clearing tables with DELETE...");
    // Clear related tables in reverse order to avoid foreign key issues
    // Note: Some tables might have ON DELETE CASCADE, so order is important for parent tables.
    // Clear service-related tables first as they might have FKs to types/SLAs
    await conn.query("DELETE FROM subscriptions");
    console.log("✅ subscriptions cleared");
    await conn.query("DELETE FROM service_plans");
    console.log("✅ service_plans cleared");
    await conn.query("DELETE FROM service_types");
    console.log("✅ service_types cleared");
    await conn.query("DELETE FROM slas");
    console.log("✅ slas cleared");

    // Clear core identity tables
    await conn.query("DELETE FROM support_tickets_meta"); // Assuming this is tied to staff/customers
    console.log("✅ support_tickets_meta cleared");
    await conn.query("DELETE FROM support_tickets");
    console.log("✅ support_tickets cleared");
    await conn.query("DELETE FROM staff_meta");
    console.log("✅ staff_meta cleared");
    await conn.query("DELETE FROM staff");
    console.log("✅ staff cleared");
    await conn.query("DELETE FROM customers");
    console.log("✅ customers cleared");
    await conn.query("DELETE FROM roles");
    console.log("✅ roles cleared");
    await conn.query("DELETE FROM locations"); // Clear locations if it exists
    console.log("✅ locations cleared");
    await conn.query("DELETE FROM iptv_packages"); // Clear IPTV packages if it exists
    console.log("✅ iptv_packages cleared");

    // Reset AUTO_INCREMENT for tables to ensure fresh IDs
    await conn.query("ALTER TABLE roles AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE customers AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE staff AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE slas AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE service_types AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE service_plans AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE subscriptions AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE locations AUTO_INCREMENT = 1");
    await conn.query("ALTER TABLE iptv_packages AUTO_INCREMENT = 1");

    // Seed Roles
    console.log("🌱 Seeding roles...");
    await conn.query(
      "INSERT INTO roles (role_id, role_name) VALUES (?, ?), (?, ?)",
      [1, "Support Staff", 2, "Administrator"],
    );
    console.log("✅ Roles seeded");

    // Seed Staff
    console.log("🌱 Seeding staff...");
    const hashedPassword = await bcrypt.hash("secure_password123", 10);
    await conn.query(
      "INSERT INTO staff (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?), (?, ?, ?, ?)",
      [
        "Alice Nguyen",
        "alice@cmedia.com",
        hashedPassword,
        1,
        "Bob Admin",
        "bob@cmedia.com",
        hashedPassword,
        2,
      ],
    );
    console.log("✅ Staff seeded");

    // Seed Service Types
    console.log("🌱 Seeding service types...");
    await conn.query(
      `INSERT INTO service_types (service_type_id, code, name, description) VALUES
      (1, 'HOME_FIBER', 'Home Fiber Optic', 'High-speed broadband via fiber'),
      (2, 'DEDICATED_INTERNET', 'Dedicated Internet', 'High-speed with 99.5%+ SLA'),
      (3, 'SOHO_INTERNET', 'SOHO Internet', 'Connectivity for small offices/home offices')`,
    );
    console.log("✅ Service Types seeded");

    // Seed SLAs
    console.log("🌱 Seeding SLAs...\n");
    await conn.query(
      `INSERT INTO slas (sla_id, name, availability_target, response_time_minutes, restore_time_minutes, description) VALUES
      (1, 'Standard 99.5%', 99.50, 60, 240, 'Standard business SLA with 99.5% availability')`,
    );
    console.log("✅ SLAs seeded");

    // Seed IPTV Packages (if relevant for service plans)
    console.log("🌱 Seeding IPTV Packages...\n");
    await conn.query(
      `INSERT INTO iptv_packages (iptv_package_id, name, description, channel_count, monthly_fee, is_active) VALUES
      (1, 'Basic IPTV', 'Entry-level IPTV package', 50, 25.00, TRUE)`,
    );
    console.log("✅ IPTV Packages seeded");

    // Seed Customers
    console.log("🌱 Seeding customers...\n");
    const customerHashedPassword = await bcrypt.hash("customer_pass", 10);
    await conn.query(
      `INSERT INTO customers (full_name, company_name, email, password_hash) VALUES
      ('John Doe', 'Acme Corp', 'john.doe@example.com', ?),
      ('Jane Smith', 'Beta Solutions', 'jane.smith@example.com', ?)`,
      [customerHashedPassword, customerHashedPassword],
    );
    console.log("✅ Customers seeded");

    // Seed Service Plans
    console.log("🌱 Seeding service plans...\n");
    await conn.query(
      `INSERT INTO service_plans (service_type_id, name, description, monthly_fee, currency, is_active, sla_id, attributes) VALUES
      (1, 'Fiber 100Mbps Home', '100 Mbps Home Fiber Plan', 75.00, 'USD', TRUE, NULL, NULL),
      (2, 'Dedicated 500Mbps Business', '500 Mbps Dedicated Business Internet with SLA', 500.00, 'USD', TRUE, 1, '{"features": ["24/7 support", "Guaranteed uptime"]}'),
      (3, 'SOHO 50Mbps Internet', '50 Mbps Internet for Small Offices', 60.00, 'USD', TRUE, NULL, NULL)`,
    );
    console.log("✅ Service Plans seeded");
  } catch (err) {
    console.error("❌ Error during database seeding:", err);
    throw err;
  } finally {
    if (conn) conn.release();
    console.log("✅ Connection released");
  }
}

// Run the script if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  seedDb()
    .then(() => {
      console.log("Script finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Script failed:", err);
      process.exit(1);
    });
}

export default seedDb;
