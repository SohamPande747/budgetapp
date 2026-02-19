'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '../../(dashboard)/dashboard/LogoutButton'
import styles from './Sidebar.module.css'
import {
  LayoutDashboard,
  BanknoteArrowUp,
  Banknote,
  HandCoins,
  Landmark,
  DatabaseZap,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Transaction', href: '/dashboard/add-transaction', icon: BanknoteArrowUp },
  { label: 'Transactions', href: '/dashboard/transactions', icon: Banknote },
  { label: 'Budgets', href: '/dashboard/budgets', icon: HandCoins },
  { label: 'Accounts', href: '/dashboard/accounts', icon: Landmark },
  { label: 'Categories', href: '/dashboard/categories', icon: DatabaseZap },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  theme,
  toggleTheme,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarTop}>
        <div className={styles.sidebarHeader}>
          {!collapsed && <h2 className={styles.logo}>Spendle</h2>}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles.collapseBtn}
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

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
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={styles.sidebarBottom}>
        {/* ✅ Hide entire theme row when collapsed */}
        {!collapsed && (
          <div className={styles.themeRow}>
            <span>Dark Mode</span>

            <button
              onClick={toggleTheme}
              className={`${styles.toggle} ${
                theme === 'dark' ? styles.toggleActive : ''
              }`}
              aria-label="Toggle Theme"
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>
        )}

        <LogoutButton collapsed={collapsed} />
      </div>
    </aside>
  )
}