'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import styles from './page.module.css'
import { CreditCard } from 'lucide-react'

type Account = {
  id: string
  name: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/accounts')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch accounts')
      }

      setAccounts(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch accounts')
    }
  }

  async function createAccount() {
    if (!name.trim()) {
      toast.error('Please enter an account name')
      return
    }

    setCreating(true)

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create account')
      }

      toast.success('Account created successfully 🎉')
      setName('')
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account')
    } finally {
      setCreating(false)
    }
  }

  async function deleteAccount(id: string) {
    setDeletingId(id)

    try {
      const res = await fetch(`/api/accounts?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to delete account')
      }

      toast.success('Account deleted successfully')
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <div className={styles.container}>

      {/* Header */}
      <div>
        <h1 className={styles.title}>Accounts</h1>
        <p className={styles.subtitle}>
          Manage your payment methods and wallets
        </p>
      </div>

      {/* Add Account Card */}
      <div className={styles.cardSpacing}>
        <h3>Add New Account</h3>

        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="e.g. HDFC Debit Card, UPI, Cash"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className={styles.primaryButton}
            onClick={createAccount}
            disabled={creating}
          >
            {creating ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className={styles.tableCard}>
        {accounts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <CreditCard size={36} strokeWidth={1.5} />
            </div>
            <h4>No accounts yet</h4>
            <p>Add your first payment method above.</p>
          </div>
        ) : (
          accounts.map((account, index) => (
            <div key={account.id} className={styles.accountRow}>
              <div className={styles.accountLeft}>
                <span className={styles.accountName}>
                  {account.name}
                </span>

                {index === 0 && (
                  <span className={styles.primaryBadge}>
                    Primary
                  </span>
                )}
              </div>

              {index !== 0 && (
                <button
                  className={styles.deleteButton}
                  onClick={() => deleteAccount(account.id)}
                  disabled={deletingId === account.id}
                >
                  {deletingId === account.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  )
}