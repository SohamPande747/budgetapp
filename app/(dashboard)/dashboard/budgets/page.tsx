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
    <div>
      <h1>Monthly Budgets</h1>

      {/* Month & Year Selector */}
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

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Budget Limit</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>
                <input
                  type="number"
                  defaultValue={getExistingBudget(cat.id)}
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
  )
}