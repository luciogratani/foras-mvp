import { z } from 'zod'

export const NewsSlideCreateSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  body: z.string().trim().min(1).nullable().optional(),
  image_url: z.string().url('URL immagine non valido').nullable().optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})

export const NewsSlideUpdateSchema = NewsSlideCreateSchema.partial()

export type NewsSlideCreate = z.infer<typeof NewsSlideCreateSchema>
export type NewsSlideUpdate = z.infer<typeof NewsSlideUpdateSchema>
