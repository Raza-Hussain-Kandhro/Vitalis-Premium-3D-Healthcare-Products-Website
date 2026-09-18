import { forwardRef, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { Activity, BrainCircuit, HeartPulse } from 'lucide-react'

const STEPS = [
  {
    icon: Activity,
    kicker: 'Living Data',
    title: 'Every heartbeat, streamed.',
    copy: 'Vitals flow in as living geometry — continuous, contextual, and queryable the instant they change.',
    tags: ['ECG', 'SpO₂', 'Telemetry'],
  },
  {
    icon: BrainCircuit,
    kicker: 'Predictive Core',
    title: 'AI that sees around corners.',
    copy: 'Models flag deterioration risk hours before symptoms surface, ranked by confidence and clinical context.',
    tags: ['Risk scoring', 'Early warning'],
  },
  {
    icon: HeartPulse,
    kicker: 'Precision at Scale',
    title: 'ICU to home, one thread of care.',
    copy: 'The same live picture follows every patient — ward, ambulance, living room.',
    tags: ['Care continuum', 'Edge sync'],
  },
]

/**
 * One narrative step of the showcase. Crossfades + drifts based on the
 * section's scroll progress; the 3D scene behind morphs in parallel
 * (driven by scrollStore.showcase inside the canvas components).
 */
function Step({ step, index, total, progress }) {
  const fade = 0.05
  const start = index / total
  const end = (index + 1) / total
  const first = index === 0
  const last = index === total - 1
  const range = [first ? 0 : start - fade, start + fade, end - fade, last ? 1 : end + fade]

  const opacity = useTransform(progress, range, [first ? 1 : 0, 1, 1, last ? 1 : 0])
  const y = useTransform(progress, range, [first ? 0 : 26, 0, 0, last ? 0 : -26])

  const Icon = step.icon

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <motion.div style={{ opacity, y }} className="glass relative rounded-2xl p-7 sm:p-8">
        <Icon className="absolute right-6 top-6 h-6 w-6 text-neon-cyan/50" strokeWidth={1.6} />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-neon-cyan/80">0{index + 1}</span>
          <span className="text-xs uppercase tracking-[0.28em] text-white/40">{step.kicker}</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">{step.copy}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {step.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function ProgressDots({ progress, total }) {
  const [active, setActive] = useState(0)
  useMotionValueEvent(progress, 'change', (v) => setActive(Math.min(total - 1, Math.floor(v * total))))

  return (
    <div className="mt-7 flex items-center gap-2" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === active ? 'w-8 bg-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-3 bg-white/15'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * Interactive 3D Showcase — a 340vh section with a sticky viewport.
 * Scrolling crossfades the story cards while the fixed canvas behind
 * rotates, dollies in, and accelerates the helix + particle swirl.
 */
const Showcase = forwardRef(function Showcase(_, outerRef) {
  const innerRef = useRef(null)
  const setRefs = (el) => {
    innerRef.current = el
    if (typeof outerRef === 'function') outerRef(el)
    else if (outerRef) outerRef.current = el
  }

    const { scrollYProgress } = useScroll({ target: innerRef, offset: ['start start', 'end end'], layoutEffect: false })

  return (
    <section id="technology" ref={setRefs} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-shell grid-cols-1 items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <p className="mb-7 text-xs uppercase tracking-[0.35em] text-neon-cyan/80">The Technology</p>
            <div className="relative h-[380px] sm:h-[340px]">
              {STEPS.map((step, i) => (
                <Step key={step.kicker} step={step} index={i} total={STEPS.length} progress={scrollYProgress} />
              ))}
            </div>
            <ProgressDots progress={scrollYProgress} total={STEPS.length} />
          </div>
          {/* The 3D scene occupies the right half — it shows through */}
          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
})

export default Showcase
