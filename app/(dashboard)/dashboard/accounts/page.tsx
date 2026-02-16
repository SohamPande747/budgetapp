'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

type Account = {
  id: string
  name: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [name, setName] = useState('')

  async function fetchAccounts() {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    setAccounts(data || [])
  }

  async function createAccount() {
    if (!name.trim()) return

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    })

    if (!res.ok) return

    setName('')
    fetchAccounts()
  }

  async function deleteAccount(id: string) {
    await fetch(`/api/accounts?id=${id}`, {
      method: 'DELETE'
    })

    fetchAccounts()
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Accounts</h1>
          <p className={styles.subtitle}>
            Manage your payment methods and wallets
          </p>
        </div>
      </div>

      {/* Add Account Card */}
      <div className={`card ${styles.cardSpacing}`}>
        <div className="card-header">
          <h3>Add New Account</h3>
        </div>

        <div className={styles.formRow}>
          <div className="form-field">
            <label>Account Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. HDFC Debit Card, UPI, Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            className="primary-btn"
            onClick={createAccount}
          >
            Add Account
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className={`card ${styles.tableCard}`}>
        <div className="card-header">
          <h3>Your Accounts</h3>
          <span>
            {accounts.length} total
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💳</div>
            <h4>No accounts added</h4>
            <p>Add your first payment method above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account, index) => (
                  <tr key={account.id}>
                    <td>
                      {account.name}
                      {index === 0 && (
                        <span className={styles.primaryBadge}>
                          Primary
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {index === 0 ? (
                        <button
                          className="danger-btn subtle disabled-btn"
                          disabled
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          className="danger-btn subtle"
                          onClick={() =>
                            deleteAccount(account.id)
                          }
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}