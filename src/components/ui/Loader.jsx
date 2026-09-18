import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

/**
 * Boot loader — covers the screen until the WebGL scene reports ready
 * (and a minimum dwell time has passed), then fades out and unmounts.
 *
 * NOTE: geometry here is procedural, so there are no async GLTF assets.
 * When you add real 3D assets, swap the `done` prop for drei's
 * <Loader /> / useProgress() — the overlay contract stays the same.
 */
export default function Loader({ done }) {
  const [minElapsed, setMinElapsed] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const finished = done && minElapsed

  useEffect(() => {
    if (!finished) return undefined
    const timer = setTimeout(() => setHidden(true), 750) // match the fade duration
    return () => clearTimeout(timer)
  }, [finished])

  if (hidden) return null

  return (
    <div
      role="status"
      aria-label="Loading the Vitalis experience"
      className={`fixed inset-0 z-[100] grid place-items-center bg-void transition-opacity duration-700 ${
        finished ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="glass relative grid h-16 w-16 place-items-center rounded-2xl">
          <Activity className="h-7 w-7 text-neon-cyan" strokeWidth={2} />
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl" />
        </div>
        <div className="font-display text-xl font-semibold tracking-[0.4em] text-white/90">VITALIS</div>
        <div className="h-px w-44 overflow-hidden bg-white/10">
          <div className="h-full w-full animate-shimmer bg-gradient-to-r from-neon-cyan to-neon-violet [background-size:200%_100%]" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Calibrating vitals</p>
      </div>
    </div>
  )
}
