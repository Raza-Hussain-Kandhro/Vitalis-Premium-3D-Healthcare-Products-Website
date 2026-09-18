import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Lock, Menu, X } from 'lucide-react'
import { EASE, NAV_LINKS } from '../../lib/constants'
import { Logo, glowButtonClasses } from './ui-bits'

/**
 * Floating pill navbar — identical on every route (consistent navigation).
 * Transparent at the top of the page, condenses into frosted glass after ~32px.
 */
export default function Navbar({ ready }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 32))

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-shell px-4 pt-4 sm:px-6">
        <nav
          aria-label="Primary"
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
            scrolled || open ? 'glass-strong' : 'border border-transparent'
          }`}
        >
          <Link to="/" aria-label="Vitalis — home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:block">
            <Link to="/contact" className={glowButtonClasses('primary', 'sm')}>
              Book a consult
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/admin/login"
              aria-label="Admin login"
              className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:text-white"
            >
              <Lock className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="glass flex h-10 w-10 items-center justify-center rounded-xl text-white"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="glass-strong mt-2 rounded-2xl p-3 md:hidden"
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className={`${glowButtonClasses('primary', 'sm')} mt-2 w-full`}
              >
                Book a consult <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
