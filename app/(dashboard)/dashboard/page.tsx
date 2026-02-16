'use client'

import { useEffect, useState } from 'react'
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
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const [budgets, setBudgets] = useState<BudgetOverview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [accounts, setAccounts] = useState<AccountSummary[]>([])

  // ✅ Currency Formatter (Indian format, 2 decimals)
  function formatAmount(value: number) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // =============================
  // Fetch Budgets
  // =============================
  async function fetchBudgets() {
    try {
      const res = await fetch(
        `/api/budgets/overview?month=${month}&year=${year}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to fetch budgets')
      const data = await res.json()
      setBudgets(data || [])
    } catch (err) {
      console.error(err)
      setBudgets([])
    }
  }

  // =============================
  // Fetch Global Summary
  // =============================
  async function fetchSummary() {
    try {
      const res = await fetch(
        `/api/summary?month=${month}&year=${year}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to fetch summary')
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      console.error(err)
      setSummary(null)
    }
  }

  // =============================
  // Fetch Account Summary
  // =============================
  async function fetchAccountSummary() {
    try {
      const res = await fetch(
        `/api/accounts/summary?month=${month}&year=${year}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to fetch accounts')
      const data = await res.json()
      setAccounts(data || [])
    } catch (err) {
      console.error(err)
      setAccounts([])
    }
  }

  useEffect(() => {
    fetchBudgets()
    fetchSummary()
    fetchAccountSummary()
  }, [month, year])

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* ============================= */}
      {/* FILTER BAR */}
      {/* ============================= */}
      <div className={styles.filterWrapper}>
        <div className={styles.filterLeft}>
          <span className={styles.filterLabel}>Month</span>

          <select
            className={styles.filterSelect}
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
            className={styles.filterInput}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {/* ============================= */}
      {/* 🔹 OVERALL OVERVIEW */}
      {/* ============================= */}
      <h2 className={styles.sectionTitle}>Overall Overview</h2>

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Total Income</h3>
            <p className={`${styles.summaryValue} ${styles.income}`}>
              ₹{formatAmount(summary.totalIncome)}
            </p>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Total Expense</h3>
            <p className={`${styles.summaryValue} ${styles.expense}`}>
              ₹{formatAmount(summary.totalExpense)}
            </p>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Current Balance</h3>
            <p
              className={`${styles.summaryValue} ${
                summary.netSavings >= 0
                  ? styles.positive
                  : styles.negative
              }`}
            >
              ₹{formatAmount(summary.netSavings)}
            </p>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Savings Rate</h3>
            <p className={styles.summaryValue}>
              {summary.savingsRate.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* ============================= */}
      {/* 🔹 ACCOUNT OVERVIEW */}
      {/* ============================= */}
      <h2 className={styles.sectionTitle}>Account Overview</h2>

      {accounts.length === 0 && (
        <div className={`${styles.card} ${styles.emptyCard}`}>
          <p>No accounts found.</p>
        </div>
      )}

      <div className={styles.accountGrid}>
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`${styles.card} ${styles.accountCard}`}
          >
            <div className={styles.accountHeader}>
              {acc.name}
            </div>

            <div className={styles.accountStats}>
              <div>
                <span>Income</span>
                <p className={styles.income}>
                  ₹{formatAmount(acc.totalIncome)}
                </p>
              </div>

              <div>
                <span>Expense</span>
                <p className={styles.expense}>
                  ₹{formatAmount(acc.totalExpense)}
                </p>
              </div>
            </div>

            <div
              className={`${styles.accountBalance} ${
                acc.balance >= 0
                  ? styles.positive
                  : styles.negative
              }`}
            >
              Balance: ₹{formatAmount(acc.balance)}
            </div>
          </div>
        ))}
      </div>

      {/* ============================= */}
      {/* 🔹 BUDGET OVERVIEW */}
      {/* ============================= */}
      <h2 className={styles.sectionTitle}>Budget Overview</h2>

      {budgets.length === 0 && (
        <div className={`${styles.card} ${styles.emptyCard}`}>
          <p>No budgets set.</p>
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
                className={`${styles.progressFill} ${
                  isOver
                    ? styles.progressOver
                    : styles.progressSafe
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className={styles.budgetInfo}>
              ₹{formatAmount(b.spent)} / ₹{formatAmount(b.limit)}
            </div>

            {isOver && (
              <div className={styles.overText}>
                Over budget by ₹{formatAmount(Math.abs(b.remaining))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}