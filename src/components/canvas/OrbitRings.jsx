import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { COLORS } from '../../lib/constants'
import { pointerStore } from '../../lib/scrollStore'

/**
 * Two hairline torus rings orbiting the HeartCore.
 * Spin accelerates with pointer energy for a tactile "hover" feel.
 */
export default function OrbitRings({ reducedMotion }) {
  const ringA = useRef()
  const ringB = useRef()

  useFrame((_, delta) => {
    const speed = reducedMotion ? 0.05 : 0.25 + pointerStore.energy * 0.9
    if (ringA.current) {
      ringA.current.rotation.x += delta * speed
      ringA.current.rotation.y += delta * speed * 0.6
    }
    if (ringB.current) {
      ringB.current.rotation.y -= delta * speed * 0.8
      ringB.current.rotation.z += delta * speed * 0.5
    }
  })

  return (
    <group rotation={[0.5, 0, 0.35]}>
      <mesh ref={ringA}>
        <torusGeometry args={[1.85, 0.012, 8, 128]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[2.3, 0.008, 8, 128]} />
        <meshBasicMaterial color={COLORS.violet} transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  )
}
