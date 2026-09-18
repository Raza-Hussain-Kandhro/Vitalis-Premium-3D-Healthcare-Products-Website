import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { fetchGallery } from '../services/api'
import { EASE } from '../lib/constants'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'facility', label: 'Facilities' },
  { id: 'product', label: 'Products' },
  { id: 'deployment', label: 'Deployments' },
]

/** Gradient-tile fallback so the gallery renders with zero external assets. */
const FALLBACK = [
  { id: 'g1', title: 'ICU monitoring wall', category: 'deployment', caption: 'Twelve-bed ICU retrofit, Aga Khan Hospital', tone: 'from-neon-cyan/30 to-neon-violet/20' },
  { id: 'g2', title: 'Pulse Pro line', category: 'product', caption: 'Bench calibration of the Pulse Pro series', tone: 'from-neon-violet/30 to-neon-cyan/10' },
  { id: 'g3', title: 'Cold-chain warehouse', category: 'facility', caption: 'Temperature-mapped storage, Karachi hub', tone: 'from-sky-400/25 to-neon-cyan/10' },
  { id: 'g4', title: 'Home-care kit', category: 'product', caption: 'Discharge-to-home respiratory bundle', tone: 'from-fuchsia-400/25 to-neon-violet/10' },
  { id: 'g5', title: 'Diagnostics lab', category: 'facility', caption: 'ECG intake and QA station', tone: 'from-emerald-300/20 to-neon-cyan/10' },
  { id: 'g6', title: 'Rural clinic rollout', category: 'deployment', caption: 'Six-site vitals deployment, Sindh', tone: 'from-indigo-400/25 to-neon-violet/10' },
  { id: 'g7', title: 'Sterile packaging', category: 'facility', caption: 'Consumables packed to ISO 11607', tone: 'from-cyan-300/25 to-blue-500/10' },
  { id: 'g8', title: 'Recovery range', category: 'product', caption: 'OrthoFlex bracing photography set', tone: 'from-purple-400/25 to-neon-cyan/10' },
]

export default function Gallery() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchGallery({ signal: controller.signal })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.items ?? [])
        setItems(list.length ? list : FALLBACK)
        setStatus('ready')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setItems(FALLBACK)
        setStatus('ready')
      })
    return () => controller.abort()
  }, [])

  // Close the lightbox on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <>
      <PageHeader
        tag="Gallery"
        title="Inside our facilities and"
        highlight="field deployments."
        copy="Warehouse, calibration bench and live installations — a look at how Vitalis products are stored, tested and put to work."
      />

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-shell">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                  filter === f.id
                    ? 'bg-neon-cyan text-void glow-cyan'
                    : 'border border-white/10 text-white/60 hover:border-white/25 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {status === 'loading' ? (
            <div className="mt-16 flex justify-center text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((item, i) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    layout
                    onClick={() => setActive(item)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.24), ease: EASE }}
                    whileHover={{ y: -6 }}
                    className="glass group relative aspect-[4/3] overflow-hidden rounded-2xl text-left"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${item.tone ?? 'from-neon-cyan/25 to-neon-violet/15'}`}>
                        <div className="bg-grid h-full w-full opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/70 to-transparent p-5">
                      <p className="font-display text-base font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-white/50">{item.caption}</p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-void/85 p-6 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-3xl overflow-hidden rounded-3xl"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="glass absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
              {active.imageUrl ? (
                <img src={active.imageUrl} alt={active.title} className="max-h-[70vh] w-full object-cover" />
              ) : (
                <div className={`aspect-video w-full bg-gradient-to-br ${active.tone ?? 'from-neon-cyan/30 to-neon-violet/20'}`}>
                  <div className="bg-grid h-full w-full opacity-40" />
                </div>
              )}
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold">{active.title}</h2>
                <p className="mt-2 text-sm text-white/55">{active.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
