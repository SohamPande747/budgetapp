'use client'

import { useEffect, useState } from 'react'

type Transaction = {
  id: string
  amount: number
  description: string
  transaction_date: string
  categories: {
    id: string
    name: string
    type: string
  }
  accounts: {
    id: string
    name: string
  }
}

export default function TransactionsPage() {
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])

  async function fetchTransactions() {
    const res = await fetch(
      `/api/transactions?month=${String(month).padStart(
        2,
        '0'
      )}&year=${year}`
    )

    const data = await res.json()
    setTransactions(data.data || [])
  }

  useEffect(() => {
    fetchTransactions()
  }, [month, year])

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Transactions</h1>

      {/* Filter Bar */}
      <div className="filter-wrapper">
        <div className="filter-left">
          <span className="filter-label">Filter by</span>

          <select
            className="filter-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="filter-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="card">
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.transaction_date}</td>
                  <td>{t.categories?.name}</td>
                  <td>{t.accounts?.name}</td>
                  <td
                    style={{
                      color:
                        t.categories?.type === 'income'
                          ? '#10b981'
                          : '#ef4444',
                      fontWeight: 500,
                    }}
                  >
                    ₹{t.amount}
                  </td>
                  <td>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}