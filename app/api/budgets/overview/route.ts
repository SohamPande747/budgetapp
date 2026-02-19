import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()

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

  if (!month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'Invalid month' },
      { status: 400 }
    )
  }

  if (!year || year < 2000) {
    return NextResponse.json(
      { error: 'Invalid year' },
      { status: 400 }
    )
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0)
    .toISOString()
    .split('T')[0]

  // 1️⃣ Fetch transactions (only expense ones matter)
  const { data: transactions, error: txError } =
    await supabase
      .from('transactions')
      .select(`
        amount,
        category_id,
        categories ( type )
      `)
      .eq('user_id', user.id)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

  if (txError) {
    return NextResponse.json(
      { error: txError.message },
      { status: 400 }
    )
  }

  const spentMap: Record<string, number> = {}

  transactions?.forEach((t: any) => {
    if (t.categories?.type === 'expense') {
      spentMap[t.category_id] =
        (spentMap[t.category_id] || 0) + Number(t.amount)
    }
  })

  // 2️⃣ Fetch budgets for month
  const { data: budgets, error: budgetError } =
    await supabase
      .from('budgets')
      .select(`
        limit_amount,
        category_id,
        categories ( name )
      `)
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)

  if (budgetError) {
    return NextResponse.json(
      { error: budgetError.message },
      { status: 400 }
    )
  }

  const result =
    budgets?.map((b: any) => {
      const spent = spentMap[b.category_id] || 0
      const remaining = Number(b.limit_amount) - spent

      return {
        category: b.categories?.name || 'Unknown',
        limit: Number(b.limit_amount),
        spent,
        remaining
      }
    }) || []

  return NextResponse.json(result)
}