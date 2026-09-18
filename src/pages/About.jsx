import { motion } from 'framer-motion'
import { Award, HeartPulse, Microscope, ShieldCheck, Truck, Users } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { GlassCard, IconBadge, SectionTag } from '../components/ui/ui-bits'
import { EASE } from '../lib/constants'

const VALUES = [
  {
    icon: Microscope,
    title: 'Clinically validated',
    copy: 'Every device is bench-tested against IEC 60601 safety limits before it reaches a catalogue page.',
  },
  {
    icon: ShieldCheck,
    title: 'Regulatory first',
    copy: 'CE-marked, FDA-listed and ISO 13485 manufacturing partners only — documentation travels with the order.',
  },
  {
    icon: Truck,
    title: 'Cold-chain logistics',
    copy: 'Temperature-controlled fulfilment with serialised tracking from warehouse to ward.',
  },
  {
    icon: Users,
    title: 'Clinician-led support',
    copy: 'Biomedical engineers and nurses staff our support desk — not a generic call centre.',
  },
]

const TIMELINE = [
  { year: '2019', title: 'Founded in Karachi', copy: 'Started as a three-person biomedical import desk serving two private hospitals.' },
  { year: '2021', title: 'ISO 13485 partner network', copy: 'Onboarded certified manufacturers across Germany, Japan and South Korea.' },
  { year: '2023', title: 'Connected device line', copy: 'Launched our Bluetooth vitals range with a companion telemetry dashboard.' },
  { year: '2026', title: '340+ care facilities', copy: 'Equipment and consumables now flow to hospitals, clinics and home-care networks.' },
]

export default function About() {
  return (
    <>
      <PageHeader
        tag="About Vitalis"
        title="Medical-grade products,"
        highlight="human-grade care."
        copy="Vitalis supplies premium diagnostic, monitoring and recovery products to hospitals, clinics and home-care teams — backed by clinical validation, full documentation and engineers who answer the phone."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-shell gap-6 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <GlassCard key={value.title} delay={i * 0.08}>
              <IconBadge icon={value.icon} />
              <h3 className="mt-6 font-display text-lg font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{value.copy}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="relative bg-abyss/80 px-6 py-24">
        <div className="mx-auto max-w-shell">
          <SectionTag>Our story</SectionTag>
          <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Seven years of getting the <span className="text-gradient">details right.</span>
          </h2>

          <ol className="mt-14 space-y-4">
            {TIMELINE.map((item, i) => (
              <motion.li
                key={item.year}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
                className="glass flex flex-col gap-2 rounded-2xl p-6 sm:flex-row sm:items-center sm:gap-8"
              >
                <span className="font-mono text-sm text-neon-cyan sm:w-20">{item.year}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">{item.copy}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-shell gap-6 md:grid-cols-3">
          {[
            { icon: HeartPulse, stat: '340+', label: 'Care facilities served' },
            { icon: Award, stat: '18', label: 'Certified manufacturing partners' },
            { icon: ShieldCheck, stat: '99.2%', label: 'On-time cold-chain delivery' },
          ].map((item, i) => (
            <GlassCard key={item.label} delay={i * 0.08} className="text-center">
              <IconBadge icon={item.icon} className="mx-auto" />
              <p className="mt-6 font-display text-4xl font-bold text-gradient">{item.stat}</p>
              <p className="mt-2 text-sm text-white/50">{item.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </>
  )
}
