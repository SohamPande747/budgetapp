'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import toast from 'react-hot-toast'

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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ✅ Currency Formatter
  function formatAmount(value: number) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  async function fetchTransactions() {
    try {
      const res = await fetch(
        `/api/transactions?month=${String(month).padStart(
          2,
          '0'
        )}&year=${year}`
      )

      const data = await res.json()
      setTransactions(data.data || [])
    } catch {
      toast.error('Failed to fetch transactions')
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)

    const deletePromise = fetch(`/api/transactions?id=${id}`, {
      method: 'DELETE',
    })

    toast.promise(deletePromise, {
      loading: 'Deleting transaction...',
      success: 'Transaction deleted successfully',
      error: 'Failed to delete transaction',
    })

    const res = await deletePromise

    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    }

    setDeletingId(null)
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
                <th>Action</th>
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
                    ₹{formatAmount(t.amount)}
                  </td>
                  <td>{t.description}</td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                    >
                      {deletingId === t.id ? 'Deleting...' : 'Delete'}
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