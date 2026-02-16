import { z } from 'zod'

export const transactionSchema = z.object({
  category_id: z.string().uuid({
    message: 'Invalid category ID'
  }),

  account_id: z.string().uuid({
    message: 'Invalid account ID'
  }),

  amount: z.number().positive({
    message: 'Amount must be positive'
  }),

  description: z.string().max(255).optional(),

  transaction_date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  )
})

export type TransactionInput = z.infer<typeof transactionSchema>