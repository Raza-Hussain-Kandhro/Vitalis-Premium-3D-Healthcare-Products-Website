import { useEffect, useState } from 'react'

const DESKTOP = {
  isMobile: false,
  reducedMotion: false,
  dpr: [1, 2],
  particles: 3200,
  helixPoints: 240,
}

function compute() {
  if (typeof window === 'undefined') return DESKTOP
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 768
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const low = coarse || narrow

  return {
    isMobile: low,
    reducedMotion,
    // Mobile: cap DPR at 1.5 and shrink geometry budgets → zero-lag guarantee
    dpr: low ? [1, 1.5] : [1, 2],
    particles: low ? 900 : 3200,
    helixPoints: low ? 120 : 240,
  }
}

/**
 * Detects device capability so the 3D scene can adapt budgets
 * (particle counts, pixel ratio) before the canvas ever mounts.
 */
export function useDeviceTier() {
  const [state, setState] = useState(compute)

  useEffect(() => {
    const onResize = () => setState(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return state
}
