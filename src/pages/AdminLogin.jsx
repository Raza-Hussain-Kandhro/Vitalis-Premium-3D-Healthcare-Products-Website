import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { GlassCard, glowButtonClasses } from '../components/ui/ui-bits'
import { login } from '../services/api'

const inputClass =
  'glass h-12 w-full rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-neon-cyan/50 focus:ring-neon-cyan/30'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | error
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const { user } = await login({ email: email.trim().toLowerCase(), password })
      if (!['admin', 'staff'].includes(user.role)) {
        setError('This account does not have staff access.')
        setStatus('error')
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message ?? 'Sign in failed.')
      setStatus('error')
    }
  }

  return (
    <>
      <PageHeader tag="Staff access" title="Sign in to the" highlight="admin dashboard." />
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-md">
          <GlassCard>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="block">
                <span className="text-sm font-medium text-white/75">Email</span>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                  placeholder="you@vitalis.com"
                  autoComplete="username"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white/75">Password</span>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              {error && (
                <p role="alert" className="text-xs text-rose-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`${glowButtonClasses('primary', 'md')} mt-2 w-full disabled:opacity-60`}
              >
                {status === 'submitting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Sign in
              </button>
            </form>
          </GlassCard>
          <p className="mt-4 text-center text-xs text-white/35">
            Staff and admin accounts only. Contact your administrator for access.
          </p>
        </div>
      </section>
    </>
  )
}
