'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/page.module.css'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      setErrorMsg('Please enter your email address')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setMessage('Password reset link sent! Please check your email.')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>
          Enter your email and we’ll send you a reset link
        </p>

        {errorMsg && (
          <div className={styles.error}>
            {errorMsg}
          </div>
        )}

        {message && (
          <div className={styles.success}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`${styles.primaryBtn} ${styles.fullWidth}`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className={styles.footer}>
          Remember your password?{' '}
          <a href="/login">Back to login</a>
        </p>
      </div>
    </div>
  )
}