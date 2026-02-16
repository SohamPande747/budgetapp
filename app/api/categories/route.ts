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
    .select('*')
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
  const { name, type } = body

  if (!name || !type) {
    return NextResponse.json(
      { error: 'Name and type required' },
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
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

/* ---------------------------
   DELETE - Remove Category
---------------------------- */

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // 🔥 Check if transactions exist for this category
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) {
    return NextResponse.json(
      { error: countError.message },
      { status: 400 }
    )
  }

  if (count && count > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category with existing transactions' },
      { status: 400 }
    )
  }

  // 🔥 Safe to delete
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}