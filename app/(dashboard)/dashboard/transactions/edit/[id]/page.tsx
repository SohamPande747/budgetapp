'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import styles from './page.module.css'
import Button from '../../../../../components/ui/Button'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

type Account = {
  id: string
  name: string
}

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string

  const amountRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  /* =========================
     FETCH BASE DATA
  ========================== */

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data || [])
  }

  async function fetchAccounts() {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data || [])
  }

  /* =========================
     FETCH TRANSACTION
  ========================== */

  async function fetchTransaction() {
    try {
      const res = await fetch(`/api/transactions?id=${transactionId}`)
      const json = await res.json()

      if (!res.ok) throw new Error(json?.error)

      const data = json.data

      setType(data.categories.type)
      setCategoryId(data.category_id)
      setAccountId(data.account_id)
      setAmount(String(data.amount))
      setDescription(data.description || '')
      setDate(data.transaction_date)

    } catch (err: any) {
      toast.error(err.message || 'Failed to load transaction')
      router.push('/dashboard/transactions')
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     UPDATE TRANSACTION
  ========================== */

  async function handleSubmit() {
    if (saving) return

    try {
      setSaving(true)

      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: transactionId,
          category_id: categoryId,
          account_id: accountId,
          amount: parseFloat(amount),
          description,
          transaction_date: date
        })
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json?.error)

      toast.success('Transaction updated successfully 🎉')
      router.push('/dashboard/transactions')

    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  /* =========================
     INIT
  ========================== */

  useEffect(() => {
    if (!transactionId) return

    fetchCategories()
    fetchAccounts()
    fetchTransaction()
  }, [transactionId])

  useEffect(() => {
    amountRef.current?.focus()
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1>Edit Transaction</h1>
          <p>Loading transaction...</p>
        </div>
      </div>
    )
  }

  const filteredCategories = categories.filter(
    (c) => c.type === type
  )

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Edit Transaction</h1>
        <p>Update your transaction details</p>
      </div>

      <div className={styles.cardWidth}>
        <div className={styles.formGrid}>

          {/* Transaction Type */}
          <div className="form-field">
            <label>
              Transaction Type <span className={styles.required}>*</span>
            </label>
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
            <label>
              Category <span className={styles.required}>*</span>
            </label>
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
            <label>
              Payment Method <span className={styles.required}>*</span>
            </label>
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
            <label>
              Amount <span className={styles.required}>*</span>
            </label>
            <input
              ref={amountRef}
              className="form-input amount-input"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={`form-field ${styles.fullWidth}`}>
            <label>Description</label>
            <input
              className="form-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className={`form-field ${styles.dateField}`}>
            <label>
              Date <span className={styles.required}>*</span>
            </label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className={styles.formActions}>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Updating...' : 'Update Transaction'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}