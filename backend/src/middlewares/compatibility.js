// backend/src/middlewares/compatibility.js

/**
 * Middleware to handle backward compatibility for package_id vs plan_id
 * Logs deprecation warnings when legacy fields are used
 */
export function compatibilityMiddleware(req, res, next) {
  const originalJson = res.json;

  res.json = function (data) {
    // Add deprecation warning header if legacy fields are present
    if (data && typeof data === "object") {
      const hasLegacyFields = checkForLegacyFields(data);
      if (hasLegacyFields) {
        res.set(
          "X-Deprecation-Warning",
          "Response contains legacy fields that will be removed in future versions",
        );
      }
    }

    return originalJson.call(this, data);
  };

  next();
}

/**
 * Check if response data contains legacy fields
 */
function checkForLegacyFields(data) {
  if (Array.isArray(data)) {
    return data.some((item) => checkForLegacyFields(item));
  }

  if (data && typeof data === "object") {
    const legacyFields = [
      "package_id",
      "legacy_package_id",
      "speed_mbps",
      "quota_gb",
    ];
    return legacyFields.some((field) =>
      Object.prototype.hasOwnProperty.call(data, field),
    );
  }

  return false;
}

/**
 * Middleware to log usage of deprecated request fields
 */
export function logDeprecatedFields(req, res, next) {
  const deprecatedFields = ["packageId"];
  const usedDeprecatedFields = deprecatedFields.filter(
    (field) =>
      req.body && Object.prototype.hasOwnProperty.call(req.body, field),
  );

  if (usedDeprecatedFields.length > 0) {
    console.warn(
      `Deprecated fields used in ${req.method} ${req.path}:`,
      usedDeprecatedFields,
    );
    res.set(
      "X-Deprecation-Warning",
      `Fields ${usedDeprecatedFields.join(", ")} are deprecated`,
    );
  }

  next();
}

/**
 * Middleware to transform legacy package_id to plan_id in requests
 */
export function transformLegacyFields(req, res, next) {
  if (req.body && req.body.packageId && !req.body.planId) {
    // This will be handled by the controller logic
    // Just log that we're using the legacy field
    console.log(
      `Legacy packageId used in ${req.method} ${req.path}: ${req.body.packageId}`,
    );
  }

  next();
}
