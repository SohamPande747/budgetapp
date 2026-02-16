'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

export default function AddTransactionPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data || [])
  }

  async function handleSubmit() {
    if (!categoryId || !amount || !date) {
      alert('Please fill required fields')
      return
    }

    setLoading(true)

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: categoryId,
        amount: parseFloat(amount),
        description,
        transaction_date: date
      })
    })

    setLoading(false)

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Something went wrong')
      return
    }

    router.replace('/dashboard/transactions')
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // 🔥 Filter categories by selected type
  const filteredCategories = categories.filter(
    (c) => c.type === type
  )

  return (
    <div>
      <h1>Add Transaction</h1>

      {/* Type Selector */}
      <div>
        <label>Type *</label>
        <br />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as 'income' | 'expense')
            setCategoryId('')
          }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <br />

      {/* Category Selector */}
      <div>
        <label>Category *</label>
        <br />
        <select
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

      <br />

      <div>
        <label>Amount *</label>
        <br />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Description</label>
        <br />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Date *</label>
        <br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Add Transaction'}
      </button>
    </div>
  )
}