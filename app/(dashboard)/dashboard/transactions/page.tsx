'use client'

import { useEffect, useState } from 'react'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

type Transaction = {
  id: string
  amount: number
  description: string | null
  transaction_date: string
  categories: Category
}

type ApiResponse = {
  data: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, '0')
  )
  const [year, setYear] = useState(
    String(new Date().getFullYear())
  )
  const limit = 5

  async function fetchTransactions() {
    const res = await fetch(
      `/api/transactions?month=${month}&year=${year}&page=${page}&limit=${limit}`
    )

    const data: ApiResponse = await res.json()
    setTransactions(data.data || [])
  }

  async function deleteTransaction(id: string) {
    await fetch(`/api/transactions?id=${id}`, {
      method: 'DELETE'
    })

    fetchTransactions()
  }

  useEffect(() => {
    fetchTransactions()
  }, [page, month, year])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Transactions</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>Month: </label>
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) =>
            setMonth(e.target.value.padStart(2, '0'))
          }
        />

        <label style={{ marginLeft: '1rem' }}>Year: </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6}>No transactions found</td>
            </tr>
          )}

          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.transaction_date}</td>
              <td>{tx.categories?.name}</td>
              <td>{tx.categories?.type}</td>
              <td>₹ {tx.amount}</td>
              <td>{tx.description || '-'}</td>
              <td>
                <button onClick={() => deleteTransaction(tx.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1rem' }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span style={{ margin: '0 1rem' }}>
          Page {page}
        </span>

        <button onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}