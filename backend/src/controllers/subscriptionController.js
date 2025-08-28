// backend/src/controllers/subscriptionController.js
import pool from "../utils/db.js";

/**
 * Creates a new subscription with plan_id (modern) or package_id (legacy compatibility)
 * @param {number} customerId - Customer ID
 * @param {number} planId - Modern plan ID (preferred)
 * @param {number} packageId - Legacy package ID (fallback)
 * @param {string} status - Subscription status
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (optional)
 * @param {string} billingCycle - Billing cycle
 * @param {number} siteLocationId - Location ID (optional)
 * @returns {Promise<object>} Created subscription
 */
export async function createSubscription({
  customerId,
  planId,
  packageId = null,
  status = "pending",
  startDate,
  endDate = null,
  billingCycle = "monthly",
  siteLocationId = null,
}) {
  try {
    // If planId not provided, try to map from packageId
    if (!planId && packageId) {
      const [planRows] = await pool.execute(
        "SELECT plan_id FROM service_plans WHERE JSON_EXTRACT(attributes, '$.legacy_package_id') = ?",
        [packageId],
      );
      if (planRows.length > 0) {
        planId = planRows[0].plan_id;
      }
    }

    if (!planId) {
      throw new Error("Either planId or packageId must be provided");
    }

    const [result] = await pool.execute(
      `INSERT INTO subscriptions (
        customer_id, plan_id, package_id, status, start_date, end_date, 
        billing_cycle, site_location_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, planId, packageId, status, startDate, endDate, billingCycle, siteLocationId],
    );

    const subscriptionId = result.insertId;

    // Return the created subscription
    return await getSubscriptionById(subscriptionId);
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Retrieves a subscription by ID with plan details
 * @param {number} subscriptionId - Subscription ID
 * @returns {Promise<object|null>} Subscription with plan details
 */
export async function getSubscriptionById(subscriptionId) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        s.*,
        sp.name as plan_name,
        sp.monthly_fee as plan_fee,
        sp.attributes as plan_attributes,
        st.code as service_type_code,
        st.name as service_type_name
      FROM subscriptions s
      LEFT JOIN service_plans sp ON s.plan_id = sp.plan_id
      LEFT JOIN service_types st ON sp.service_type_id = st.service_type_id
      WHERE s.subscription_id = ?`,
      [subscriptionId],
    );

    if (rows.length === 0) return null;

    const subscription = rows[0];

    // Add backward compatibility fields
    if (subscription.plan_attributes) {
      const attrs = JSON.parse(subscription.plan_attributes);
      subscription.legacy_package_id = attrs.legacy_package_id;
      subscription.speed_mbps = attrs.speed_mbps;
      subscription.quota_gb = attrs.quota_gb;
    }

    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw error;
  }
}

/**
 * Gets all subscriptions for a customer
 * @param {number} customerId - Customer ID
 * @returns {Promise<Array>} Array of subscriptions
 */
export async function getSubscriptionsByCustomerId(customerId) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        s.*,
        sp.name as plan_name,
        sp.monthly_fee as plan_fee,
        sp.attributes as plan_attributes,
        st.code as service_type_code,
        st.name as service_type_name
      FROM subscriptions s
      LEFT JOIN service_plans sp ON s.plan_id = sp.plan_id
      LEFT JOIN service_types st ON sp.service_type_id = st.service_type_id
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC`,
      [customerId],
    );

    return rows.map(subscription => {
      if (subscription.plan_attributes) {
        const attrs = JSON.parse(subscription.plan_attributes);
        subscription.legacy_package_id = attrs.legacy_package_id;
        subscription.speed_mbps = attrs.speed_mbps;
        subscription.quota_gb = attrs.quota_gb;
      }
      return subscription;
    });
  } catch (error) {
    console.error("Error retrieving customer subscriptions:", error);
    throw error;
  }
}

/**
 * Updates subscription status
 * @param {number} subscriptionId - Subscription ID
 * @param {string} status - New status
 * @returns {Promise<object>} Updated subscription
 */
export async function updateSubscriptionStatus(subscriptionId, status) {
  try {
    await pool.execute(
      "UPDATE subscriptions SET status = ? WHERE subscription_id = ?",
      [status, subscriptionId],
    );

    return await getSubscriptionById(subscriptionId);
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}

