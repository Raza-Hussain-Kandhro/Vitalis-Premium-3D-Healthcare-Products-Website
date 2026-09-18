import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { pointerStore, scrollStore } from '../../lib/scrollStore'

/**
 * Camera + scene-level animation rig.
 * Reads scroll/pointer stores every frame (no React re-renders) and drives:
 *  - pointer parallax on the camera
 *  - a slow dolly-in while the technology showcase scrolls
 *  - a global scene drift so the hero and showcase feel connected
 */
export default function SceneRig({ children, device }) {
  const group = useRef()

  useFrame(({ camera }, delta) => {
    const damp = Math.min(delta * 3.2, 1)
    const progress = scrollStore.progress
    const showcase = scrollStore.showcase

    // Decay pointer "energy" back to rest every frame
    pointerStore.energy += (0 - pointerStore.energy) * Math.min(delta * 2.2, 1)

    const px = device.reducedMotion ? 0 : pointerStore.x
    const py = device.reducedMotion ? 0 : pointerStore.y

    camera.position.x += (px * 0.55 - camera.position.x) * damp
    camera.position.y += (0.6 + py * 0.35 - progress * 1.1 - camera.position.y) * damp
    camera.position.z += (9 - showcase * 1.6 - camera.position.z) * damp
    camera.lookAt(0, 0.35, 0)

    if (group.current && !device.reducedMotion) {
      group.current.rotation.y = showcase * Math.PI * 0.9
      group.current.position.y = showcase * 0.6
    }
  })

  return <group ref={group}>{children}</group>
}
