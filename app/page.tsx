import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className={styles.wrapper}>

      {/* ================= NAVBAR ================= */}
      <nav className={styles.nav}>
        <div className={styles.logo}>Spendle</div>

        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="/login">Login</a>
          <a href="/signup" className={styles.primaryBtn}>Get Started</a>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.badge}>
            Modern Personal Finance Platform
          </span>

          <h1 className={styles.title}>
            Financial clarity.
            <br />
            <span className={styles.highlight}>
              Built for focus.
            </span>
          </h1>

          <p className={styles.subtitle}>
            Spendle helps individuals track expenses, manage budgets,
            and understand spending patterns through a clean,
            distraction-free dashboard experience.
          </p>

          <div className={styles.buttons}>
            <a href="/signup" className={styles.primaryBtn}>
              Start Free
            </a>

            <a href="/login" className={styles.secondaryBtn}>
              View Demo
            </a>
          </div>
        </div>

        <div className={styles.heroRight}>
          <img
            src="/landingpage.webp"
            alt="Spendle Dashboard Preview"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className={styles.trust}>
        <p>Secure. Reliable. Built with modern cloud infrastructure.</p>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className={styles.features}>
        <h2>Designed for Simplicity and Control</h2>

        <div className={styles.featureGrid}>

          <div className={styles.featureCard}>
            <h3>Smart Expense Tracking</h3>
            <p>
              Categorize transactions and gain real-time visibility
              into where your money goes.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3>Budget Management</h3>
            <p>
              Create structured budgets and monitor performance
              with clear visual indicators.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3>Insightful Analytics</h3>
            <p>
              Understand trends, habits, and monthly patterns
              through intelligent summaries.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3>Secure Authentication</h3>
            <p>
              Built on Supabase Auth with secure session handling
              and encrypted data storage.
            </p>
          </div>

        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section id="security" className={styles.security}>
        <div>
          <h2>Enterprise-grade security</h2>
          <p>
            Your data is encrypted in transit and at rest.
            Authentication is powered by Supabase with secure
            email/password and OAuth workflows.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className={styles.cta}>
        <h2>Take control of your finances today.</h2>
        <a href="/signup" className={styles.primaryBtnLarge}>
          Create Free Account
        </a>
      </section>

    </div>
  )
}