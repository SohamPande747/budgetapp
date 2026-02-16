import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name required')
    .max(50, 'Category name too long'),

  type: z.enum(['income', 'expense']),
})

export type CategoryInput = z.infer<typeof categorySchema>