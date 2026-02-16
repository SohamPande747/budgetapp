import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { budgetSchema } from '@/lib/validations/budgets'

/* ----------------------------
   GET - Fetch budgets
---------------------------- */
export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const {
    data: { user }
  } = await supabase.auth.getUser()

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

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        id,
        name,
        type
      )
    `)
    .eq('month', Number(month))
    .eq('year', Number(year))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

/* ----------------------------
   POST - Set or update budget
---------------------------- */
export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = budgetSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { category_id, month, year, limit_amount } = parsed.data

  const { error } = await supabase
    .from('budgets')
    .upsert({
      user_id: user.id,
      category_id,
      month,
      year,
      limit_amount
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}