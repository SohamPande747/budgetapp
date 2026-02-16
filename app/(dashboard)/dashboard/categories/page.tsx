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
    if (!name) {
      alert('Enter category name')
      return
    }

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type })
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error)
      return
    }

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
    <div>
      <h1>Categories</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as 'income' | 'expense')
          }
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <button onClick={createCategory}>
          Add
        </button>
      </div>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.type}</td>
              <td>
                <button onClick={() => deleteCategory(cat.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}