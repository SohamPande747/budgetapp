import { z } from 'zod'

/* =====================================================
   Base Transaction Schema
   (Shared fields for create & update)
===================================================== */
const baseTransactionSchema = z.object({
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

/* =====================================================
   Create Transaction (POST)
===================================================== */
export const createTransactionSchema = baseTransactionSchema

export type CreateTransactionInput =
  z.infer<typeof createTransactionSchema>

/* =====================================================
   Update Transaction (PUT)
   Requires transaction ID
===================================================== */
export const updateTransactionSchema = baseTransactionSchema.extend({
  id: z.string().uuid({
    message: 'Invalid transaction ID'
  })
})

export type UpdateTransactionInput =
  z.infer<typeof updateTransactionSchema>