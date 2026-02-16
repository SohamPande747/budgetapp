'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleEmailSignup() {
    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    router.replace('/dashboard')
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Start tracking your finances in minutes.
        </p>

        {errorMsg && (
          <div className={styles.error}>
            {errorMsg}
          </div>
        )}

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className={`${styles.primaryBtn} ${styles.fullWidth}`}
          onClick={handleEmailSignup}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          className={styles.oauthBtn}
          onClick={handleGoogleSignup}
        >
          
          Continue with Google
        </button>

        <p className={styles.footer}>
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>

      </div>
    </div>
  )
}