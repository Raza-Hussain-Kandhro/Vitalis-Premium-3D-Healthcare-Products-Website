import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { EASE } from '../../lib/constants'

/** Brand lockup — icon mark + wordmark. Wrap in a link where needed. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet text-void">
        <Activity className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="font-display text-lg font-semibold tracking-wide">Vitalis</span>
    </span>
  )
}

/** Small glowing section label, e.g. "CORE FEATURES". */
export function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.07] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-neon-ice">
      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]" />
      {children}
    </span>
  )
}

/** Shared button classes so <a> and <button> stay visually identical. */
export function glowButtonClasses(variant = 'primary', size = 'md') {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan'
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-sm',
  }
  const variants = {
    primary: 'glow-cyan bg-neon-cyan text-void hover:bg-neon-ice',
    ghost: 'glass text-white hover:border-white/30 hover:bg-white/10',
  }
  return `${base} ${sizes[size]} ${variants[variant]}`
}

/** Polymorphic glowing button. Defaults to an anchor. */
export function GlowButton({ as: Tag = 'a', variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <Tag className={`${glowButtonClasses(variant, size)} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

/** Icon in a soft neon tile, used at the top of feature cards. */
export function IconBadge({ icon: Icon, className = '' }) {
  return (
    <div
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neon-cyan/20 bg-neon-cyan/[0.08] text-neon-cyan ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </div>
  )
}

/**
 * Glassmorphism card with scroll-reveal and a hover sheen.
 * The translucent backdrop lets the 3D canvas bleed through.
 */
export function GlassCard({ className = '', children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      whileHover={{ y: -5 }}
      className={`glass group relative overflow-hidden rounded-2xl p-7 transition-colors duration-300 hover:border-neon-cyan/30 sm:p-8 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_30%_-10%,rgba(34,211,238,0.12),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
