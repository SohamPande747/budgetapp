import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LougoutButton'
import styles from './layout.module.css'

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
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div>
          <h2 className={styles.logo}>Spendle</h2>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/transactions">Transactions</Link>
            <Link href="/dashboard/add-transaction">Add Transaction</Link>
            <Link href="/dashboard/categories">Categories</Link>
            <Link href="/dashboard/budgets">Budgets</Link>
            <Link href="/dashboard/accounts">Accounts</Link>
          </nav>
        </div>

        <div className={styles.logoutForm}>
          <LogoutButton />
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}