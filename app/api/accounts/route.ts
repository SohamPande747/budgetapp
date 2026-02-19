import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* =========================
   GET - Fetch Accounts
========================= */
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

/* =========================
   POST - Create Account
========================= */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const name = body?.name?.trim()

  if (!name) {
    return NextResponse.json(
      { error: 'Account name is required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      name,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}

/* =========================
   PUT - Rename Account
========================= */
export async function PUT(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, name } = body

  if (!id || !name?.trim()) {
    return NextResponse.json(
      { error: 'Account ID and name required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('accounts')
    .update({ name: name.trim() })
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

/* =========================
   DELETE - Delete Account
========================= */
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Account ID required' },
      { status: 400 }
    )
  }

  // Ensure user has more than 1 account
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)

  if (!accounts || accounts.length <= 1) {
    return NextResponse.json(
      { error: 'You must have at least one account' },
      { status: 400 }
    )
  }

  // Check if transactions exist
  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', id)

  if (count && count > 0) {
    return NextResponse.json(
      { error: 'Cannot delete account with transactions' },
      { status: 409 }
    )
  }

  const { error } = await supabase
    .from('accounts')
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