import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Play, ShieldCheck } from 'lucide-react'
import { GlowButton, SectionTag } from './ui-bits'

const PROOF_POINTS = ['HIPAA-ready', 'SOC 2 Type II', '99.99% uptime']

/**
 * Hero — bold display type over the live 3D scene.
 *  - GSAP timeline plays the staggered entrance once the loader clears
 *  - framer-motion useScroll fades/translates the copy away as you scroll
 *  - the DNA helix + HeartCore float behind on the fixed canvas
 */
export default function Hero({ ready }) {
  const root = useRef(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.14], [0, -70])

  // Entrance timeline (GSAP). Elements stay visible by default so the
  // page is fine without JS animation; gsap.from() only rewinds then plays.
  useLayoutEffect(() => {
    if (!ready) return undefined
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero="tag"]', { y: 24, autoAlpha: 0, duration: 0.7 })
        .from('[data-hero="line"]', { y: 64, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, '-=0.35')
        .from('[data-hero="sub"]', { y: 24, autoAlpha: 0, duration: 0.7 }, '-=0.5')
        .from('[data-hero="cta"]', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, '-=0.45')
        .from('[data-hero="proof"]', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.06 }, '-=0.4')
        .from('[data-hero="scroll"]', { autoAlpha: 0, duration: 0.8 }, '-=0.2')
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <section id="platform" ref={root} className="relative flex min-h-screen items-center overflow-hidden">
      <motion.div style={{ opacity, y }} className="mx-auto w-full max-w-shell px-6 pb-24 pt-32">
        <div className="max-w-2xl">
          <div data-hero="tag">
            <SectionTag>AI-powered care platform</SectionTag>
          </div>

          <h1 className="mt-7 font-display text-5xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
            <span data-hero="line" className="block">
              Intelligent care,
            </span>
            <span data-hero="line" className="text-gradient block">
              rendered live.
            </span>
          </h1>

          <p data-hero="sub" className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-white/60">
            Vitalis fuses real-time patient vitals, predictive AI, and immersive 3D visualization into one
            seamless platform — so care teams see around corners.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <GlowButton data-hero="cta" href="#contact">
              Get early access <ArrowRight className="h-4 w-4" />
            </GlowButton>
            <GlowButton data-hero="cta" href="#technology" variant="ghost">
              <Play className="h-4 w-4" /> Watch the system
            </GlowButton>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-sm text-white/45">
            {PROOF_POINTS.map((item) => (
              <span key={item} data-hero="proof" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neon-cyan" strokeWidth={1.8} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll cue — fades out with the hero copy */}
      <motion.div style={{ opacity }} className="absolute bottom-7 left-1/2 -translate-x-1/2">
        <div data-hero="scroll" className="flex flex-col items-center gap-3 text-white/40">
          <span className="text-[11px] uppercase tracking-[0.3em]">Scroll to explore</span>
          <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </div>
      </motion.div>
    </section>
  )
}
