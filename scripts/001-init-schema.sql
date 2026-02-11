-- PET CANVAS STUDIO — Database Schema
-- Run this on your Neon PostgreSQL database

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consents (GDPR)
CREATE TABLE IF NOT EXISTS consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ip_hash VARCHAR(64) NOT NULL,
  user_agent TEXT,
  consent_version VARCHAR(10) NOT NULL,
  accepted_terms_a BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_terms_b BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Uploads (now stores R2 keys, not base64)
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  file_key VARCHAR(512) NOT NULL, -- R2 object key (e.g. uploads/1/1234567890-abc.jpg)
  mime VARCHAR(50) NOT NULL,
  size INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders (iyzico instead of Stripe)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  iyzico_token VARCHAR(255),
  payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255), -- kept for backward compat
  paid BOOLEAN DEFAULT FALSE,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(10) DEFAULT 'usd',
  product_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs (AI generation)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  upload_id INTEGER REFERENCES uploads(id),
  order_id INTEGER REFERENCES orders(id),
  style VARCHAR(50) NOT NULL,
  model VARCHAR(100) DEFAULT 'fal-nano-banana-pro',
  status VARCHAR(20) DEFAULT 'queued', -- queued | processing | completed | failed
  error TEXT,
  output_key TEXT, -- R2 URL of watermarked preview
  hd_output_key TEXT, -- R2 URL of original HD (only served after payment)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Print orders (Printful)
CREATE TABLE IF NOT EXISTS print_orders (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id),
  printful_order_id INTEGER,
  size VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credits (purchase history)
CREATE TABLE IF NOT EXISTS credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive = purchase, negative = usage
  reason VARCHAR(100) NOT NULL, -- 'purchase_pack_5', 'generation', 'refund'
  order_id INTEGER REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'generation_complete', 'print_shipped'
  to_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Rate limits (sliding window, PostgreSQL-backed)
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  window_start TIMESTAMP NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
  id SERIAL PRIMARY KEY,
  ip_hash VARCHAR(64) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP, -- NULL = permanent
  violation_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Security event logs
CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  ip_hash VARCHAR(64),
  fingerprint VARCHAR(64),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_expires_at ON uploads(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_iyzico_token ON orders(iyzico_token);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_orders_order_id ON print_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);

-- Security table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_key_window ON rate_limits(key, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_hash ON blocked_ips(ip_hash);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires_at ON blocked_ips(expires_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
