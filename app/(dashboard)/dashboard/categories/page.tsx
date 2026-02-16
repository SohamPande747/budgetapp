'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')

  async function fetchCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data || [])
  }

  async function createCategory() {
    if (!name.trim()) return

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type })
    })

    if (!res.ok) return

    setName('')
    fetchCategories()
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/categories?id=${id}`, {
      method: 'DELETE'
    })

    fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSubtitle}>
            Manage income and expense classifications
          </p>
        </div>
      </div>

      {/* Add Category Card */}
      <div className={`${styles.card} ${styles.categoryCard}`}>
        <div className={styles.cardHeader}>
          <h3>Add New Category</h3>
        </div>

        <div className={styles.categoryFormGrid}>
          <div className={styles.formField}>
            <label>Category Name</label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="e.g. Travel, Bonus"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label>Type</label>
            <select
              className={styles.formSelect}
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'income' | 'expense')
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className={styles.formAction}>
            <button
              className={`${styles.primaryBtn} ${styles.largeBtn} ${styles.fullWidth}`}
              onClick={createCategory}
            >
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className={`${styles.card} ${styles.tableCard}`}>
        <div className={styles.cardHeader}>
          <h3>Existing Categories</h3>
          <span className={styles.mutedText}>
            {categories.length} total
          </span>
        </div>

        {categories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📂</div>
            <h4>No categories yet</h4>
            <p>Create your first category using the form above.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th className={styles.textRight}>Action</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className={styles.tableName}>{cat.name}</td>

                    <td>
                      <span
                        className={
                          cat.type === 'income'
                            ? `${styles.badge} ${styles.incomeBadge}`
                            : `${styles.badge} ${styles.expenseBadge}`
                        }
                      >
                        {cat.type}
                      </span>
                    </td>

                    <td className={styles.textRight}>
                      <button
                        className={`${styles.dangerBtn} ${styles.subtle}`}
                        onClick={() => deleteCategory(cat.id)}
                      >
                        Delete
                      </button>
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