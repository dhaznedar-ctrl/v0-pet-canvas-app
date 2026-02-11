-- Email OTPs for order lookup
CREATE TABLE IF NOT EXISTS email_otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON email_otps(expires_at);

-- Add shipping columns to print_orders
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
