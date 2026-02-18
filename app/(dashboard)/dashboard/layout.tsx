'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LougoutButton'
import styles from './layout.module.css'
import {
  LayoutDashboard,
  BanknoteArrowUp,
  Banknote,
  HandCoins,
  Landmark,
  DatabaseZap,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Transaction', href: '/dashboard/add-transaction', icon: BanknoteArrowUp },
  { label: 'Transactions', href: '/dashboard/transactions', icon: Banknote },
  { label: 'Budgets', href: '/dashboard/budgets', icon: HandCoins },
  { label: 'Accounts', href: '/dashboard/accounts', icon: Landmark },
  { label: 'Categories', href: '/dashboard/categories', icon: DatabaseZap },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initial =
      stored ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')

    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <div className={styles.wrapper}>
      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''
          }`}
      >
        <div className={styles.sidebarTop}>
          {/* HEADER */}
          <div className={styles.sidebarHeader}>
            {!collapsed && (
              <h2 className={styles.logo}>Spendle</h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={styles.collapseBtn}
            >
              {collapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
          </div>

          {/* NAV */}
          <nav className={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/dashboard'
                  ? pathname === item.href
                  : pathname === item.href ||
                  pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''
                    }`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* BOTTOM */}
        <div className={styles.sidebarBottom}>
          <div className={styles.themeRow}>
            {!collapsed && <span>Dark Mode</span>}

            <button
              onClick={toggleTheme}
              className={`${styles.toggle} ${theme === 'dark' ? styles.toggleActive : ''
                }`}
              aria-label="Toggle Theme"
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>

          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      {/* MAIN */}
      <main
        className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''
          }`}
      >
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}