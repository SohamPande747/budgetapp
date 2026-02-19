'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const pickerRef = useRef<HTMLDivElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const currentMonthLabel = new Date(year, month - 1).toLocaleString(
    'default',
    { month: 'long', year: 'numeric' }
  )

  /* ================= FETCHING ================= */

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.filter((c: Category) => c.type === 'expense'))
  }

  async function fetchBudgets() {
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`)

    if (!res.ok) {
      setBudgets([])
      return
    }

    const data = await res.json()
    setBudgets(data || [])

    const inputMap: Record<string, string> = {}
    data?.forEach((b: Budget) => {
      inputMap[b.category_id] = b.limit_amount.toString()
    })
    setBudgetInputs(inputMap)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [month, year])

  /* ================= CLOSE PICKER ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setIsPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ================= SAVE ================= */

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

  /* ================= UI ================= */

  return (
    <div className={styles.container}>
      
      {/* PAGE TITLE */}
      <h1 className={styles.pageTitle}>Monthly Budgets</h1>

      {/* FILTER BAR */}
      <div className={styles.filterWrapper}>
        <div className={styles.filterLeft} ref={pickerRef}>
          <span className={styles.filterLabel}>FILTER BY MONTH</span>

          <button
            className={styles.monthInput}
            onClick={() => setIsPickerOpen((prev) => !prev)}
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
                    className={`${styles.monthCell} ${
                      month === i + 1 ? styles.monthActive : ''
                    }`}
                    onClick={() => {
                      setMonth(i + 1)
                      setIsPickerOpen(false)
                    }}
                  >
                    {new Date(0, i).toLocaleString('default', {
                      month: 'short'
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BUDGET LIST */}
      <div className={`card ${styles.listCard}`}>
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