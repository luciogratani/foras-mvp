import { z } from 'zod'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = (typeof DAYS)[number]

const OpeningHoursRangeSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
})

const OpeningHoursDaySchema = z.object({
  closed: z.boolean(),
  ranges: z.array(OpeningHoursRangeSchema).max(2),
})

export const OpeningHoursSchema = z.object(
  Object.fromEntries(DAYS.map((d) => [d, OpeningHoursDaySchema])) as Record<Day, typeof OpeningHoursDaySchema>
)
export type OpeningHours = z.infer<typeof OpeningHoursSchema>

const timeSlotBase = z.object({
  label: z.string().min(1, 'Il nome è obbligatorio'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').nullable().optional(),
  max_covers: z.coerce.number().int().positive('Deve essere almeno 1'),
  is_active: z.boolean().optional(),
})

const endTimeAfterTime = (v: { time?: string; end_time?: string | null }) =>
  v.end_time == null || v.time == null || v.end_time > v.time

export const TimeSlotCreateSchema = timeSlotBase.refine(endTimeAfterTime, {
  message: 'La fine deve essere dopo l\'inizio',
  path: ['end_time'],
})
export const TimeSlotUpdateSchema = timeSlotBase.partial().refine(endTimeAfterTime, {
  message: 'La fine deve essere dopo l\'inizio',
  path: ['end_time'],
})
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
  extra_data: z.record(z.unknown()).optional(),
  social_whatsapp: z.string().nullable().optional(),
  social_instagram: z.string().nullable().optional(),
  social_facebook: z.string().nullable().optional(),
  maintenance_mode: z.boolean().optional(),
})
export type SiteSettingsUpdate = z.infer<typeof SiteSettingsUpdateSchema>

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const ClosedDateCreateSchema = z
  .object({
    date: z.string().regex(ISO_DATE, 'Formato YYYY-MM-DD'),
    reason: z.string().nullable().optional(),
    end_date: z.string().regex(ISO_DATE, 'Formato YYYY-MM-DD').nullable().optional(),
  })
  .refine(
    (v) => v.end_date == null || v.end_date >= v.date,
    { message: 'end_date deve essere >= date', path: ['end_date'] }
  )
export type ClosedDateCreate = z.infer<typeof ClosedDateCreateSchema>
