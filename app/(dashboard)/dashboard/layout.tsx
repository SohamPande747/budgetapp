'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from './LougoutButton'
import styles from './layout.module.css'
import { Banknote, BanknoteArrowUp, DatabaseZap, HandCoins, Landmark, LayoutDashboard } from 'lucide-react';

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
            {!collapsed && (
              <h2 className={styles.logo}>Spendle</h2>
            )}

            <button
              className={styles.hamburger}
              onClick={() => setCollapsed(!collapsed)}
            >
              ☰
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard">
              {collapsed ? <LayoutDashboard /> : 'Dashboard'}
            </Link>

            <Link href="/dashboard/transactions">
              {collapsed ? <Banknote /> : 'Transactions'}
            </Link>

            <Link href="/dashboard/add-transaction">
              {collapsed ? <BanknoteArrowUp /> : 'Add Transaction'}
            </Link>

            <Link href="/dashboard/categories">
              {collapsed ? <DatabaseZap /> : 'Categories'}
            </Link>

            <Link href="/dashboard/budgets">
              {collapsed ? <HandCoins />: 'Budgets'}
            </Link>

            <Link href="/dashboard/accounts">
              {collapsed ? <Landmark /> : 'Accounts'}
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