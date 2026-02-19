'use client'

import { useState, useEffect } from 'react'
import styles from './layout.module.css'
import Sidebar from '../../components/ui/Sidebar'

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
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

    // ✅ Correct dark activation
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)

    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main
        className={`${styles.main} ${
          collapsed ? styles.mainCollapsed : ''
        }`}
      >
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}