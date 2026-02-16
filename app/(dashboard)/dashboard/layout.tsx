import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Spendle</h2>

        <nav className="sidebar-nav">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/transactions">Transactions</Link>
          <Link href="/dashboard/categories">Categories</Link>
          <Link href="/dashboard/add-transaction">Add Transaction</Link>
          <Link href="/dashboard/budgets">Budgets</Link>
        </nav>

        <form action="/api/logout" method="post" className="logout-form">
          <button type="submit" className="logout-btn">
            Logout
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="main">
        {children}
      </main>
    </div>
  )
}