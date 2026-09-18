import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { SectionTag, glowButtonClasses } from './ui-bits'
import { joinWaitlist } from '../../services/api'
import { EASE } from '../../lib/constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Call to Action — the "smooth transition back to 2D": a solid glass
 * panel over the settled 3D scene, with client-side validation,
 * loading state, and a success toast (TRD Phase 1: validation + feedback).
 */
export default function CTA() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [toast, setToast] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status === 'loading') return

    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setError('Please enter a valid work email.')
      return
    }

    setError('')
    setStatus('loading')
    try {
      await joinWaitlist(value)
      setStatus('success')
      setEmail('')
      setToast(true)
      setTimeout(() => setToast(false), 4500)
    } catch {
      setStatus('idle')
      setError('Something went wrong — please try again.')
    }
  }

  return (
    <section id="contact" className="relative bg-abyss px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="glass-strong relative mx-auto max-w-4xl overflow-hidden rounded-3xl"
      >
        {/* Decorative layers */}
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-neon-cyan/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative px-6 py-16 text-center sm:px-14">
          <SectionTag>Early Access</SectionTag>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Be first in line for the <span className="text-gradient">future of care.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/55">
            We're onboarding a limited number of hospitals and care networks. Tell us where to reach you.
          </p>

          <form onSubmit={onSubmit} noValidate className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="cta-email" className="sr-only">
              Work email
            </label>
            <input
              id="cta-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@hospital.org"
              value={email}
              disabled={status === 'loading'}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              className="glass h-12 flex-1 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 disabled:opacity-60"
            />
            <button type="submit" disabled={status === 'loading'} className={`${glowButtonClasses('primary')} h-12 disabled:opacity-70`}>
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Joining…
                </>
              ) : (
                <>
                  Request access <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-3 text-sm text-rose-400">
              {error}
            </p>
          )}
          <p className="mt-4 text-xs text-white/35">No spam. Unsubscribe anytime.</p>
        </div>
      </motion.div>

      {/* Success toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: '-50%', scale: 0.96 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 12, x: '-50%', scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="status"
            className="glass-strong fixed bottom-6 left-1/2 z-[110] flex items-center gap-3 rounded-full py-3 pl-4 pr-6 text-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-neon-cyan" />
            <span>You're on the list — we'll reach out soon.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
