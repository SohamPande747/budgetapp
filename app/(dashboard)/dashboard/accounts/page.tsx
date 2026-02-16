'use client'

import { useEffect, useState } from 'react'

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
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">
            Manage your payment methods and wallets
          </p>
        </div>
      </div>

      {/* Add Account Card */}
      <div className="card account-card">
        <div className="card-header">
          <h3>Add New Account</h3>
        </div>

        <div className="account-form-row">
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
            className="primary-btn large-btn"
            onClick={createAccount}
          >
            Add Account
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card table-card">
        <div className="card-header">
          <h3>Your Accounts</h3>
          <span className="muted-text">
            {accounts.length} total
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h4>No accounts added</h4>
            <p>Add your first payment method above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account, index) => {
                  const isPrimary = index === 0

                  return (
                    <tr key={account.id}>
                      <td className="table-name">
                        {account.name}
                        {isPrimary && (
                          <span className="primary-badge">
                            Primary
                          </span>
                        )}
                      </td>

                      <td className="text-right">
                        <button
                          className={`danger-btn subtle ${isPrimary ? 'disabled-btn' : ''
                            }`}
                          disabled={isPrimary}
                          onClick={() =>
                            !isPrimary && deleteAccount(account.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}