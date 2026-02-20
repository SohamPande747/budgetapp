import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createTransactionSchema,
  updateTransactionSchema
} from '@/lib/validations/transaction'

/* =====================================================
   GET - List OR Single Transaction
===================================================== */
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = searchParams.get('id')

    // 🔹 Single transaction
    if (id) {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          description,
          transaction_date,
          category_id,
          account_id,
          categories (
            id,
            name,
            type
          ),
          accounts (
            id,
            name
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return NextResponse.json({ data })
    }

    // 🔹 List transactions
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
        ),
        accounts (
          id,
          name
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .range(from, to)

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const endDate = new Date(Number(year), Number(month), 0)
        .toISOString()
        .split('T')[0]

      query = query
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
    }

    if (type) {
      query = query.eq('categories.type', type)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 400 }
    )
  }
}

/* =====================================================
   POST - Create Transaction
===================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createTransactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      category_id,
      account_id,
      amount,
      description,
      transaction_date
    } = parsed.data

    // 🔒 Validate account ownership
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (!account) {
      return NextResponse.json(
        { error: 'Invalid account' },
        { status: 400 }
      )
    }

    // 🔒 Validate category ownership
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

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

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 400 }
    )
  }
}

/* =====================================================
   PUT - Update Transaction
===================================================== */
export async function PUT(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateTransactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      id,
      category_id,
      account_id,
      amount,
      description,
      transaction_date
    } = parsed.data

    // 🔒 Validate account ownership
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (!account) {
      return NextResponse.json(
        { error: 'Invalid account' },
        { status: 400 }
      )
    }

    // 🔒 Validate category ownership
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        category_id,
        account_id,
        amount,
        description,
        transaction_date
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 400 }
    )
  }
}

/* =====================================================
   DELETE - Remove Transaction
===================================================== */
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    const {
      data: { user }
    } = await supabase.auth.getUser()

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
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete transaction' },
      { status: 400 }
    )
  }
}