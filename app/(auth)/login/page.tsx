'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleEmailLogin(e?: React.FormEvent) {
    e?.preventDefault()

    if (!email || !password) {
      setErrorMsg('Please enter email and password')
      return
    }

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
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Login to continue to Spendle
        </p>

        {errorMsg && (
          <div className={styles.error}>
            {errorMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleEmailLogin}>
          {/* Email */}
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

          {/* Password */}
          <div className={styles.field}>
            <label>Password</label>

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className={styles.forgotWrapper}>
            <a href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`${styles.primaryBtn} ${styles.fullWidth}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* Google Login */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
        >
          <div className={styles.googleIcon}>
            <svg viewBox="0 0 48 48" width="18" height="18">
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.9-6.9C35.91 2.38 30.36 0 24 0 14.61 0 6.48 5.48 2.56 13.44l8.04 6.24C12.33 13.27 17.67 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24.5c0-1.7-.15-3.33-.43-4.91H24v9.29h12.7c-.55 2.96-2.2 5.46-4.69 7.14l7.27 5.66C43.93 37.53 46.5 31.56 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.6 28.68a14.5 14.5 0 010-9.36l-8.04-6.24A23.93 23.93 0 000 24c0 3.84.92 7.47 2.56 10.56l8.04-6.24z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.36 0 11.91-2.1 15.88-5.72l-7.27-5.66c-2.02 1.35-4.6 2.15-8.61 2.15-6.33 0-11.67-3.77-13.4-9.18l-8.04 6.24C6.48 42.52 14.61 48 24 48z"
              />
            </svg>
          </div>
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className={styles.footer}>
          Don’t have an account?{' '}
          <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  )
}