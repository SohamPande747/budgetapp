import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* ---------------------------
   GET - Fetch Categories
---------------------------- */
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, type, created_at')
    .eq('user_id', user.id)
    .order('type', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

/* ---------------------------
   POST - Create Category
---------------------------- */
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const name = body?.name?.trim()
  const type = body?.type

  if (!name || !type) {
    return NextResponse.json(
      { error: 'Name and type required' },
      { status: 400 }
    )
  }

  if (!['income', 'expense'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid category type' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name,
      type
    })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

/* ---------------------------
   DELETE - Remove Category
---------------------------- */
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Category ID required' },
      { status: 400 }
    )
  }

  // 🔒 Verify ownership
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!category) {
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    )
  }

  // 🔒 Check transactions
  const { count: txCount } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('category_id', id)

  if (txCount && txCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category with existing transactions' },
      { status: 409 }
    )
  }

  // 🔒 Check budgets
  const { count: budgetCount } = await supabase
    .from('budgets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('category_id', id)

  if (budgetCount && budgetCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category with existing budgets' },
      { status: 409 }
    )
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}