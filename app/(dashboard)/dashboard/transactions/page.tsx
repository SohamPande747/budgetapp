'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

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

  async function handleDelete(id: string) {
    const confirmDelete = confirm('Are you sure you want to delete this transaction?')
    if (!confirmDelete) return

    const res = await fetch(`/api/transactions?id=${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      // Optimistically update UI
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } else {
      alert('Failed to delete transaction')
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [month, year])

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Transactions</h1>

      {/* Filter Bar */}
      <div className={styles.filterWrapper}>
        <div className={styles.filterLeft}>
          <span className={styles.filterLabel}>Filter by</span>

          <select
            className={styles.filterSelect}
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
            className={styles.filterInput}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className={styles.card}>
        {transactions.length === 0 ? (
          <p className={styles.emptyState}>No transactions found.</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Action</th> {/* NEW COLUMN */}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.transaction_date}</td>
                  <td>{t.categories?.name}</td>
                  <td>{t.accounts?.name}</td>
                  <td
                    className={
                      t.categories?.type === 'income'
                        ? styles.incomeAmount
                        : styles.expenseAmount
                    }
                  >
                    ₹{t.amount}
                  </td>
                  <td>{t.description}</td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}