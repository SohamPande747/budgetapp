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

export default function DashboardPage() {
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState<BudgetOverview[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  async function fetchBudgets() {
    const res = await fetch(
      `/api/budgets/overview?month=${month}&year=${year}`
    )
    const data = await res.json()
    setBudgets(data || [])
  }

  async function fetchSummary() {
    const res = await fetch(
      `/api/summary?month=${month}&year=${year}`
    )
    const data = await res.json()
    setSummary(data)
  }

  useEffect(() => {
    fetchBudgets()
    fetchSummary()
  }, [month, year])

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* Filter Bar */}
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

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryGrid}>
          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Total Income</h3>
            <p className={`${styles.summaryValue} ${styles.income}`}>
              ₹{summary.totalIncome}
            </p>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Total Expense</h3>
            <p className={`${styles.summaryValue} ${styles.expense}`}>
              ₹{summary.totalExpense}
            </p>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Net Savings</h3>
            <p
              className={`${styles.summaryValue} ${
                summary.netSavings >= 0
                  ? styles.positive
                  : styles.negative
              }`}
            >
              ₹{summary.netSavings}
            </p>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h3>Savings Rate</h3>
            <p className={styles.summaryValue}>
              {summary.savingsRate}%
            </p>
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <h2 className={styles.sectionTitle}>
        Budget Overview
      </h2>

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
              ₹{b.spent} / ₹{b.limit}
            </div>

            {isOver && (
              <div className={styles.overText}>
                Over budget by ₹{Math.abs(b.remaining)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}