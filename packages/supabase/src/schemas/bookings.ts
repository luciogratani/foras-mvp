import { z } from 'zod'

export const CreateBookingInputSchema = z.object({
  time_slot_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  phone: z.string().min(3).max(40).trim().nullable().optional(),
  covers: z.number().int().min(1).max(50),
  notes: z.string().max(500).trim().nullable().optional(),
  gdpr_consent: z.literal(true),
})

export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>

export const CancelBookingTokenSchema = z.string().uuid()
