import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, PackageSearch, ShieldCheck, Star } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { GlassCard, glowButtonClasses } from '../components/ui/ui-bits'
import { fetchProducts } from '../services/api'
import { EASE } from '../lib/constants'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  { id: 'all', label: 'All products' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'recovery', label: 'Recovery' },
]

/**
 * Fallback catalogue — rendered when the API is unreachable (e.g. `vite dev`
 * without `vercel dev`), so the page never looks broken during review.
 */
const FALLBACK = [
  { id: 'f1', slug: 'vitalis-pulse-pro', name: 'Vitalis Pulse Pro', category: 'monitoring', price: 289, currency: 'USD', shortDescription: 'Continuous SpO₂ and heart-rate monitor with Bluetooth telemetry.', rating: 4.9, badge: 'Best seller', certifications: ['CE', 'FDA listed'] },
  { id: 'f2', slug: 'cardioscan-ecg-12', name: 'CardioScan ECG-12', category: 'diagnostics', price: 1740, currency: 'USD', shortDescription: '12-lead resting ECG with automated interpretation and PDF export.', rating: 4.8, badge: 'Clinic grade', certifications: ['CE', 'ISO 13485'] },
  { id: 'f3', slug: 'aeroflow-neb-x', name: 'AeroFlow Neb X', category: 'respiratory', price: 156, currency: 'USD', shortDescription: 'Silent mesh nebuliser with paediatric and adult mask kit.', rating: 4.7, certifications: ['CE'] },
  { id: 'f4', slug: 'thermoscan-ir-precision', name: 'ThermoScan IR Precision', category: 'diagnostics', price: 98, currency: 'USD', shortDescription: 'Non-contact infrared thermometer, ±0.2°C clinical accuracy.', rating: 4.6, certifications: ['CE', 'FDA listed'] },
  { id: 'f5', slug: 'oxyhome-5l-concentrator', name: 'OxyHome 5L Concentrator', category: 'respiratory', price: 1290, currency: 'USD', shortDescription: 'Home oxygen concentrator, 93% ±3 purity, 42 dB whisper mode.', rating: 4.8, badge: 'Home care', certifications: ['CE', 'ISO 13485'] },
  { id: 'f6', slug: 'reflex-tens-therapy', name: 'Reflex TENS Therapy Unit', category: 'recovery', price: 134, currency: 'USD', shortDescription: 'Dual-channel TENS/EMS unit with eight clinician-set programmes.', rating: 4.5, certifications: ['CE'] },
  { id: 'f7', slug: 'vitalis-bp-guard', name: 'Vitalis BP Guard', category: 'monitoring', price: 119, currency: 'USD', shortDescription: 'Upper-arm blood pressure monitor with AFib detection.', rating: 4.7, certifications: ['CE', 'FDA listed'] },
  { id: 'f8', slug: 'orthoflex-recovery-brace', name: 'OrthoFlex Recovery Brace', category: 'recovery', price: 210, currency: 'USD', shortDescription: 'Post-operative knee brace with graduated range-of-motion lock.', rating: 4.6, certifications: ['CE'] },
]

function money(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

export default function Products() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | fallback
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    fetchProducts({ signal: controller.signal })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.products ?? [])
        setItems(list.length ? list : FALLBACK)
        setStatus(list.length ? 'ready' : 'fallback')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setItems(FALLBACK)
        setStatus('fallback')
      })
    return () => controller.abort()
  }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((p) => {
      const inCategory = category === 'all' || p.category === category
      const inSearch = !q || `${p.name} ${p.shortDescription ?? ''}`.toLowerCase().includes(q)
      return inCategory && inSearch
    })
  }, [items, category, search])

  return (
    <>
      <PageHeader
        tag="Product catalogue"
        title="Premium healthcare products,"
        highlight="fully documented."
        copy="Monitoring, diagnostics, respiratory and recovery equipment — each listing ships with conformity certificates, calibration records and clinician-led onboarding."
      />

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-shell">
          {/* Filter + search controls */}
          <div className="glass flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                    category === c.id
                      ? 'bg-neon-cyan text-void glow-cyan'
                      : 'border border-white/10 text-white/60 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="relative lg:w-72">
              <span className="sr-only">Search products</span>
              <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                id="product-search"
                name="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalogue…"
                className="glass h-11 w-full rounded-xl pl-10 pr-4 text-sm placeholder:text-white/30 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30"
              />
            </label>
          </div>

          {status === 'fallback' && (
            <p className="mt-4 flex items-center gap-2 text-xs text-amber-300/80">
              <AlertTriangle className="h-4 w-4" /> Showing sample catalogue — connect the API (run <code className="font-mono">vercel dev</code>) for live data.
            </p>
          )}

          {status === 'loading' ? (
            <div className="mt-16 flex justify-center text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <GlassCard key={p.id ?? p.slug} delay={Math.min(i * 0.05, 0.3)} className="flex flex-col">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="mb-4 h-40 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {p.category}
                    </span>
                    {p.badge && (
                      <span className="rounded-full bg-neon-violet/15 px-3 py-1 text-[11px] font-medium text-neon-magenta">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-display text-xl font-semibold">{p.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{p.shortDescription}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(p.certifications ?? []).map((cert) => (
                      <span key={cert} className="inline-flex items-center gap-1 text-[11px] text-neon-ice/80">
                        <ShieldCheck className="h-3.5 w-3.5" /> {cert}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                    <span className="font-display text-lg font-semibold">{money(Number(p.price), p.currency)}</span>
                    {p.rating && (
                      <span className="flex items-center gap-1 text-sm text-white/55">
                        <Star className="h-4 w-4 fill-neon-cyan text-neon-cyan" /> {Number(p.rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  <Link to="/contact" className={`${glowButtonClasses('ghost', 'sm')} mt-5 w-full`}>
                    Request a quote
                  </Link>
                </GlassCard>
              ))}
            </div>
          )}

          {status !== 'loading' && visible.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-16 text-center text-white/45"
            >
              No products match that filter.
            </motion.p>
          )}
        </div>
      </section>
    </>
  )
}
