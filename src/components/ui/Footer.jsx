import { Github, Linkedin, Twitter } from 'lucide-react'
import { Logo } from './ui-bits'

const COLUMNS = [
  { title: 'Platform', links: ['Vitals Stream', 'Predictive AI', 'Smart Triage', 'Security'] },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
  { title: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Changelog'] },
]

const SOCIALS = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-abyss">
      <div className="mx-auto max-w-shell px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#platform" aria-label="Vitalis — back to top">
              <Logo />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              The AI-powered care platform. Real-time vitals, predictive diagnostics, and immersive data —
              rendered live.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{column.title}</h4>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/45 transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-white/35 sm:flex-row">
          <p>© 2026 Vitalis Health, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-white/70">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white/70">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white/70">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
