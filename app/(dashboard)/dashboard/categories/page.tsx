'use client'

import { useEffect, useState } from 'react'

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
    if (!name) return

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
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">
            Manage income and expense classifications
          </p>
        </div>
      </div>

      {/* Add Category Card */}
      <div className="card category-card">
        <div className="card-header">
          <h3>Add New Category</h3>
        </div>

        <div className="category-form-grid">
          <div className="form-field">
            <label>Category Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Travel, Bonus"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'income' | 'expense')
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-action">
            <button
              className="primary-btn large-btn full-width"
              onClick={createCategory}
            >
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card table-card">
        <div className="card-header">
          <h3>Existing Categories</h3>
          <span className="muted-text">
            {categories.length} total
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h4>No categories yet</h4>
            <p>Create your first category using the form above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="table-name">{cat.name}</td>

                    <td>
                      <span
                        className={
                          cat.type === 'income'
                            ? 'badge income-badge'
                            : 'badge expense-badge'
                        }
                      >
                        {cat.type}
                      </span>
                    </td>

                    <td className="text-right">
                      <button
                        className="danger-btn subtle"
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