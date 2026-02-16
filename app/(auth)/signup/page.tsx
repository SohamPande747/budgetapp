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

  async function handleEmailSignup() {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    // Supabase auto logs in user if email confirmation is disabled
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
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h1>Signup</h1>

      {/* Email Signup */}
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
          onClick={handleEmailSignup}
          disabled={loading}
          style={{ width: '100%', padding: '8px' }}
        >
          {loading ? 'Creating account...' : 'Signup'}
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      {/* Google Signup */}
      <button
        onClick={handleGoogleSignup}
        style={{
          width: '100%',
          padding: '8px',
          background: '#fff',
          border: '1px solid #ccc',
          cursor: 'pointer'
        }}
      >
        Sign up with Google
      </button>

      <p style={{ marginTop: '1rem' }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  )
}