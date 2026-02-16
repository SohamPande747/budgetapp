import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

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
          <Link href="/dashboard/add-transaction">Add Transaction</Link>
          <Link href="/dashboard/categories">Categories</Link>
          <Link href="/dashboard/budgets">Budgets</Link>
          <Link href="/dashboard/accounts">Accounts</Link>
        </nav>

        {/* Logout */}
        <div className="logout-form">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {children}
      </main>
    </div>
  )
}