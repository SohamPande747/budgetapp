'use client'

import { useState, useEffect } from 'react'
import styles from './layout.module.css'
import Sidebar from '../../components/ui/Sidebar'

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [collapsed, setCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  /* ================= THEME INIT ================= */

  useEffect(() => {
    const stored = localStorage.getItem('theme') as
      | 'light'
      | 'dark'
      | null

    const initial =
      stored ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')

    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  /* ================= FIX 1: RESET ON DESKTOP ================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={styles.wrapper}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className={styles.main}>
        {/* ✅ Sticky Mobile Header */}
        <div className={styles.mobileHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileOpen(true)}
          >
            ☰
          </button>

          <span className={styles.mobileTitle}>Spendle</span>
        </div>

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}