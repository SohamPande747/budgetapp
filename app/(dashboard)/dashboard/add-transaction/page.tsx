'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data || [])
  }

  async function fetchAccounts() {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data || [])

    // Default to first account (Account 1)
    if (data.length > 0) {
      setAccountId(data[0].id)
    }
  }

  async function handleSubmit() {
    if (!categoryId || !accountId || !amount) {
      alert('Please fill required fields')
      return
    }

    const res = await fetch('/api/transactions', {
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

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Something went wrong')
      return
    }

    router.replace('/dashboard/transactions')
  }

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
  }, [])

  const filteredCategories = categories.filter(
    (c) => c.type === type
  )

  return (
    <div>
      <h1>Add Transaction</h1>

      {/* Type */}
      <div>
        <label>Type</label>
        <br />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as any)
            setCategoryId('')
          }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <br />

      {/* Category */}
      <div>
        <label>Category</label>
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

      {/* Account */}
      <div>
        <label>Payment Method</label>
        <br />
        <select
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

      <br />

      {/* Amount */}
      <div>
        <label>Amount</label>
        <br />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <br />

      {/* Description */}
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

      {/* Date */}
      <div>
        <label>Date</label>
        <br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <br />

      <button onClick={handleSubmit}>
        Add Transaction
      </button>
    </div>
  )
}