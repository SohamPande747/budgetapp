import { z } from 'zod'

export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  limit_amount: z.number().positive()
})

export type BudgetInput = z.infer<typeof budgetSchema>