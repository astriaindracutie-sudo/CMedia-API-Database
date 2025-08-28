// backend/src/services/databaseService.js

import pool from "../utils/db.js";
import AppError from "../utils/appError.js";

/**
 * Executes a SQL query with optional parameters.
 * @param {string} sql - The SQL query string.
 * @param {Array<any>} params - An array of parameters for the query.
 * @returns {Promise<Array<object>>} The rows returned by the query.
 * @throws {AppError} If a database error occurs.
 */
async function executeQuery(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const queryResult = await conn.execute(sql, params);

    // The mariadb.execute documentation states that for SELECT statements,
    // it returns an array of rows (e.g., [{...}, {...}]).
    // For DML statements (INSERT, UPDATE, DELETE), it returns an OkPacket object.

    // Ensure the result is always an array of rows for SELECT statements.
    // If it's not an array (e.g., an OkPacket for DML), return an empty array or handle appropriately.
    if (Array.isArray(queryResult)) {
      // Convert BigInt values to Numbers for JSON serialization
      return queryResult.map((row) => {
        const convertedRow = {};
        for (const [key, value] of Object.entries(row)) {
          convertedRow[key] = typeof value === "bigint" ? Number(value) : value;
        }
        return convertedRow;
      });
    } else {
      // If it's not an array, it might be an OkPacket (for INSERT/UPDATE/DELETE)
      // or an unexpected single object for a SELECT without results.
      // For `executeQuery`, we primarily expect SELECT results, so an empty array is a safe default.
      return [];
    }
  } catch (error) {
    console.error("Database query error:", error);
    // Wrap database errors in AppError for consistent handling
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      throw new AppError("Duplicate entry.", 409);
    }
    throw new AppError("Database operation failed.", 500);
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Executes a SQL insert query and returns the insert ID.
 * @param {string} sql - The SQL insert query string.
 * @param {Array<any>} params - An array of parameters for the query.
 * @returns {Promise<number>} The ID of the newly inserted row.
 * @throws {AppError} If a database error occurs.
 */
async function insertAndGetId(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, params);
    return Number(result.insertId);
  } catch (error) {
    console.error("Database insert error:", error);
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      throw new AppError("Duplicate entry.", 409);
    }
    throw new AppError("Database insert operation failed.", 500);
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Executes a SQL update query and returns the number of affected rows.
 * @param {string} sql - The SQL update query string.
 * @param {Array<any>} params - An array of parameters for the query.
 * @returns {Promise<number>} The number of rows affected by the update.
 * @throws {AppError} If a database error occurs.
 */
async function updateAndGetAffectedRows(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, params);
    return Number(result.affectedRows);
  } catch (error) {
    console.error("Database update error:", error);
    throw new AppError("Database update operation failed.", 500);
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Executes a SQL delete query and returns the number of affected rows.
 * @param {string} sql - The SQL delete query string.
 * @param {Array<any>} params - An array of parameters for the query.
 * @returns {Promise<number>} The number of rows affected by the delete.
 * @throws {AppError} If a database error occurs.
 */
async function deleteAndGetAffectedRows(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, params);
    return Number(result.affectedRows);
  } catch (error) {
    console.error("Database delete error:", error);
    throw new AppError("Database delete operation failed.", 500);
  } finally {
    if (conn) conn.release();
  }
}

export {
  executeQuery,
  insertAndGetId,
  updateAndGetAffectedRows,
  deleteAndGetAffectedRows,
};
