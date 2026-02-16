import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* =========================
   GET - Fetch Accounts
========================= */
export async function GET() {
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

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

/* =========================
   POST - Create Account
========================= */
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
  const { name } = body

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: 'Account name is required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('accounts')
    .insert([
      {
        name: name.trim(),
        user_id: user.id
      }
    ])
    .select()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data[0], { status: 201 })
}

/* =========================
   DELETE - Delete Account
========================= */
/* =========================
   DELETE - Delete Account
========================= */
export async function DELETE(req: Request) {
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

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Account ID required' },
      { status: 400 }
    )
  }

  // ✅ Verify ownership
  const { data: account, error: fetchError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    )
  }

  // ✅ Prevent deleting primary account
  const { data: allAccounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (allAccounts && allAccounts.length > 0) {
    const primaryAccount = allAccounts[0]

    if (primaryAccount.id === id) {
      return NextResponse.json(
        { error: 'Primary account cannot be deleted' },
        { status: 400 }
      )
    }
  }

  // ✅ Check if transactions exist BEFORE deleting
  const { count, error: txError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', id)

  if (txError) {
    return NextResponse.json(
      { error: 'Failed to verify transactions' },
      { status: 500 }
    )
  }

  if (count && count > 0) {
    return NextResponse.json(
      { error: 'Cannot delete account because transactions exist' },
      { status: 409 }
    )
  }

  // ✅ Safe to delete
  const { error: deleteError } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { success: true },
    { status: 200 }
  )
}