import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import { EASE } from '../../lib/constants'

const STATS = [
  { value: 99.99, decimals: 2, suffix: '%', label: 'Platform uptime' },
  { value: 120, decimals: 0, prefix: '<', suffix: 'ms', label: 'Alert latency' },
  { value: 4.2, decimals: 1, suffix: 'M', label: 'Vitals streamed daily' },
  { value: 38, decimals: 0, suffix: '%', label: 'Faster triage' },
]

/** Counts up from zero the first time it scrolls into view. */
function Counter({ value, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(() => (0).toFixed(decimals))

  useEffect(() => {
    if (!inView) return undefined
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [inView, value, decimals])

  return (
    <span ref={ref} className="text-gradient">
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/** Metrics band between the bento grid and the CTA. */
export default function Stats() {
  return (
    <section className="relative border-y border-white/5 bg-abyss/80 py-16 backdrop-blur-sm">
      <div className="mx-auto grid max-w-shell grid-cols-2 gap-x-6 gap-y-10 px-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
            className="text-center md:text-left"
          >
            <div className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              <Counter {...stat} />
            </div>
            <div className="mt-2 text-sm text-white/45">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
