import { motion } from 'framer-motion'
import { Activity, BrainCircuit, Radio, ShieldCheck, Zap } from 'lucide-react'
import { GlassCard, IconBadge, SectionTag } from './ui-bits'
import { EASE } from '../../lib/constants'

/** Animated ECG trace used inside the "Real-Time Vitals" card. */
function EcgTrace() {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-white/5 bg-void/60 p-4">
      <svg viewBox="0 0 320 80" className="h-20 w-full" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="ecg-gradient" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path
          className="ecg-path"
          d="M0 40 H56 L70 40 80 16 92 64 102 40 H138 L150 40 158 6 170 70 180 40 H224 L236 40 244 24 254 56 262 40 H320"
          stroke="url(#ecg-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-white/40">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan" />
          Live · Bed 12
        </span>
        <span className="font-mono text-neon-ice">72 BPM</span>
      </div>
    </div>
  )
}

/**
 * Core Features — glassmorphism bento grid over a gradient that
 * smoothly closes the 3D scene out (the "back to 2D" transition).
 */
export default function Features() {
  return (
    <section id="features" className="relative bg-gradient-to-b from-transparent via-abyss/90 to-abyss pb-28 pt-32">
      <div className="mx-auto max-w-shell px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-2xl"
        >
          <SectionTag>Core Features</SectionTag>
          <h2 className="mt-6 text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Everything care teams need. <span className="text-gradient">Nothing they don't.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/55">
            One live platform from sensor to decision — engineered for clinicians, tuned for speed.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6">
          <GlassCard className="md:col-span-4" delay={0}>
            <IconBadge icon={Activity} />
            <h3 className="mt-5 font-display text-xl font-semibold">Real-Time Vitals Stream</h3>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/55">
              Sub-second ECG, SpO₂ and telemetry from every connected bed — rendered as one continuous,
              queryable stream.
            </p>
            <EcgTrace />
          </GlassCard>

          <GlassCard className="md:col-span-2" delay={0.08}>
            <IconBadge icon={BrainCircuit} />
            <h3 className="mt-5 font-display text-xl font-semibold">Predictive Diagnostics</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-white/55">
              Deterioration risk flagged hours before symptoms surface, ranked by confidence.
            </p>
            <div className="mt-7">
              <div className="text-gradient font-display text-4xl font-bold">94.6%</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">Early-warning precision</div>
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-2" delay={0.05}>
            <IconBadge icon={ShieldCheck} />
            <h3 className="mt-5 font-display text-xl font-semibold">Zero-Trust Security</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-white/55">
              Row-level access controls and end-to-end encryption, on by default.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {['HIPAA', 'GDPR', 'SOC 2'].map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {badge}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-2" delay={0.1}>
            <IconBadge icon={Zap} />
            <h3 className="mt-5 font-display text-xl font-semibold">Smart Triage Automation</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-white/55">
              Queues re-prioritize themselves as patient risk shifts in real time — no manual sorting.
            </p>
          </GlassCard>

          <GlassCard className="md:col-span-2" delay={0.15}>
            <IconBadge icon={Radio} />
            <h3 className="mt-5 font-display text-xl font-semibold">Care Anywhere</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-white/55">
              Ward, ambulance, living room — the same live picture follows every patient.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
