/**
 * Mutable, module-level stores shared between React UI (framer-motion)
 * and the R3F render loop.
 *
 * useFrame() reads these directly — no React state, no re-renders,
 * which is how the scene stays at 60 FPS while scrolling.
 */

export const scrollStore = {
  /** Overall page scroll progress, 0 → 1 */
  progress: 0,
  /** Technology/showcase section progress, 0 → 1 */
  showcase: 0,
}

export const pointerStore = {
  /** Normalized pointer position, -1 → 1 on both axes */
  x: 0,
  y: 0,
  /** Rises with pointer movement, decays over time — drives "hover energy" */
  energy: 0,
}

let lastX = null
let lastY = null

/** Attach once from App. Returns cleanup. */
export function bindPointerTracking() {
  const onMove = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -((event.clientY / window.innerHeight) * 2 - 1)
    if (lastX !== null) {
      const dist = Math.hypot(x - lastX, y - lastY)
      pointerStore.energy = Math.min(1, pointerStore.energy + dist * 1.6)
    }
    lastX = x
    lastY = y
    pointerStore.x = x
    pointerStore.y = y
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => window.removeEventListener('pointermove', onMove)
}
