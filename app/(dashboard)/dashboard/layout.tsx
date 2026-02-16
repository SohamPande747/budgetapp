'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from './LougoutButton'
import styles from './layout.module.css'
import {
  Banknote,
  BanknoteArrowUp,
  DatabaseZap,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${
          collapsed ? styles.collapsed : ''
        }`}
      >
        <div>
          <div className={styles.topBar}>
            {/* Logo only when expanded */}
            {!collapsed && (
              <h2 className={styles.logo}>Spendle</h2>
            )}

            {/* Toggle Button */}
            <button
              className={`${styles.hamburger} ${
                collapsed ? styles.centered : styles.corner
              }`}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <Menu size={22} /> : <X size={18} />}
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard">
              {collapsed ? <LayoutDashboard size={22} /> : 'Dashboard'}
            </Link>

            <Link href="/dashboard/transactions">
              {collapsed ? <Banknote size={22} /> : 'Transactions'}
            </Link>

            <Link href="/dashboard/add-transaction">
              {collapsed ? <BanknoteArrowUp size={22} /> : 'Add Transaction'}
            </Link>

            <Link href="/dashboard/categories">
              {collapsed ? <DatabaseZap size={22} /> : 'Categories'}
            </Link>

            <Link href="/dashboard/budgets">
              {collapsed ? <HandCoins size={22} /> : 'Budgets'}
            </Link>

            <Link href="/dashboard/accounts">
              {collapsed ? <Landmark size={22} /> : 'Accounts'}
            </Link>
          </nav>
        </div>

        <div className={styles.logoutForm}>
          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}