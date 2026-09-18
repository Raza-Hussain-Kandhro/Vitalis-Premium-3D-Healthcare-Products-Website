import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, LogOut, Mail, CalendarClock, ListChecks, Boxes } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { GlassCard, glowButtonClasses } from '../components/ui/ui-bits'
import { fetchMe, logout, ApiError, fetchEnquiries, fetchAppointments, fetchWaitlist, updateEnquiryStatus, updateAppointmentStatus } from '../services/api'

const ENQUIRY_STATUSES = ['new', 'in_review', 'responded', 'closed']
const APPOINTMENT_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled']

const statusSelectClass =
  'rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 disabled:opacity-50'

function StatusSelect({ value, options, onChange }) {
  const [saving, setSaving] = useState(false)

  async function handleChange(e) {
    const next = e.target.value
    setSaving(true)
    try {
      await onChange(next)
    } catch (err) {
      alert(err.message ?? 'Could not update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <select value={value} onChange={handleChange} disabled={saving} className={statusSelectClass}>
      {options.map((o) => (
  <option key={o} value={o} className="bg-white text-black">
    {o.replace('_', ' ')}
  </option>
))}
    </select>
  )
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function Table({ columns, rows, emptyLabel }) {
  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-white/40">{emptyLabel}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
            {columns.map((c) => (
              <th key={c.key} className="pb-3 pr-4 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/5 text-white/80">
              {columns.map((c) => (
                <td key={c.key} className="py-3 pr-4 align-top">
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [me, setMe] = useState(null)
  const [enquiries, setEnquiries] = useState([])
  const [appointments, setAppointments] = useState([])
  const [waitlist, setWaitlist] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const user = await fetchMe()
        if (cancelled) return
        setMe(user)

        const [enquiryRows, appointmentRows, waitlistRows] = await Promise.all([
          user.role === 'admin' ? fetchEnquiries() : Promise.resolve([]),
          fetchAppointments(),
          user.role === 'admin' ? fetchWaitlist() : Promise.resolve([]),
        ])
        if (cancelled) return
        setEnquiries(Array.isArray(enquiryRows) ? enquiryRows : [])
        setAppointments(Array.isArray(appointmentRows) ? appointmentRows : [])
        setWaitlist(Array.isArray(waitlistRows) ? waitlistRows : [])
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate('/admin/login')
          return
        }
        setError(err.message ?? 'Failed to load dashboard.')
        setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  async function handleEnquiryStatus(id, nextStatus) {
    const updated = await updateEnquiryStatus(id, nextStatus)
    setEnquiries((rows) => rows.map((r) => (r.id === id ? updated : r)))
  }

  async function handleAppointmentStatus(id, nextStatus) {
    const updated = await updateAppointmentStatus(id, nextStatus)
    setAppointments((rows) => rows.map((r) => (r.id === id ? updated : r)))
  }

  return (
    <>
      <PageHeader tag="Staff dashboard" title="Enquiries &" highlight="appointments." />
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-shell">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              {me ? `Signed in as ${me.email} (${me.role})` : ' '}
            </p>
            <div className="flex gap-3">
              <Link to="/admin/catalog" className={glowButtonClasses('ghost', 'sm')}>
                <Boxes className="h-4 w-4" /> Manage catalog
              </Link>
              <button onClick={handleLogout} className={glowButtonClasses('ghost', 'sm')}>
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>

          {status === 'loading' && (
            <div className="flex justify-center py-16 text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {status === 'error' && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-300">{error}</p>
          )}

          {status === 'ready' && (
            <div className="grid gap-8">
              {me?.role === 'admin' && (
                <GlassCard>
                  <div className="mb-4 flex items-center gap-2 text-white/80">
                    <Mail className="h-4 w-4" />
                    <h2 className="font-display text-lg font-semibold">Enquiries ({enquiries.length})</h2>
                  </div>
                  <Table
                    emptyLabel="No enquiries yet."
                    rows={enquiries}
                    columns={[
                      { key: 'fullName', label: 'Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Phone' },
                      { key: 'interest', label: 'Interest' },
                      { key: 'message', label: 'Message' },
                      {
                        key: 'status',
                        label: 'Status',
                        render: (r) => (
                          <StatusSelect
                            value={r.status}
                            options={ENQUIRY_STATUSES}
                            onChange={(next) => handleEnquiryStatus(r.id, next)}
                          />
                        ),
                      },
                      { key: 'createdAt', label: 'Received', render: (r) => formatDate(r.createdAt) },
                    ]}
                  />
                </GlassCard>
              )}

              <GlassCard>
                <div className="mb-4 flex items-center gap-2 text-white/80">
                  <CalendarClock className="h-4 w-4" />
                  <h2 className="font-display text-lg font-semibold">Appointments ({appointments.length})</h2>
                </div>
                <Table
                  emptyLabel="No appointments yet."
                  rows={appointments}
                  columns={[
                    { key: 'fullName', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'preferredDate', label: 'Preferred date', render: (r) => formatDate(r.preferredDate) },
                    {
                      key: 'status',
                      label: 'Status',
                      render: (r) => (
                        <StatusSelect
                          value={r.status}
                          options={APPOINTMENT_STATUSES}
                          onChange={(next) => handleAppointmentStatus(r.id, next)}
                        />
                      ),
                    },
                  ]}
                />
              </GlassCard>

              {me?.role === 'admin' && (
                <GlassCard>
                  <div className="mb-4 flex items-center gap-2 text-white/80">
                    <ListChecks className="h-4 w-4" />
                    <h2 className="font-display text-lg font-semibold">Waitlist ({waitlist.length})</h2>
                  </div>
                  <Table
                    emptyLabel="No waitlist signups yet."
                    rows={waitlist}
                    columns={[
                      { key: 'email', label: 'Email' },
                      { key: 'source', label: 'Source' },
                      { key: 'createdAt', label: 'Joined', render: (r) => formatDate(r.createdAt) },
                    ]}
                  />
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
