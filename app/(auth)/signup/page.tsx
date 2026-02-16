'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="auth-wrapper">
      <div className="auth-card">

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Start tracking your finances in minutes.
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
          onClick={handleEmailSignup}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="oauth-btn"
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>

      </div>
    </div>
  )
}