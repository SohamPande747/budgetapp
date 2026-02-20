'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

type BudgetOverview = {
  category: string
  limit: number
  spent: number
  remaining: number
}

type Summary = {
  totalIncome: number
  totalExpense: number
  netSavings: number
  savingsRate: number
}

type AccountSummary = {
  id: string
  name: string
  balance: number
}

export default function DashboardPage() {
  const router = useRouter()
  const now = new Date()

  const [greeting, setGreeting] = useState('')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const pickerRef = useRef<HTMLDivElement>(null)

  const [budgets, setBudgets] = useState<BudgetOverview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [accounts, setAccounts] = useState<AccountSummary[]>([])

  /* Greeting */
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  /* Close picker on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setIsPickerOpen(false)
      }
    }

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPickerOpen])

  function formatAmount(value: number) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  async function fetchAll() {
    const [b, s, a] = await Promise.all([
      fetch(`/api/budgets/overview?month=${month}&year=${year}`, { cache: 'no-store' }),
      fetch(`/api/summary?month=${month}&year=${year}`, { cache: 'no-store' }),
      fetch(`/api/accounts/summary?month=${month}&year=${year}`, { cache: 'no-store' }),
    ])

    setBudgets(b.ok ? await b.json() : [])
    setSummary(s.ok ? await s.json() : null)
    setAccounts(a.ok ? await a.json() : [])
  }

  useEffect(() => {
    fetchAll()
  }, [month, year])

  const currentMonthLabel = new Date(year, month - 1).toLocaleString(
    'default',
    { month: 'long', year: 'numeric' }
  )

  return (
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div>
          <h1>{greeting}</h1>
          <p>{currentMonthLabel}</p>
        </div>

        <div className={styles.dateWrapper} ref={pickerRef}>
          <button
            className={styles.dateButton}
            onClick={() => setIsPickerOpen(!isPickerOpen)}
          >
            {currentMonthLabel}
          </button>

          {isPickerOpen && (
            <div className={styles.popover}>
              <div className={styles.yearNav}>
                <button onClick={() => setYear((prev) => prev - 1)}>‹</button>
                <span>{year}</span>
                <button onClick={() => setYear((prev) => prev + 1)}>›</button>
              </div>

              <div className={styles.monthGrid}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.monthCell} ${month === i + 1 ? styles.monthActive : ''
                      }`}
                    onClick={() => {
                      setMonth(i + 1)
                      setIsPickerOpen(false)
                    }}
                  >
                    {new Date(0, i).toLocaleString('default', {
                      month: 'short',
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ================= END HEADER ================= */}

      {/* ================= HERO ================= */}
      {summary && (
        <div className={styles.hero}>
          <div className={styles.heroPrimary}>
            <span>Net Balance</span>
            <h2 className={summary.netSavings >= 0 ? styles.positive : styles.negative}>
              ₹{formatAmount(summary.netSavings)}
            </h2>
          </div>

          <div className={styles.heroSecondary}>
            <div>
              <span>Income</span>
              <p>₹{formatAmount(summary.totalIncome)}</p>
            </div>

            <div>
              <span>Expense</span>
              <p>₹{formatAmount(summary.totalExpense)}</p>
            </div>

            <div>
              <span>Savings</span>
              <p>{summary.savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= BUDGETS ================= */}
      <div className={styles.section}>
        <h3>Budget Overview</h3>

        {budgets.length === 0 && (
          <p className={styles.muted}>No budgets configured.</p>
        )}

        {budgets.map((b) => {
          const percentage =
            b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0

          return (
            <div key={b.category} className={styles.budgetRow}>
              <div className={styles.budgetHeader}>
                <span>{b.category}</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>

              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ================= BOTTOM ================= */}
      {/* ================= BOTTOM ================= */}
      <div className={styles.bottom}>
        <div className={styles.accounts}>
          <h3>Accounts</h3>

          {accounts.map((acc) => (
            <div key={acc.id} className={styles.accountRow}>
              <span>{acc.name}</span>
              <span className={acc.balance >= 0 ? styles.positive : styles.negative}>
                ₹{formatAmount(acc.balance)}
              </span>
            </div>
          ))}

          {/* Quick Actions */}

        </div>

      </div>
      <div className={styles.quickActions}>
        <p className={styles.quickLabel}>Quick Actions</p>

        <div className={styles.quickGrid}>
          <button
            className={styles.quickBtn}
            onClick={() => router.push('/dashboard/add-transaction')}
          >
            Add Transaction
          </button>

          <button
            className={styles.quickBtn}
            onClick={() => router.push('/dashboard/accounts')}
          >
            Manage Accounts
          </button>

          <button
            className={styles.quickBtn}
            onClick={() => router.push('/dashboard/budgets')}
          >
            Edit Budgets
          </button>
        </div>
      </div>
    </div>
  )
}