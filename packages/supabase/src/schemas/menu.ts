import { z } from 'zod'

export const MenuSectionUpdateSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})

export const MenuCategoryCreateSchema = z.object({
  section_id: z.string().uuid(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})

export const MenuCategoryUpdateSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio').optional(),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
  section_id: z.string().uuid().optional(),
})

export type MenuSectionUpdate = z.infer<typeof MenuSectionUpdateSchema>
export type MenuCategoryCreate = z.infer<typeof MenuCategoryCreateSchema>
export type MenuCategoryUpdate = z.infer<typeof MenuCategoryUpdateSchema>
