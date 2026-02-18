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
  totalIncome: number
  totalExpense: number
  balance: number
}

export default function DashboardPage() {
  const router = useRouter()
  const now = new Date()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning')
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good Afternoon')
    } else if (hour >= 18 && hour < 24) {
      setGreeting('Good Evening')
    } else {
      setGreeting('Welcome Back')
    }
  }, [])
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const [budgets, setBudgets] = useState<BudgetOverview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [accounts, setAccounts] = useState<AccountSummary[]>([])

  function formatAmount(value: number) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  async function fetchBudgets() {
    try {
      const res = await fetch(
        `/api/budgets/overview?month=${month}&year=${year}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error()
      setBudgets(await res.json())
    } catch {
      setBudgets([])
    }
  }

  async function fetchSummary() {
    try {
      const res = await fetch(
        `/api/summary?month=${month}&year=${year}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error()
      setSummary(await res.json())
    } catch {
      setSummary(null)
    }
  }

  async function fetchAccountSummary() {
    try {
      const res = await fetch(
        `/api/accounts/summary?month=${month}&year=${year}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error()
      setAccounts(await res.json())
    } catch {
      setAccounts([])
    }
  }

  useEffect(() => {
    fetchBudgets()
    fetchSummary()
    fetchAccountSummary()
  }, [month, year])

  const overBudgetCount = budgets.filter(b => b.remaining < 0).length

  return (
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            {greeting} 👋
          </h1>
          <p className={styles.subGreeting}>
            Here’s your financial snapshot for{' '}
            {new Date(year, month - 1).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className={styles.filterBar}>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', {
                  month: 'long',
                })}
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

      {/* ================= ALERTS ================= */}
      {overBudgetCount > 0 && (
        <div className={styles.alertBanner}>
          ⚠ You are over budget in {overBudgetCount} category
          {overBudgetCount > 1 && 'ies'}.
        </div>
      )}

      {/* ================= MAIN GRID ================= */}
      <div className={styles.dashboardGrid}>
        {/* ========= LEFT MAIN COLUMN ========= */}
        <div className={styles.mainColumn}>
          {/* KPI CARDS */}
          {summary && (
            <div className={styles.kpiGrid}>
              <div className={`${styles.card} ${styles.kpiCard}`}>
                <span className={styles.kpiLabel}>Total Income</span>
                <h2 className={styles.income}>
                  ₹{formatAmount(summary.totalIncome)}
                </h2>
              </div>

              <div className={`${styles.card} ${styles.kpiCard}`}>
                <span className={styles.kpiLabel}>Total Expense</span>
                <h2 className={styles.expense}>
                  ₹{formatAmount(summary.totalExpense)}
                </h2>
              </div>

              <div className={`${styles.card} ${styles.kpiCard}`}>
                <span className={styles.kpiLabel}>Net Balance</span>
                <h2
                  className={
                    summary.netSavings >= 0
                      ? styles.positive
                      : styles.negative
                  }
                >
                  ₹{formatAmount(summary.netSavings)}
                </h2>
              </div>

              <div className={`${styles.card} ${styles.kpiCard}`}>
                <span className={styles.kpiLabel}>Savings Rate</span>
                <h2>{summary.savingsRate.toFixed(2)}%</h2>
              </div>
            </div>
          )}

          {/* BUDGET SECTION */}
          <h2 className={styles.sectionTitle}>Budget Overview</h2>

          {budgets.length === 0 && (
            <div className={`${styles.card} ${styles.emptyCard}`}>
              No budgets set.
            </div>
          )}

          {budgets.map((b) => {
            const percentage =
              b.limit > 0
                ? Math.min((b.spent / b.limit) * 100, 100)
                : 0

            const isOver = b.remaining < 0

            return (
              <div
                key={b.category}
                className={`${styles.card} ${styles.budgetCard}`}
              >
                <div className={styles.budgetHeader}>
                  {b.category}
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${isOver
                      ? styles.progressOver
                      : styles.progressSafe
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className={styles.budgetInfo}>
                  ₹{formatAmount(b.spent)} / ₹
                  {formatAmount(b.limit)}
                </div>

                {isOver && (
                  <div className={styles.overText}>
                    Over by ₹
                    {formatAmount(Math.abs(b.remaining))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ========= RIGHT SIDEBAR ========= */}
        <div className={styles.sideColumn}>
          {/* QUICK ACTIONS */}
          {/* QUICK ACTIONS */}
          <div className={`${styles.card} ${styles.quickActions}`}>
            <h3>Quick Actions</h3>

            <button
              className={styles.primaryBtn}
              onClick={() => router.push('/dashboard/add-transaction')}
            >
              + Add Transaction
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => router.push('/dashboard/budgets')}
            >
              + Create Budget
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => router.push('/dashboard/accounts')}
            >
              + Add Account
            </button>
          </div>

          {/* ACCOUNTS */}
          <div className={`${styles.card}`}>
            <h3>Accounts</h3>

            {accounts.length === 0 && (
              <p>No accounts found.</p>
            )}

            {accounts.map((acc) => (
              <div
                key={acc.id}
                className={styles.accountItem}
              >
                <div className={styles.accountName}>
                  {acc.name}
                </div>
                <div
                  className={
                    acc.balance >= 0
                      ? styles.positive
                      : styles.negative
                  }
                >
                  ₹{formatAmount(acc.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}