'use client'

import { useEffect, useState } from 'react'

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
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Filter Bar */}
      <div className="filter-wrapper">
        <div className="filter-left">
          <span className="filter-label">Month</span>

          <select
            className="filter-select"
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
            className="filter-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="card summary-card">
            <h3>Total Income</h3>
            <p style={{ color: '#10b981' }}>
              ₹{summary.totalIncome}
            </p>
          </div>

          <div className="card summary-card">
            <h3>Total Expense</h3>
            <p style={{ color: '#ef4444' }}>
              ₹{summary.totalExpense}
            </p>
          </div>

          <div className="card summary-card">
            <h3>Net Savings</h3>
            <p
              style={{
                color:
                  summary.netSavings >= 0
                    ? '#10b981'
                    : '#ef4444'
              }}
            >
              ₹{summary.netSavings}
            </p>
          </div>

          <div className="card summary-card">
            <h3>Savings Rate</h3>
            <p>{summary.savingsRate}%</p>
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <h2 className="page-title" style={{ fontSize: '20px' }}>
        Budget Overview
      </h2>

      {budgets.length === 0 && (
        <div className="card">
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
          <div key={b.category} className="card" style={{ marginBottom: '20px' }}>
            <strong>{b.category}</strong>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${percentage}%`,
                  background: isOver ? '#ef4444' : '#10b981',
                }}
              />
            </div>

            <p style={{ marginTop: '8px' }}>
              ₹{b.spent} / ₹{b.limit}
            </p>

            {isOver && (
              <p style={{ color: '#ef4444' }}>
                Over budget by ₹{Math.abs(b.remaining)}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}