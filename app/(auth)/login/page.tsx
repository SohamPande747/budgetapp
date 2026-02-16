'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleEmailLogin() {
    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithPassword({
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

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`
      }
    })
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Login to continue to Spendle
        </p>

        {errorMsg && (
          <div className="auth-error">
            {errorMsg}
          </div>
        )}

        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="primary-btn full-width"
          onClick={handleEmailLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="oauth-btn"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>

        <p className="auth-footer">
          Don’t have an account?{' '}
          <a href="/signup">Sign up</a>
        </p>

      </div>
    </div>
  )
}