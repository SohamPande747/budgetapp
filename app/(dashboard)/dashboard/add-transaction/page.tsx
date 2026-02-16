'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import styles from './page.module.css'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

type Account = {
  id: string
  name: string
}

export default function AddTransactionPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [saving, setSaving] = useState(false)

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data || [])
  }

  async function fetchAccounts() {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data || [])

    if (data.length > 0) {
      setAccountId(data[0].id)
    }
  }

  async function handleSubmit() {
    if (!categoryId || !accountId || !amount) {
      toast.error('Please fill all required fields')
      return
    }

    if (Number(amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setSaving(true)

    const submitPromise = fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: categoryId,
        account_id: accountId,
        amount: parseFloat(amount),
        description,
        transaction_date: date
      })
    })

    toast.promise(submitPromise, {
      loading: 'Adding transaction...',
      success: 'Transaction added successfully 🎉',
      error: 'Failed to add transaction'
    })

    const res = await submitPromise

    setSaving(false)

    if (!res.ok) {
      return
    }

    router.push('/dashboard/transactions')
  }

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
  }, [])

  const filteredCategories = categories.filter(
    (c) => c.type === type
  )

  return (
    <div className={styles.container}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Transaction</h1>
          <p className="page-subtitle">
            Record a new income or expense entry
          </p>
        </div>
      </div>

      <div className={`card ${styles.cardWidth}`}>
        <div className={styles.formGrid}>

          {/* Type */}
          <div className="form-field">
            <label>Transaction Type</label>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  type === 'expense' ? styles.activeExpense : ''
                }`}
                onClick={() => {
                  setType('expense')
                  setCategoryId('')
                }}
              >
                Expense
              </button>

              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  type === 'income' ? styles.activeIncome : ''
                }`}
                onClick={() => {
                  setType('income')
                  setCategoryId('')
                }}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="form-field">
            <label>Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div className="form-field">
            <label>Payment Method</label>
            <select
              className="form-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="form-field">
            <label>Amount</label>
            <input
              className="form-input amount-input"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={`form-field ${styles.fullWidth}`}>
            <label>Description (Optional)</label>
            <input
              className="form-input"
              type="text"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-field">
            <label>Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className={`${styles.formActions} ${styles.fullWidth}`}>
            <button
              className="primary-btn full-width"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}