'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function OnboardingPage() {
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [fullName, setFullName] = useState('')
    const [balance, setBalance] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [accountName, setAccountName] = useState('')

    const totalSteps = 3
    const progress = (step / totalSteps) * 100

    const canContinue = () => {
        if (step === 1) return fullName.trim().length > 1
        if (step === 2) return accountName.trim().length > 1
        if (step === 3) return true
        return false
    }

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    accountName,
                    balance
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Something went wrong')
            }

            router.push('/dashboard')

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>

                <div className={styles.header}>
                    <h1 className={styles.logo}>Spendle</h1>
                    <div className={styles.stepText}>
                        Step {step} of {totalSteps}
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className={styles.content}>
                    {step === 1 && (
                        <>
                            <h2>What should we call you?</h2>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2>Name your primary account</h2>
                            <p className={styles.helper}>
                                This could be your bank account, wallet, or main balance source.
                            </p>
                            <input
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="e.g. HDFC Bank, Wallet, Savings"
                            />
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <h2>Set your starting balance</h2>
                            <p className={styles.helper}>
                                This helps calculate your current balance accurately.
                            </p>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                            />
                        </>
                    )}

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    {step > 1 && !loading && (
                        <button
                            className={styles.secondaryBtn}
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </button>
                    )}

                    <button
                        className={styles.primaryBtn}
                        disabled={!canContinue() || loading}
                        onClick={handleNext}
                    >
                        {loading ? 'Setting things up…' : step === totalSteps ? 'Finish Setup' : 'Continue'}
                    </button>
                </div>

            </div>
        </div>
    )
}