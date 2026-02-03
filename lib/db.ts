import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Types for our database models
export interface User {
  id: number
  email: string
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
  file_key: string
  mime: string
  size: number
  expires_at: Date
  created_at: Date
}

export interface Order {
  id: number
  user_id: number
  stripe_session_id: string
  paid: boolean
  amount: number
  currency: string
  created_at: Date
}

export interface Job {
  id: number
  user_id: number
  upload_id: number
  order_id: number
  style: string
  model: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error: string | null
  output_key: string | null
  created_at: Date
  updated_at: Date
}

// Helper to hash IP addresses for GDPR compliance
export function hashIP(ip: string): string {
  // Simple hash using Web Crypto API compatible approach
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}
