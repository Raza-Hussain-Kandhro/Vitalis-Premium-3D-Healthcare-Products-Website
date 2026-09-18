import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { GlassCard, IconBadge, glowButtonClasses } from '../components/ui/ui-bits'
import { bookAppointment, submitEnquiry } from '../services/api'
import { EASE } from '../lib/constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\d][\d\s()-]{6,19}$/

const INTERESTS = [
  'Monitoring devices',
  'Diagnostics equipment',
  'Respiratory care',
  'Recovery & rehab',
  'Bulk / tender supply',
]

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  organization: '',
  interest: INTERESTS[0],
  preferredDate: '',
  message: '',
  consent: false,
}

/** Full client-side validation — mirrors the Zod rules used on the server. */
function validate(values, mode) {
  const errors = {}
  if (values.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.'
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim()))
    errors.phone = 'Enter a valid phone number (digits, spaces, + and - only).'
  if (mode === 'booking') {
    if (!values.phone.trim()) errors.phone = 'A phone number is required for bookings.'
    if (!values.preferredDate) errors.preferredDate = 'Choose a preferred date.'
    else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (new Date(values.preferredDate) < today) errors.preferredDate = 'Pick today or a future date.'
    }
  }
  if (values.message.trim().length < 10) errors.message = 'Tell us a little more (10 characters minimum).'
  if (values.message.length > 2000) errors.message = 'Please keep it under 2000 characters.'
  if (!values.consent) errors.consent = 'Please accept the privacy notice to continue.'
  return errors
}

function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/75">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-rose-400">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-white/35">{hint}</p>
      )}
    </label>
  )
}

const inputClass = (hasError) =>
  `glass h-12 w-full rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 ${
    hasError ? 'border-rose-400/50 focus:ring-rose-400/30' : 'focus:border-neon-cyan/50 focus:ring-neon-cyan/30'
  }`

export default function Contact() {
  const [mode, setMode] = useState('enquiry') // enquiry | booking
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [serverError, setServerError] = useState('')

  const setField = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e))
  }

  const onBlurField = (name) => () => {
    const next = validate(values, mode)
    setErrors((e) => ({ ...e, [name]: next[name] }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validate(values, mode)
    const cleaned = Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => v))
    setErrors(cleaned)
    if (Object.keys(cleaned).length > 0) {
      document.querySelector('[data-form-top]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setStatus('submitting')
    setServerError('')
    try {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        organization: values.organization.trim() || undefined,
        interest: values.interest,
        message: values.message.trim(),
      }
      if (mode === 'booking') {
        await bookAppointment({ ...payload, preferredDate: values.preferredDate })
      } else {
        await submitEnquiry(payload)
      }
      setStatus('success')
      setValues(EMPTY)
    } catch (err) {
      if (err?.fieldErrors) setErrors(err.fieldErrors)
      setServerError(err?.message ?? 'Something went wrong — please try again.')
      setStatus('error')
    }
  }

  return (
    <>
      <PageHeader
        tag="Contact"
        title="Talk to a"
        highlight="product specialist."
        copy="Send an enquiry or book a 30-minute consultation. A biomedical specialist replies within one business day."
      />

      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-shell gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* ---------- Form ---------- */}
          <motion.div
            data-form-top
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="glass-strong rounded-3xl p-6 sm:p-9"
          >
            <div className="flex gap-2 rounded-xl border border-white/10 p-1">
              {[
                { id: 'enquiry', label: 'General enquiry' },
                { id: 'booking', label: 'Book a consultation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id)
                    setErrors({})
                    setStatus('idle')
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === tab.id ? 'bg-neon-cyan text-void' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name *" error={errors.fullName}>
                  <input
                    id="contact-fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={setField('fullName')}
                    onBlur={onBlurField('fullName')}
                    aria-invalid={Boolean(errors.fullName)}
                    placeholder="Dr. Ayesha Khan"
                    className={inputClass(errors.fullName)}
                  />
                </Field>

                <Field label="Work email *" error={errors.email}>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={setField('email')}
                    onBlur={onBlurField('email')}
                    aria-invalid={Boolean(errors.email)}
                    placeholder="you@hospital.org"
                    className={inputClass(errors.email)}
                  />
                </Field>

                <Field
                  label={mode === 'booking' ? 'Phone *' : 'Phone'}
                  error={errors.phone}
                  hint={mode === 'booking' ? undefined : 'Optional'}
                >
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={setField('phone')}
                    onBlur={onBlurField('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    placeholder="+92 300 1234567"
                    className={inputClass(errors.phone)}
                  />
                </Field>

                <Field label="Organization" error={errors.organization} hint="Hospital, clinic or distributor">
                  <input
                    id="contact-organization"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    value={values.organization}
                    onChange={setField('organization')}
                    placeholder="Vitalis Care Network"
                    className={inputClass(false)}
                  />
                </Field>

                <Field label="Product interest" error={errors.interest}>
                  <select
                    id="contact-interest"
                    name="interest"
                    value={values.interest}
                    onChange={setField('interest')}
                    className={`${inputClass(false)} appearance-none`}
                  >
                    {INTERESTS.map((option) => (
                      <option key={option} value={option} className="bg-panel">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                {mode === 'booking' && (
                  <Field label="Preferred date *" error={errors.preferredDate}>
                    <input
                      id="contact-preferredDate"
                      name="preferredDate"
                      type="date"
                      value={values.preferredDate}
                      onChange={setField('preferredDate')}
                      onBlur={onBlurField('preferredDate')}
                      aria-invalid={Boolean(errors.preferredDate)}
                      className={inputClass(errors.preferredDate)}
                    />
                  </Field>
                )}
              </div>

              <Field label="How can we help? *" error={errors.message} hint={`${values.message.length}/2000`}>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={setField('message')}
                  onBlur={onBlurField('message')}
                  aria-invalid={Boolean(errors.message)}
                  placeholder="Tell us about the department, quantities and timelines…"
                  className="glass w-full rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30"
                />
              </Field>

              <label className="flex items-start gap-3">
                <input
                  id="contact-consent"
                  name="consent"
                  type="checkbox"
                  checked={values.consent}
                  onChange={setField('consent')}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-neon-cyan focus:ring-neon-cyan/40"
                />
                <span className="text-xs leading-relaxed text-white/50">
                  I agree that Vitalis may store these details to respond to my enquiry, per the privacy notice.
                  {errors.consent && <span className="mt-1 block text-rose-400">{errors.consent}</span>}
                </span>
              </label>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`${glowButtonClasses('primary')} h-12 w-full disabled:opacity-70`}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : mode === 'booking' ? (
                  'Request this slot'
                ) : (
                  'Send enquiry'
                )}
              </button>

              {serverError && status === 'error' && (
                <p role="alert" className="text-sm text-rose-400">
                  {serverError}
                </p>
              )}
            </form>
          </motion.div>

          {/* ---------- Contact details ---------- */}
          <div className="space-y-6">
            <GlassCard>
              <IconBadge icon={MapPin} />
              <h3 className="mt-5 font-display text-lg font-semibold">Head office</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                4th Floor, Ocean Tower, Clifton
                <br />
                Karachi 75600, Pakistan
              </p>
            </GlassCard>

            <GlassCard delay={0.08}>
              <IconBadge icon={Phone} />
              <h3 className="mt-5 font-display text-lg font-semibold">Sales desk</h3>
              <p className="mt-2 text-sm text-white/50">+92 21 3565 0100</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/50">
                <Mail className="h-4 w-4" /> care@vitalis.health
              </p>
            </GlassCard>

            <GlassCard delay={0.16}>
              <IconBadge icon={Clock} />
              <h3 className="mt-5 font-display text-lg font-semibold">Hours</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Mon – Fri · 9:00 – 18:00 PKT
                <br />
                Sat · 10:00 – 14:00 PKT
                <br />
                24/7 emergency device support
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Success toast */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 12, x: '-50%' }}
            transition={{ duration: 0.35, ease: EASE }}
            role="status"
            className="glass-strong fixed bottom-6 left-1/2 z-[110] flex items-center gap-3 rounded-full py-3 pl-4 pr-6 text-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-neon-cyan" />
            <span>Received — a specialist will reply within one business day.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
