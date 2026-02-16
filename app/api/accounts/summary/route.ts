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

  // Fetch accounts
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('id, name')
    .eq('user_id', user.id)

  if (accError) {
    return NextResponse.json(
      { error: accError.message },
      { status: 400 }
    )
  }

  // Fetch transactions for month
  const { data: transactions, error: txError } =
    await supabase
      .from('transactions')
      .select(`
        amount,
        account_id,
        categories (
          type
        )
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

  const accountSummary = accounts?.map((account) => {
    const accountTransactions =
      transactions?.filter(
        (t: any) => t.account_id === account.id
      ) || []

    let totalIncome = 0
    let totalExpense = 0

    accountTransactions.forEach((t: any) => {
      const type = t.categories?.type

      if (type === 'income') totalIncome += Number(t.amount)
      if (type === 'expense') totalExpense += Number(t.amount)
    })

    return {
      id: account.id,
      name: account.name,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    }
  })

  return NextResponse.json(accountSummary)
}