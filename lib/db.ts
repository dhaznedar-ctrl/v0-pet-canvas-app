import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Types for our database models
export interface User {
  id: number
  email: string
  name: string | null
  role: 'user' | 'admin'
  credits: number
  created_at: Date
}

export interface Consent {
  id: number
  user_id: number
  ip_hash: string
  user_agent: string
  consent_version: string
  accepted_terms_a: boolean
  accepted_terms_b: boolean
  created_at: Date
}

export interface Upload {
  id: number
  user_id: number
  file_key: string // R2 object key
  mime: string
  size: number
  expires_at: Date
  created_at: Date
}

export interface Order {
  id: number
  user_id: number
  iyzico_token: string | null
  payment_id: string | null
  stripe_session_id: string | null
  paid: boolean
  amount: number
  currency: string
  product_id: string | null
  created_at: Date
}

export interface Job {
  id: number
  user_id: number
  upload_id: number
  order_id: number | null
  style: string
  model: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error: string | null
  output_key: string | null // R2 URL
  created_at: Date
  updated_at: Date
}

export interface PrintOrder {
  id: number
  order_id: number
  job_id: number
  printful_order_id: number | null
  size: string
  status: string
  tracking_number: string | null
  tracking_url: string | null
  created_at: Date
  updated_at: Date
}

export interface Credit {
  id: number
  user_id: number
  amount: number
  reason: string
  order_id: number | null
  created_at: Date
}

export interface NotificationBanner {
  id: number
  message: string
  type: 'info' | 'warning' | 'promo' | 'maintenance'
  active: boolean
  starts_at: Date | null
  ends_at: Date | null
  created_at: Date
  updated_at: Date
}

// Helper to hash IP addresses for GDPR compliance (SHA-256 with salt)
export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || process.env.NEXTAUTH_SECRET || 'petcanvas-default-salt'
  return crypto
    .createHash('sha256')
    .update(`${salt}:${ip}`)
    .digest('hex')
    .slice(0, 16)
}
