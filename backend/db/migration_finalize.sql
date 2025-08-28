-- Final migration to clean up schema and add compatibility layer
USE cmedia_db;

-- 1. Ensure all subscriptions have plan_id mapped
SELECT COUNT(*) AS subs_without_plan FROM subscriptions WHERE plan_id IS NULL;

-- 2. Make plan_id NOT NULL for new subscriptions (keep package_id nullable for compatibility)
ALTER TABLE subscriptions MODIFY plan_id INT NOT NULL;

-- 3. Create compatibility view for service_packages
DROP VIEW IF EXISTS service_packages;
CREATE OR REPLACE VIEW service_packages AS
SELECT
  p.plan_id      AS package_id,
  p.name         AS package_name,
  CAST(JSON_UNQUOTE(JSON_EXTRACT(p.attributes,'$.speed_mbps')) AS UNSIGNED) AS speed_mbps,
  CAST(JSON_UNQUOTE(JSON_EXTRACT(p.attributes,'$.quota_gb')) AS UNSIGNED)    AS quota_gb,
  p.monthly_fee  AS price,
  CAST(JSON_UNQUOTE(JSON_EXTRACT(p.attributes,'$.legacy_sla_percent')) AS DECIMAL(5,2)) AS sla_percent,
  p.description,
  p.is_active,
  p.created_at
FROM service_plans p
WHERE JSON_EXTRACT(p.attributes,'$.legacy_package_id') IS NOT NULL;

-- 4. Add indexes for better performance
ALTER TABLE subscriptions ADD INDEX IF NOT EXISTS idx_subscriptions_plan_id (plan_id);
ALTER TABLE subscriptions ADD INDEX IF NOT EXISTS idx_subscriptions_status (status);
ALTER TABLE subscriptions ADD INDEX IF NOT EXISTS idx_subscriptions_start_date (start_date);

-- 5. Add constraints to ensure data integrity
ALTER TABLE subscriptions 
  ADD CONSTRAINT fk_subscriptions_plan_id 
  FOREIGN KEY (plan_id) REFERENCES service_plans(plan_id);

-- 6. Create a view for easy subscription queries with plan details
DROP VIEW IF EXISTS subscription_details;
CREATE OR REPLACE VIEW subscription_details AS
SELECT
  s.subscription_id,
  s.subscription_uuid,
  s.customer_id,
  s.plan_id,
  s.package_id,
  s.status,
  s.start_date,
  s.end_date,
  s.billing_cycle,
  s.site_location_id,
  s.created_at,
  sp.name as plan_name,
  sp.monthly_fee as plan_fee,
  sp.currency,
  sp.attributes as plan_attributes,
  st.code as service_type_code,
  st.name as service_type_name,
  c.full_name as customer_name,
  c.email as customer_email
FROM subscriptions s
LEFT JOIN service_plans sp ON s.plan_id = sp.plan_id
LEFT JOIN service_types st ON sp.service_type_id = st.service_type_id
LEFT JOIN customers c ON s.customer_id = c.customer_id;

-- 7. Optional: Create a migration log table to track schema changes
CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- 8. Log this migration
INSERT INTO schema_migrations (migration_name, description) VALUES 
('finalize_plan_id_migration', 'Completed migration from package_id to plan_id with compatibility layer');

-- 9. Show final status
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT COUNT(*) as total_service_plans FROM service_plans;
SELECT COUNT(*) as total_service_types FROM service_types;

