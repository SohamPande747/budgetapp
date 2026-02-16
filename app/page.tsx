import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
  <div className="landing-wrapper">

    {/* Navbar */}
    <nav className="landing-nav">
      <div className="nav-logo">
        Spendle
      </div>

      <div className="nav-actions">
        <a href="/login" className="nav-login">
          Login
        </a>

        <a href="/signup" className="primary-btn">
          Sign Up
        </a>
      </div>
    </nav>

    {/* Hero */}
    <div className="landing-container">
      <div className="landing-content">

        <span className="landing-badge">
          Personal Finance, Simplified
        </span>

        <h1 className="landing-title">
          Take control of your money.
          <br />
          <span className="highlight">
            Without overcomplicating it.
          </span>
        </h1>

        <p className="landing-subtitle">
          Track spending, manage budgets,
          and understand your habits —
          all from one clean dashboard.
        </p>

        <div className="landing-buttons">
          <a href="/signup" className="primary-btn">
            Get Started
          </a>
        </div>

      </div>
    </div>

  </div>
)
}