import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { budgetSchema } from '@/lib/validations/budgets'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = Number(searchParams.get('month'))
  const year = Number(searchParams.get('year'))

  if (!month || !year || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'Valid month and year required' },
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
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  // Validate category ownership + type
  const { data: category } = await supabase
    .from('categories')
    .select('id, type')
    .eq('id', category_id)
    .eq('user_id', user.id)
    .single()

  if (!category) {
    return NextResponse.json(
      { error: 'Invalid category' },
      { status: 400 }
    )
  }

  if (category.type !== 'expense') {
    return NextResponse.json(
      { error: 'Budgets only allowed for expense categories' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: user.id,
        category_id,
        month,
        year,
        limit_amount
      },
      { onConflict: 'user_id,category_id,month,year' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}