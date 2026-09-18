import { motion } from 'framer-motion'
import { EASE } from '../../lib/constants'
import { SectionTag } from './ui-bits'

/** Consistent premium page header used by every inner route. */
export default function PageHeader({ tag, title, highlight, copy }) {
  return (
    <header className="relative overflow-hidden px-6 pb-16 pt-36 sm:pt-40">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 mask-fade-b" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-neon-cyan/10 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto max-w-shell"
      >
        {tag && <SectionTag>{tag}</SectionTag>}
        <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h1>
        {copy && <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">{copy}</p>}
      </motion.div>
    </header>
  )
}
