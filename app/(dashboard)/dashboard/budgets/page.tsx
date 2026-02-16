'use client'

import { useEffect, useState } from 'react'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

type Budget = {
  id: string
  category_id: string
  month: number
  year: number
  limit_amount: number
  categories: {
    name: string
  }[]
}

export default function BudgetsPage() {
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(
      data.filter((c: Category) => c.type === 'expense')
    )
  }

  async function fetchBudgets() {
    const res = await fetch(
      `/api/budgets?month=${month}&year=${year}`
    )
    const data = await res.json()
    setBudgets(data || [])
  }

  async function handleSave(
    category_id: string,
    value: string
  ) {
    const limit_amount = parseFloat(value)

    if (!limit_amount || limit_amount <= 0) {
      alert('Invalid amount')
      return
    }

    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id,
        month,
        year,
        limit_amount
      })
    })

    fetchBudgets()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [month, year])

  function getExistingBudget(category_id: string) {
    const found = budgets.find(
      (b) => b.category_id === category_id
    )
    return found ? found.limit_amount : ''
  }

  return (
  <div className="dashboard-container">
    <div className="page-header">
      <div>
        <h1 className="page-title">Monthly Budgets</h1>
        <p className="page-subtitle">
          Set spending limits for each expense category
        </p>
      </div>
    </div>

    {/* Month & Year Selector */}
    <div className="card filter-card">
      <div className="filter-row">
        <div className="form-field">
          <label>Month</label>
          <select
            className="form-select"
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
        </div>

        <div className="form-field year-field">
          <label>Year</label>
          <input
            className="form-input"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>
    </div>

    {/* Budget Table */}
    <div className="card table-card">
      <div className="card-header">
        <h3>Budget Limits</h3>
        <span className="muted-text">
          {categories.length} categories
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="text-right">Monthly Limit</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="table-name">{cat.name}</td>

                <td className="text-right">
                  <input
                    className="budget-input"
                    type="number"
                    defaultValue={getExistingBudget(cat.id)}
                    placeholder="0.00"
                    onBlur={(e) =>
                      handleSave(cat.id, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}