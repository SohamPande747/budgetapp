import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = searchParams.get('month')
  const year = searchParams.get('year')

  if (!month || !year) {
    return NextResponse.json(
      { error: 'Month and year required' },
      { status: 400 }
    )
  }

  const startDate = `${year}-${month}-01`
  const endDate = `${year}-${month}-31`

  // Fetch transactions joined with categories
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories (
        type,
        name
      )
    `)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  let totalIncome = 0
  let totalExpense = 0
  const expenseBreakdown: Record<string, number> = {}

  data?.forEach((tx: any) => {
    const type = tx.categories?.type
    const name = tx.categories?.name
    const amount = Number(tx.amount)

    if (type === 'income') {
      totalIncome += amount
    }

    if (type === 'expense') {
      totalExpense += amount
      expenseBreakdown[name] =
        (expenseBreakdown[name] || 0) + amount
    }
  })

  return NextResponse.json({
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    expenseBreakdown
  })
}