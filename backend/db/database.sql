CREATE DATABASE IF NOT EXISTS cmedia_db;
USE cmedia_db;

--
-- Core identities
--
CREATE TABLE IF NOT EXISTS roles (
	role_id INT AUTO_INCREMENT PRIMARY KEY,
	role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
	customer_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    full_name VARCHAR(255) NOT NULL,
	company_name VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
	phone VARCHAR(30) NULL,
    password_hash VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
	staff_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (role_id) REFERENCES roles(role_id),
	KEY idx_staff_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Locations (customer sites / POPs)
--
CREATE TABLE IF NOT EXISTS locations (
	location_id INT AUTO_INCREMENT PRIMARY KEY,
	location_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
	customer_id INT NULL,
	name VARCHAR(255) NULL,
	address_line1 VARCHAR(255) NOT NULL,
	address_line2 VARCHAR(255) NULL,
	city VARCHAR(100) NOT NULL,
	state VARCHAR(100) NULL,
	postal_code VARCHAR(30) NOT NULL,
	country VARCHAR(100) NOT NULL,
	latitude DECIMAL(9,6) NULL,
	longitude DECIMAL(9,6) NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
	KEY idx_locations_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Service catalog and SLAs
--
CREATE TABLE IF NOT EXISTS slas (
	sla_id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	availability_target DECIMAL(5,2) NOT NULL,
	response_time_minutes INT NULL,
	restore_time_minutes INT NULL,
	description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_types (
	service_type_id INT AUTO_INCREMENT PRIMARY KEY,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(100) NOT NULL,
	description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_plans (
	plan_id INT AUTO_INCREMENT PRIMARY KEY,
	plan_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
	service_type_id INT NOT NULL,
	name VARCHAR(150) NOT NULL,
	description TEXT NULL,
	monthly_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	currency CHAR(3) NOT NULL DEFAULT 'USD',
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	sla_id INT NULL,
	attributes JSON NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id),
	FOREIGN KEY (sla_id) REFERENCES slas(sla_id),
	KEY idx_service_plans_type (service_type_id),
	KEY idx_service_plans_sla (sla_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Subscriptions and service instances
--
CREATE TABLE IF NOT EXISTS subscriptions (
	subscription_id INT AUTO_INCREMENT PRIMARY KEY,
	subscription_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
	customer_id INT NOT NULL,
	plan_id INT NOT NULL,
	status ENUM('pending','active','suspended','terminated') NOT NULL DEFAULT 'pending',
	start_date DATE NOT NULL,
	end_date DATE NULL,
	contract_term_months INT NULL,
	auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
	billing_cycle ENUM('monthly','quarterly','annually') NOT NULL DEFAULT 'monthly',
	site_location_id INT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
	FOREIGN KEY (plan_id) REFERENCES service_plans(plan_id),
	FOREIGN KEY (site_location_id) REFERENCES locations(location_id),
	KEY idx_subscriptions_customer (customer_id),
	KEY idx_subscriptions_plan (plan_id),
	KEY idx_subscriptions_location (site_location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_instances (
	service_instance_id INT AUTO_INCREMENT PRIMARY KEY,
	instance_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
	subscription_id INT NOT NULL,
	service_type_id INT NOT NULL,
	status ENUM('provisioning','active','suspended','terminated') NOT NULL DEFAULT 'provisioning',
	active_from DATE NULL,
	active_until DATE NULL,
	location_id INT NULL,
	notes TEXT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id),
	FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id),
	FOREIGN KEY (location_id) REFERENCES locations(location_id),
	KEY idx_instances_subscription (subscription_id),
	KEY idx_instances_type (service_type_id),
	KEY idx_instances_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Orders / provisioning workflows
--
CREATE TABLE IF NOT EXISTS orders (
	order_id INT AUTO_INCREMENT PRIMARY KEY,
	order_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
	subscription_id INT NOT NULL,
	type ENUM('provision','change','cancel') NOT NULL,
	status ENUM('requested','in_progress','completed','failed') NOT NULL DEFAULT 'requested',
	requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	completed_at TIMESTAMP NULL,
	details JSON NULL,
	FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id),
	KEY idx_orders_subscription (subscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Network allocations / equipment
--
CREATE TABLE IF NOT EXISTS ip_allocations (
	allocation_id INT AUTO_INCREMENT PRIMARY KEY,
	service_instance_id INT NOT NULL,
	routing_type ENUM('static','pppoe','dhcp','bgp') NOT NULL DEFAULT 'static',
	ipv4_address VARCHAR(45) NULL,
	ipv4_cidr VARCHAR(45) NULL,
	ipv6_cidr VARCHAR(64) NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE,
	KEY idx_ipalloc_instance (service_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cpe_devices (
	device_id INT AUTO_INCREMENT PRIMARY KEY,
	service_instance_id INT NOT NULL,
	device_type VARCHAR(100) NOT NULL,
	vendor VARCHAR(100) NULL,
	model VARCHAR(100) NULL,
	serial_number VARCHAR(100) NULL,
	mac_address VARCHAR(50) NULL,
	installed_at TIMESTAMP NULL,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE,
	KEY idx_cpe_instance (service_instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- IPTV catalog
--
CREATE TABLE IF NOT EXISTS iptv_packages (
	iptv_package_id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(150) NOT NULL,
	description TEXT NULL,
	channel_count INT NULL,
	monthly_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Service-specific detail tables (1:1 with service_instances)
--
CREATE TABLE IF NOT EXISTS home_fiber_details (
	service_instance_id INT PRIMARY KEY,
	down_mbps INT NOT NULL,
	up_mbps INT NOT NULL,
	ont_serial VARCHAR(64) NULL,
	static_ip BOOLEAN NOT NULL DEFAULT FALSE,
	wifi_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dedicated_internet_details (
	service_instance_id INT PRIMARY KEY,
	bandwidth_mbps INT NOT NULL,
	sla_id INT NULL,
	last_mile_type ENUM('fiber','wireless','other') NOT NULL DEFAULT 'fiber',
	bgp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
	ip_block_cidr VARCHAR(64) NULL,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE,
	FOREIGN KEY (sla_id) REFERENCES slas(sla_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS soho_internet_details (
	service_instance_id INT PRIMARY KEY,
	down_mbps INT NOT NULL,
	up_mbps INT NOT NULL,
	static_ip BOOLEAN NOT NULL DEFAULT FALSE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS internet_iptv_details (
	service_instance_id INT PRIMARY KEY,
	down_mbps INT NOT NULL,
	up_mbps INT NOT NULL,
	iptv_package_id INT NULL,
	stb_count INT NOT NULL DEFAULT 1,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE,
	FOREIGN KEY (iptv_package_id) REFERENCES iptv_packages(iptv_package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hosting_details (
	service_instance_id INT PRIMARY KEY,
	primary_domain VARCHAR(255) NOT NULL,
	storage_gb INT NOT NULL,
	bandwidth_tb INT NULL,
	ssl_included BOOLEAN NOT NULL DEFAULT TRUE,
	control_panel ENUM('none','cpanel','plesk','custom') NOT NULL DEFAULT 'custom',
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS colocation_details (
	service_instance_id INT PRIMARY KEY,
	rack_units INT NOT NULL,
	power_kw DECIMAL(6,2) NULL,
	bandwidth_commit_mbps INT NULL,
	cross_connects INT NULL,
	access_24x7 BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vps_details (
	service_instance_id INT PRIMARY KEY,
	vcpu INT NOT NULL,
	ram_gb INT NOT NULL,
	storage_gb INT NOT NULL,
	storage_type ENUM('ssd','hdd','nvme') NOT NULL DEFAULT 'ssd',
	os_image VARCHAR(100) NOT NULL,
	ipv4_addresses INT NOT NULL DEFAULT 1,
	ipv6_subnet VARCHAR(64) NULL,
	backup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mail_server_details (
	service_instance_id INT PRIMARY KEY,
	primary_domain VARCHAR(255) NOT NULL,
	mailbox_quota_gb DECIMAL(6,2) NOT NULL DEFAULT 10.00,
	mailbox_count INT NOT NULL DEFAULT 10,
	spam_filter_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	dkim_enabled BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS online_cctv_details (
	service_instance_id INT PRIMARY KEY,
	camera_count INT NOT NULL,
	retention_days INT NOT NULL,
	cloud_storage_gb INT NULL,
	mobile_access BOOLEAN NOT NULL DEFAULT TRUE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS network_system_details (
	service_instance_id INT PRIMARY KEY,
	scope ENUM('LAN','WAN','LAN_WAN') NOT NULL DEFAULT 'LAN_WAN',
	devices_managed INT NULL,
	vendor_stack VARCHAR(100) NULL,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS server_configuration_details (
	service_instance_id INT PRIMARY KEY,
	tasks JSON NULL,
	maintenance_window VARCHAR(100) NULL,
	on_call_support BOOLEAN NOT NULL DEFAULT FALSE,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reseller_partnership_details (
	service_instance_id INT PRIMARY KEY,
	partner_company VARCHAR(255) NOT NULL,
	reseller_code VARCHAR(50) NOT NULL UNIQUE,
	discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
	region VARCHAR(100) NULL,
	allowed_service_types JSON NULL,
	FOREIGN KEY (service_instance_id) REFERENCES service_instances(service_instance_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- UUID auto-generation triggers (MariaDB): set UUIDs if NULL on insert
--
DELIMITER //
DROP TRIGGER IF EXISTS trg_customers_set_uuid //
CREATE TRIGGER trg_customers_set_uuid BEFORE INSERT ON customers FOR EACH ROW
BEGIN
    IF NEW.customer_uuid IS NULL OR NEW.customer_uuid = '' THEN
        SET NEW.customer_uuid = UUID();
    END IF;
END //

DROP TRIGGER IF EXISTS trg_staff_set_uuid //
CREATE TRIGGER trg_staff_set_uuid BEFORE INSERT ON staff FOR EACH ROW
BEGIN
    IF NEW.staff_uuid IS NULL OR NEW.staff_uuid = '' THEN
        SET NEW.staff_uuid = UUID();
    END IF;
END //

DROP TRIGGER IF EXISTS trg_locations_set_uuid //
CREATE TRIGGER trg_locations_set_uuid BEFORE INSERT ON locations FOR EACH ROW
BEGIN
    IF NEW.location_uuid IS NULL OR NEW.location_uuid = '' THEN
        SET NEW.location_uuid = UUID();
    END IF;
END //

DROP TRIGGER IF EXISTS trg_service_plans_set_uuid //
CREATE TRIGGER trg_service_plans_set_uuid BEFORE INSERT ON service_plans FOR EACH ROW
BEGIN
    IF NEW.plan_uuid IS NULL OR NEW.plan_uuid = '' THEN
        SET NEW.plan_uuid = UUID();
    END IF;
END //

DROP TRIGGER IF EXISTS trg_subscriptions_set_uuid //
CREATE TRIGGER trg_subscriptions_set_uuid BEFORE INSERT ON subscriptions FOR EACH ROW
BEGIN
    IF NEW.subscription_uuid IS NULL OR NEW.subscription_uuid = '' THEN
        SET NEW.subscription_uuid = UUID();
    END IF;
END //

DROP TRIGGER IF EXISTS trg_service_instances_set_uuid //
CREATE TRIGGER trg_service_instances_set_uuid BEFORE INSERT ON service_instances FOR EACH ROW
BEGIN
    IF NEW.instance_uuid IS NULL OR NEW.instance_uuid = '' THEN
        SET NEW.instance_uuid = UUID();
    END IF;
END //

DROP TRIGGER IF EXISTS trg_orders_set_uuid //
CREATE TRIGGER trg_orders_set_uuid BEFORE INSERT ON orders FOR EACH ROW
BEGIN
    IF NEW.order_uuid IS NULL OR NEW.order_uuid = '' THEN
        SET NEW.order_uuid = UUID();
    END IF;
END //
DELIMITER ;

--
-- Seed service types (idempotent)
--
INSERT IGNORE INTO service_types (code, name, description) VALUES
    ('HOME_FIBER', 'Home Fiber Optic', 'High-speed broadband via fiber'),
    ('DEDICATED_INTERNET', 'Dedicated Internet', 'High-speed with 99.5%+ SLA'),
    ('SOHO_INTERNET', 'SOHO Internet', 'Connectivity for small offices/home offices'),
    ('INTERNET_IPTV', 'Internet + IPTV', 'Bundled Internet and IPTV'),
    ('HOSTING', 'Hosting', 'High-performance website hosting'),
    ('COLOCATION', 'Colocation Server', 'Colocation for routers or servers'),
    ('VPS', 'VPS Server', 'Virtual Private Servers'),
    ('MAIL', 'Mail Server', 'Reliable email hosting'),
    ('CCTV', 'Online CCTV', 'Smartphone-accessible CCTV monitoring'),
    ('NETWORK_SYSTEM', 'Network System', 'LAN/WAN management services'),
    ('SERVER_CONFIG', 'Server Configuration', 'Setup, maintenance, procurement'),
    ('RESELLER', 'Reseller Partnership', 'Telecom reseller programs');

-- Optional seed SLA for Dedicated Internet
INSERT IGNORE INTO slas (name, availability_target, response_time_minutes, restore_time_minutes, description) VALUES
    ('Standard 99.5%', 99.50, 60, 240, 'Standard business SLA with 99.5% availability');