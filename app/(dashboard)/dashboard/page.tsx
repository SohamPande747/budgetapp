'use client'

import { useEffect, useState } from 'react'
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

  const [budgets, setBudgets] = useState<BudgetOverview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [accounts, setAccounts] = useState<AccountSummary[]>([])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{greeting}</h1>
          <p>
            {new Date(year, month - 1).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className={styles.filter}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Hero Financial Block */}
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

      {/* Budgets */}
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

      {/* Actions + Accounts */}
      <div className={styles.bottom}>
        <button
          className={styles.primaryAction}
          onClick={() => router.push('/dashboard/add-transaction')}
        >
          Add Transaction
        </button>

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
        </div>
      </div>
    </div>
  )
}