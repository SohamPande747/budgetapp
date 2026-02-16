import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '250px',
          padding: '1rem',
          borderRight: '1px solid #ddd'
        }}
      >
        <h2>Budget App</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/transactions">Transactions</Link>
          <Link href="/dashboard/categories">Categories</Link>
          <Link href="/dashboard/add-transaction">Add Transaction</Link>
        </nav>

        <form action="/api/logout" method="post" style={{ marginTop: '2rem' }}>
          <button type="submit">Logout</button>
        </form>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}