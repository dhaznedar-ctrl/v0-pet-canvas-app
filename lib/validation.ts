import { z } from 'zod'

// ── Shared fields ──

const emailField = z.string().min(1).refine(
  (val) => val.startsWith('guest-') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  { message: 'Invalid email format' }
)

const honeypotField = z.string().max(0).optional().default('')

const turnstileField = z.string().optional().nullable()

// ── Consent ──

export const consentSchema = z.object({
  email: emailField,
  acceptedTermsA: z.boolean().refine((v) => v === true, { message: 'Must accept terms' }),
  acceptedTermsB: z.boolean().refine((v) => v === true, { message: 'Must accept terms' }),
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
})

// ── Upload (FormData — validated manually, schema for reference) ──

export const uploadSchema = z.object({
  email: emailField,
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
})

// ── Generate ──

export const generateSchema = z.object({
  email: emailField,
  style: z.string().min(1).max(100),
  uploadIds: z.array(z.number().int().positive()).min(1).max(5).optional(),
  uploadId: z.number().int().positive().optional(),
  orderId: z.number().int().positive().optional().nullable(),
  editPrompt: z.string().max(500).optional(),
  tab: z.enum(['pets', 'family', 'kids', 'couples', 'self']).optional(),
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
  fingerprint: z.string().max(100).optional(),
})

// ── Checkout Create ──

export const checkoutCreateSchema = z.object({
  email: emailField,
  style: z.string().min(1).max(100),
  productId: z.string().min(1).max(100).optional(),
  jobId: z.number().int().positive().optional(),
  name: z.string().max(100).optional(),
  surname: z.string().max(100).optional(),
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
})

// ── Credits Purchase ──

export const creditsPurchaseSchema = z.object({
  email: emailField,
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
})

// ── Credits Balance (GET — query params) ──

export const creditsBalanceSchema = z.object({
  email: emailField.optional(),
})

// ── Jobs PATCH ──

export const jobPatchSchema = z.object({
  email: emailField.optional(),
  action: z.enum(['save_for_later']),
})

// ── Print Order ──

export const printOrderSchema = z.object({
  jobId: z.number().int().positive(),
  size: z.string().min(1).max(20),
  orderId: z.number().int().positive(),
  recipient: z.object({
    name: z.string().min(1).max(200),
    address1: z.string().min(1).max(500),
    city: z.string().min(1).max(200),
    stateCode: z.string().max(100),
    countryCode: z.string().min(1).max(100),
    zip: z.string().min(1).max(20),
    email: z.string().email(),
    phone: z.string().max(30).optional(),
  }),
})

// ── Support Ticket ──

export const supportTicketSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  subject: z.enum(['Payment', 'Quality', 'Order Tracking', 'Other']),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }).max(2000),
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
})

// ── Order OTP Request ──

export const orderOtpRequestSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  _hp_name: honeypotField,
  turnstileToken: turnstileField,
})

// ── Order Lookup ──

export const orderLookupSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  code: z.string().length(6, { message: 'OTP must be 6 digits' }),
})

// ── Order Track (quick lookup without OTP) ──

export const orderTrackSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  orderId: z.number().int().positive({ message: 'Valid order ID required' }),
})

// ── Admin Auth ──

export const adminAuthSchema = z.object({
  password: z.string().min(1).max(500),
})

// ── Helper: safe parse with honeypot check ──

export type ValidationResult<T> =
  | { success: true; data: T; isBot: false }
  | { success: true; data: T; isBot: true }
  | { success: false; error: string }

export function validateWithHoneypot<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || 'Invalid input'
    return { success: false, error: firstError }
  }

  // Check honeypot
  const parsed = result.data as Record<string, unknown>
  if (parsed._hp_name && typeof parsed._hp_name === 'string' && parsed._hp_name.length > 0) {
    return { success: true, data: result.data, isBot: true }
  }

  return { success: true, data: result.data, isBot: false }
}
