'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import styles from './page.module.css'

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
}

export default function BudgetsPage() {
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.filter((c: Category) => c.type === 'expense'))
  }

  async function fetchBudgets() {
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
    const data = await res.json()
    setBudgets(data || [])

    const inputMap: Record<string, string> = {}
    data?.forEach((b: Budget) => {
      inputMap[b.category_id] = b.limit_amount.toString()
    })
    setBudgetInputs(inputMap)
  }

  function getExistingBudget(category_id: string) {
    const found = budgets.find(
      (b) => b.category_id === category_id
    )
    return found ? found.limit_amount.toString() : ''
  }

  async function handleSave(category_id: string) {
    const value = budgetInputs[category_id]
    const limit_amount = parseFloat(value)

    if (!limit_amount || limit_amount <= 0) {
      toast.error('Enter a valid amount greater than 0')
      return
    }

    // Prevent save if unchanged
    if (value === getExistingBudget(category_id)) {
      toast('No changes detected')
      return
    }

    setSavingId(category_id)

    const savePromise = fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id,
        month,
        year,
        limit_amount
      })
    })

    toast.promise(savePromise, {
      loading: 'Saving budget...',
      success: 'Budget updated successfully',
      error: 'Failed to save budget'
    })

    const res = await savePromise
    setSavingId(null)

    if (res.ok) {
      fetchBudgets()
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [month, year])

  return (
    <div className={styles.container}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Budgets</h1>
          <p className="page-subtitle">
            Set spending limits for each expense category
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className={`card ${styles.filterCard}`}>
  <div className={styles.periodBar}>
    
    <button
      className={styles.navBtn}
      onClick={() => {
        if (month === 1) {
          setMonth(12)
          setYear((prev) => prev - 1)
        } else {
          setMonth((prev) => prev - 1)
        }
      }}
    >
      ←
    </button>

    <select
      className={styles.periodSelect}
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

    <select
      className={styles.periodSelect}
      value={year}
      onChange={(e) => setYear(Number(e.target.value))}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const y = new Date().getFullYear() - 2 + i
        return (
          <option key={y} value={y}>
            {y}
          </option>
        )
      })}
    </select>

    <button
      className={styles.navBtn}
      onClick={() => {
        if (month === 12) {
          setMonth(1)
          setYear((prev) => prev + 1)
        } else {
          setMonth((prev) => prev + 1)
        }
      }}
    >
      →
    </button>

  </div>
</div>
      {/* TABLE */}
      <div className={`card ${styles.listCard}`}>
        <div className={styles.listHeader}>
          <h3>Budget Limits</h3>
          <div className={styles.listMeta}>
            {categories.length} categories
          </div>
        </div>

        <div className={styles.budgetList}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.budgetRow}>
              <div className={styles.categoryName}>
                {cat.name}
              </div>

              <div className={styles.amountWrapper}>
                <span className={styles.currency}>₹</span>
                <input
                  className={styles.budgetInput}
                  type="number"
                  step="0.01"
                  value={budgetInputs[cat.id] || ''}
                  placeholder="0.00"
                  onChange={(e) =>
                    setBudgetInputs({
                      ...budgetInputs,
                      [cat.id]: e.target.value
                    })
                  }
                />
              </div>

              <button
                className={styles.saveButton}
                onClick={() => handleSave(cat.id)}
                disabled={savingId === cat.id}
              >
                {savingId === cat.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}