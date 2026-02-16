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
      <h1>Dashboard</h1>

      {/* Month Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', {
                month: 'long'
              })}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ marginLeft: '1rem', width: '100px' }}
        />
      </div>

      {/* Financial Summary */}
      {summary && (
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <h3>Total Income</h3>
            <p>₹{summary.totalIncome}</p>
          </div>

          <div>
            <h3>Total Expense</h3>
            <p>₹{summary.totalExpense}</p>
          </div>

          <div>
            <h3>Net Savings</h3>
            <p
              style={{
                color:
                  summary.netSavings >= 0 ? 'green' : 'red'
              }}
            >
              ₹{summary.netSavings}
            </p>
          </div>

          <div>
            <h3>Savings Rate</h3>
            <p>{summary.savingsRate}%</p>
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <h2>Budget Overview</h2>

      {budgets.length === 0 && <p>No budgets set.</p>}

      {budgets.map((b) => {
        const percentage =
          b.limit > 0
            ? Math.min((b.spent / b.limit) * 100, 100)
            : 0

        const isOver = b.remaining < 0

        return (
          <div
            key={b.category}
            style={{
              marginBottom: '1.5rem',
              border: '1px solid #ddd',
              padding: '1rem',
              borderRadius: '8px'
            }}
          >
            <strong>{b.category}</strong>

            <div
              style={{
                height: '12px',
                background: '#eee',
                borderRadius: '6px',
                marginTop: '8px'
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: isOver ? 'red' : 'green',
                  borderRadius: '6px'
                }}
              />
            </div>

            <p style={{ marginTop: '6px' }}>
              ₹{b.spent} / ₹{b.limit}
            </p>

            {isOver && (
              <p style={{ color: 'red' }}>
                Over budget by ₹
                {Math.abs(b.remaining)}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}