import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const monthParam = searchParams.get('month')
  const yearParam = searchParams.get('year')

  const now = new Date()
  const month = monthParam ? Number(monthParam) : now.getMonth() + 1
  const year = yearParam ? Number(yearParam) : now.getFullYear()

  // 🔥 Build proper date range
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0)
    .toISOString()
    .split('T')[0]

  // 1️⃣ Get expense totals per category
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      amount,
      category_id,
      categories (
        id,
        name,
        type
      )
    `)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)

  if (txError) {
    return NextResponse.json(
      { error: txError.message },
      { status: 400 }
    )
  }

  // Only expense categories
  const expenseTx =
    transactions?.filter(
      (t) => t.categories && t.categories[0]?.type === 'expense'
    ) || []

  const spentMap: Record<string, number> = {}

  for (const tx of expenseTx) {
    const catId = tx.category_id
    spentMap[catId] =
      (spentMap[catId] || 0) + Number(tx.amount)
  }

  // 2️⃣ Get budgets for this month
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('month', month)
    .eq('year', year)

  if (budgetError) {
    return NextResponse.json(
      { error: budgetError.message },
      { status: 400 }
    )
  }

  const result =
    budgets?.map((b) => {
      const spent = spentMap[b.category_id] || 0
      const remaining = Number(b.limit_amount) - spent

      return {
        category: b.categories?.[0]?.name,
        limit: Number(b.limit_amount),
        spent,
        remaining
      }
    }) || []

  return NextResponse.json(result)
}