import { z } from 'zod'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = (typeof DAYS)[number]

const OpeningHoursDaySchema = z.object({
  open: z.string().nullable(),
  close: z.string().nullable(),
  closed: z.boolean(),
})

export const OpeningHoursSchema = z.object(
  Object.fromEntries(DAYS.map((d) => [d, OpeningHoursDaySchema])) as Record<Day, typeof OpeningHoursDaySchema>
)
export type OpeningHours = z.infer<typeof OpeningHoursSchema>

export const TimeSlotCreateSchema = z.object({
  label: z.string().min(1, 'Il nome è obbligatorio'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  max_covers: z.coerce.number().int().positive('Deve essere almeno 1'),
  is_active: z.boolean().optional(),
})
export const TimeSlotUpdateSchema = TimeSlotCreateSchema.partial()
export type TimeSlotCreate = z.infer<typeof TimeSlotCreateSchema>
export type TimeSlotUpdate = z.infer<typeof TimeSlotUpdateSchema>

export const SiteSettingsUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  og_image: z.string().url('URL non valido').nullable().optional(),
  slogan: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Email non valida').nullable().optional(),
  opening_hours: OpeningHoursSchema.optional(),
})
export type SiteSettingsUpdate = z.infer<typeof SiteSettingsUpdateSchema>
