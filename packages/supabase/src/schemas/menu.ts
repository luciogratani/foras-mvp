import { z } from 'zod'

export const MenuSectionCreateSchema = z.object({
  name: z.string().trim().min(1, 'Il nome è obbligatorio').max(100, 'Il nome è troppo lungo'),
})

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

export const MenuItemCreateSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1, 'Il nome è obbligatorio'),
  price: z.coerce.number().nonnegative('Il prezzo non può essere negativo'),
  description: z.string().trim().min(1).nullable().optional(),
  image_url: z.string().url('URL immagine non valido').nullable().optional(),
  allergen_ids: z.array(z.string().uuid()).default([]),
  is_active: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})

export const MenuItemUpdateSchema = MenuItemCreateSchema.partial().omit({ category_id: true })

export type MenuSectionCreate = z.infer<typeof MenuSectionCreateSchema>
export type MenuSectionUpdate = z.infer<typeof MenuSectionUpdateSchema>
export type MenuCategoryCreate = z.infer<typeof MenuCategoryCreateSchema>
export type MenuCategoryUpdate = z.infer<typeof MenuCategoryUpdateSchema>
export type MenuItemCreate = z.infer<typeof MenuItemCreateSchema>
export type MenuItemUpdate = z.infer<typeof MenuItemUpdateSchema>
