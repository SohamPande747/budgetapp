'use client'

import { useEffect, useState } from 'react'
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
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  theme,
  toggleTheme,
}: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  /* ================= TRACK SCREEN SIZE ================= */

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth <= 900
      setIsMobile(mobile)

      // Reset mobile drawer if entering desktop
      if (!mobile) {
        setIsMobileOpen(false)
      }
    }

    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [setIsMobileOpen])

  /* ================= TOGGLE LOGIC ================= */

  const handleToggle = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          ${styles.sidebar}
          ${collapsed && !isMobile ? styles.collapsed : ''}
          ${isMobileOpen && isMobile ? styles.mobileOpen : ''}
        `}
      >
        <div>
          <div className={styles.sidebarHeader}>
            {(!collapsed || isMobile) && (
              <h2 className={styles.logo}>Spendle</h2>
            )}

            <button
              onClick={handleToggle}
              className={styles.collapseBtn}
            >
              {isMobile ? (
                isMobileOpen ? <X size={18} /> : <Menu size={18} />
              ) : collapsed ? (
                <Menu size={18} />
              ) : (
                <X size={18} />
              )}
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
                  onClick={handleNavClick}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ''
                  }`}
                >
                  <Icon size={18} />
                  {(!collapsed || isMobile) && (
                    <span>{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          {(!collapsed || isMobile) && (
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

          <LogoutButton collapsed={collapsed && !isMobile} />
        </div>
      </aside>
    </>
  )
}