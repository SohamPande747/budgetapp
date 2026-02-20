import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  try {
    const { fullName, accountName, balance } = await req.json()

    // 1️⃣ Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2️⃣ Check onboarding state
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('is_onboarded')
      .eq('id', user.id)
      .single()

    if (profileFetchError) {
      return NextResponse.json(
        { error: profileFetchError.message },
        { status: 500 }
      )
    }

    if (profile?.is_onboarded) {
      return NextResponse.json(
        { error: 'User already onboarded' },
        { status: 400 }
      )
    }

    // 3️⃣ Create primary account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: accountName?.trim() || 'Primary Account',
      })
      .select()
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: accountError?.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    // 4️⃣ Ensure Opening Balance category exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Opening Balance')
      .eq('type', 'income')
      .maybeSingle()

    let openingCategoryId: string

    if (existingCategory) {
      openingCategoryId = existingCategory.id
    } else {
      const { data: newCategory, error: catError } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: 'Opening Balance',
          type: 'income',
        })
        .select()
        .single()

      if (catError || !newCategory) {
        return NextResponse.json(
          { error: catError?.message || 'Failed to create category' },
          { status: 500 }
        )
      }

      openingCategoryId = newCategory.id
    }

    // 5️⃣ Insert opening balance transaction (if > 0)
    const parsedBalance = parseFloat(balance) || 0

    if (parsedBalance > 0) {
      const today = new Date().toISOString().split('T')[0]

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: account.id,
          category_id: openingCategoryId,
          amount: parsedBalance,
          description: 'Initial balance',
          transaction_date: today,
        })

      if (txError) {
        return NextResponse.json(
          { error: txError.message },
          { status: 500 }
        )
      }
    }

    // 6️⃣ Update profile as onboarded
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName?.trim() || null,
        is_onboarded: true,
      })
      .eq('id', user.id)

    if (profileUpdateError) {
      return NextResponse.json(
        { error: profileUpdateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Onboarding error:', err)

    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}