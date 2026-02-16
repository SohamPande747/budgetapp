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

  async function handleEmailLogin() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      alert(error.message)
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
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h1>Login</h1>

      {/* Email Login */}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />

        <br /><br />

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          style={{ width: '100%', padding: '8px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        style={{
          width: '100%',
          padding: '8px',
          background: '#fff',
          border: '1px solid #ccc',
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>

      <p style={{ marginTop: '1rem' }}>
        Don’t have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  )
}