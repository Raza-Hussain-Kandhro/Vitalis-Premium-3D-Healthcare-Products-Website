import { Link } from 'react-router-dom'
import { glowButtonClasses } from '../components/ui/ui-bits'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center px-6 pt-32">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-mono text-sm text-neon-cyan">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">This page has no pulse.</h1>
        <p className="mt-4 text-white/50">The link you followed may be retired or mistyped.</p>
        <Link to="/" className={`${glowButtonClasses('primary')} mt-8`}>
          Back to home
        </Link>
      </div>
    </section>
  )
}
