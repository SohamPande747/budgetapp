import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0)
    .toISOString()
    .split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories (
        type
      )
    `)
    .eq('user_id', user.id)   // ✅ CRITICAL FIX
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  let totalIncome = 0
  let totalExpense = 0

  data?.forEach((t: any) => {
    const type = t.categories?.type  // simpler access
    if (type === 'income') {
      totalIncome += Number(t.amount)
    } else if (type === 'expense') {
      totalExpense += Number(t.amount)
    }
  })

  const netSavings = totalIncome - totalExpense

  const savingsRate =
    totalIncome > 0
      ? Number(((netSavings / totalIncome) * 100).toFixed(2))
      : 0

  return NextResponse.json({
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate
  })
}