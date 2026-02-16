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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.layout}>

      {/* Mobile Topbar */}
      <div className={styles.mobileTopbar}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h2 className={styles.mobileLogo}>Spendle</h2>
      </div>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.showOverlay : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          ${styles.sidebar}
          ${collapsed ? styles.collapsed : ''}
          ${mobileOpen ? styles.mobileOpen : ''}
        `}
      >
        <div>
          <div className={styles.topBar}>
            {!collapsed && (
              <h2 className={styles.logo}>Spendle</h2>
            )}

            {/* Desktop collapse toggle */}
            <button
              className={styles.hamburger}
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <Menu size={22} /> : <X size={18} />}
            </button>

            {/* Mobile close button */}
            <button
              className={styles.mobileCloseBtn}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard" aria-label="Dashboard">
              {collapsed ? <LayoutDashboard size={22} /> : 'Dashboard'}
            </Link>

            <Link href="/dashboard/add-transaction" aria-label="Add Transaction">
              {collapsed ? <BanknoteArrowUp size={22} /> : 'Add Transaction'}
            </Link>

            <Link href="/dashboard/transactions" aria-label="Transactions">
              {collapsed ? <Banknote size={22} /> : 'Transactions'}
            </Link>

            <Link href="/dashboard/budgets" aria-label="Budgets">
              {collapsed ? <HandCoins size={22} /> : 'Budgets'}
            </Link>

            <Link href="/dashboard/accounts" aria-label="Accounts">
              {collapsed ? <Landmark size={22} /> : 'Accounts'}
            </Link>

            <Link href="/dashboard/categories" aria-label="Categories">
              {collapsed ? <DatabaseZap size={22} /> : 'Categories'}
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