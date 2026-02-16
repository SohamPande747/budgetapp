import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transactionSchema } from '@/lib/validations/transaction'

/* ----------------------------
   GET - List transactions
---------------------------- */export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories!inner (
        id,
        name,
        type
      )
    `, { count: 'exact' })
    .order('transaction_date', { ascending: false })
    .range(from, to)

  // Month filter
  if (month && year) {
    const startDate = `${year}-${month}-01`
    const endDate = new Date(Number(year), Number(month), 0)
      .toISOString()
      .split('T')[0]

    query = query
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
  }

  // Type filter (correct way)
  if (type) {
    query = query.eq('categories.type', type)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count
    }
  })
}

/* ----------------------------
   POST - Create transaction
---------------------------- */
export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await req.json()

  const parsed = transactionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // ✅ ADD THIS HERE
  const {
    category_id,
    account_id,
    amount,
    description,
    transaction_date
  } = parsed.data

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      category_id,
      account_id,   
      amount,
      description,
      transaction_date
    })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

/* ----------------------------
   DELETE - Remove transaction
---------------------------- */
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { error: 'Transaction ID required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}