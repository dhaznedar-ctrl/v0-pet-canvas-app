-- 004-admin-enhancements.sql
-- Adds recipient address columns to print_orders (for Turkey orders)
-- and creates the notification_banners table.

-- print_orders: recipient address fields
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255);
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_address1 VARCHAR(500);
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_city VARCHAR(200);
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_state_code VARCHAR(100);
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_country_code VARCHAR(10);
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_zip VARCHAR(20);
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(30);

-- Notification banners
CREATE TABLE IF NOT EXISTS notification_banners (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  active BOOLEAN DEFAULT false,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
