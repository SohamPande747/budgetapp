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

    <nav className={styles.nav}>
      <div className={styles.logo}>
        Spendle
      </div>

      <div className={styles.navActions}>
        <a href="/login" className={styles.navLogin}>
          Login
        </a>

        <a href="/signup" className={styles.primaryBtn}>
          Sign Up
        </a>
      </div>
    </nav>

    <div className={styles.hero}>
      <div className={styles.content}>

        <span className={styles.badge}>
          Personal Finance, Simplified
        </span>

        <h1 className={styles.title}>
          Take control of your money.
          <br />
          <span className={styles.highlight}>
            Without overcomplicating it.
          </span>
        </h1>

        <p className={styles.subtitle}>
          Track spending, manage budgets,
          and understand your habits —
          all from one clean dashboard.
        </p>

        <div className={styles.buttons}>
          <a href="/signup" className={styles.primaryBtn}>
            Get Started
          </a>
        </div>

      </div>
    </div>

  </div>
)}