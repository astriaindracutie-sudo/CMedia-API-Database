// backend/src/controllers/servicePlanController.js

import AppError from "../utils/appError.js";
import {
  executeQuery,
  insertAndGetId,
  updateAndGetAffectedRows,
  deleteAndGetAffectedRows,
} from "../services/databaseService.js";

/**
 * Creates a new service plan
 * @param {object} planData - Plan data
 * @returns {Promise<object>} Created plan
 */
export async function createServicePlan({
  serviceTypeId,
  name,
  description = null,
  monthlyFee = 0.0,
  currency = "USD",
  isActive = true,
  slaId = null,
  attributes = null,
}) {
  try {
    const insertId = await insertAndGetId(
      `INSERT INTO service_plans (
        service_type_id, name, description, monthly_fee, currency,
        is_active, sla_id, attributes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceTypeId,
        name,
        description,
        monthlyFee,
        currency,
        isActive,
        slaId,
        attributes ? JSON.stringify(attributes) : null,
      ],
    );

    return await getServicePlanById(insertId);
  } catch (error) {
    console.error("Error creating service plan:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Could not create service plan due to a server error.",
      500,
    );
  }
}

/**
 * Gets a service plan by ID with full details
 * @param {number} planId - Plan ID
 * @returns {Promise<object|null>} Service plan
 */
export async function getServicePlanById(planId) {
  try {
    const rows = await executeQuery(
      `SELECT
        sp.*,
        st.code as service_type_code,
        st.name as service_type_name,
        s.name as sla_name,
        s.availability_target as sla_availability
      FROM service_plans sp
      LEFT JOIN service_types st ON sp.service_type_id = st.service_type_id
      LEFT JOIN slas s ON sp.sla_id = s.sla_id
      WHERE sp.plan_id = ?`,
      [planId],
    );

    if (rows.length === 0) {
      throw new AppError("Service plan not found.", 404);
    }

    const plan = rows[0];
    if (plan.attributes) {
      plan.attributes = JSON.parse(plan.attributes);
    }

    return plan;
  } catch (error) {
    console.error("Error retrieving service plan:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Could not retrieve service plan due to a server error.",
      500,
    );
  }
}

/**
 * Gets all service plans with optional filtering
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} Array of service plans
 */
export async function getServicePlans(filters = {}) {
  try {
    console.log("getServicePlans called with filters:", filters);

    // Start with a simple query first
    let query = "SELECT * FROM service_plans WHERE 1=1";
    const params = [];

    if (filters.isActive !== undefined) {
      query += " AND is_active = ?";
      params.push(filters.isActive);
    }

    if (filters.maxPrice) {
      query += " AND monthly_fee <= ?";
      params.push(filters.maxPrice);
    }

    query += " ORDER BY monthly_fee ASC";

    console.log("Executing query:", query, "with params:", params);
    const rows = await executeQuery(query, params);
    console.log("Query returned", rows.length, "rows");

    // Process results
    const processedRows = rows.map((plan) => {
      if (plan.attributes && typeof plan.attributes === "string") {
        try {
          plan.attributes = JSON.parse(plan.attributes);
        } catch (parseError) {
          console.warn(
            "Failed to parse attributes for plan",
            plan.plan_id,
            parseError,
          );
          plan.attributes = null;
        }
      }
      return plan;
    });

    console.log("Returning processed rows:", processedRows.length);
    return processedRows;
  } catch (error) {
    console.error("Error retrieving service plans:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Could not retrieve service plans due to a server error.",
      500,
    );
  }
}

/**
 * Updates a service plan
 * @param {number} planId - Plan ID
 * @param {object} updateData - Update data
 * @returns {Promise<object>} Updated plan
 */
export async function updateServicePlan(planId, updateData) {
  try {
    const fields = [];
    const params = [];

    if (updateData.serviceTypeId !== undefined) {
      fields.push("service_type_id = ?");
      params.push(updateData.serviceTypeId);
    }
    if (updateData.name !== undefined) {
      fields.push("name = ?");
      params.push(updateData.name);
    }
    if (updateData.description !== undefined) {
      fields.push("description = ?");
      params.push(updateData.description);
    }
    if (updateData.monthlyFee !== undefined) {
      fields.push("monthly_fee = ?");
      params.push(updateData.monthlyFee);
    }
    if (updateData.currency !== undefined) {
      fields.push("currency = ?");
      params.push(updateData.currency);
    }
    if (updateData.isActive !== undefined) {
      fields.push("is_active = ?");
      params.push(updateData.isActive);
    }
    if (updateData.slaId !== undefined) {
      fields.push("sla_id = ?");
      params.push(updateData.slaId);
    }
    if (updateData.attributes !== undefined) {
      fields.push("attributes = ?");
      params.push(
        updateData.attributes ? JSON.stringify(updateData.attributes) : null,
      );
    }

    if (fields.length === 0) {
      return await getServicePlanById(planId); // Nothing to update
    }

    params.push(planId);
    const affectedRows = await updateAndGetAffectedRows(
      `UPDATE service_plans SET ${fields.join(", ")} WHERE plan_id = ?`,
      params,
    );

    if (affectedRows === 0) {
      throw new AppError("Service plan not found or no changes made.", 404);
    }

    return await getServicePlanById(planId);
  } catch (error) {
    console.error("Error updating service plan:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Could not update service plan due to a server error.",
      500,
    );
  }
}

/**
 * Deletes a service plan
 * @param {number} planId - Plan ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
export async function deleteServicePlan(planId) {
  try {
    const affectedRows = await deleteAndGetAffectedRows(
      "DELETE FROM service_plans WHERE plan_id = ?",
      [planId],
    );
    if (affectedRows === 0) {
      throw new AppError("Service plan not found.", 404);
    }
    return true; // Indicate successful deletion
  } catch (error) {
    console.error("Error deleting service plan:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Could not delete service plan due to a server error.",
      500,
    );
  }
}

/**
 * Gets service types for plan creation
 * @returns {Promise<Array>} Array of service types
 */
export async function getServiceTypes() {
  try {
    console.log("getServiceTypes called");
    const rows = await executeQuery(
      "SELECT * FROM service_types ORDER BY name",
    );
    console.log("getServiceTypes returning", rows.length, "rows");
    return rows;
  } catch (error) {
    console.error("Error retrieving service types:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Could not retrieve service types due to a server error.",
      500,
    );
  }
}

/**
 * Gets SLAs for plan creation
 * @returns {Promise<Array>} Array of SLAs
 */
export async function getSlas() {
  try {
    const rows = await executeQuery(
      "SELECT * FROM slas ORDER BY availability_target DESC",
    );
    return rows;
  } catch (error) {
    console.error("Error retrieving SLAs:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Could not retrieve SLAs due to a server error.", 500);
  }
}
