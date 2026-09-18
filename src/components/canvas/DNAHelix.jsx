import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, SCENE } from '../../lib/constants'
import { scrollStore } from '../../lib/scrollStore'

const COLOR_A = new THREE.Color(COLORS.cyan)
const COLOR_B = new THREE.Color(COLORS.violet)
const HEIGHT = 7.6
const RADIUS = 1.05
const TURNS = 2.35
const RUNG_EVERY = 8

/**
 * The Vitalis signature model — a DNA double helix built from two
 * InstancedMesh draw calls (spheres + rungs), so the whole structure
 * costs the GPU almost nothing. Instance colors blend cyan → violet.
 */
export default function DNAHelix({ device }) {
  const group = useRef()
  const strandRef = useRef()
  const rungRef = useRef()

  const perStrand = device.helixPoints
  const base = device.isMobile ? SCENE.helix.mobile : SCENE.helix.desktop
  const scale = device.isMobile ? 0.62 : 1

  const { strandData, rungData } = useMemo(() => {
    const dummy = new THREE.Object3D()
    const strand = []
    const rungs = []

    for (let i = 0; i < perStrand; i++) {
      const t = i / (perStrand - 1)
      const angle = t * Math.PI * 2 * TURNS
      const y = (t - 0.5) * HEIGHT
      const color = COLOR_A.clone().lerp(COLOR_B, t)

      for (let s = 0; s < 2; s++) {
        const a = angle + s * Math.PI
        dummy.position.set(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(0.085 + 0.045 * Math.sin(t * Math.PI))
        dummy.updateMatrix()
        strand.push({ matrix: dummy.matrix.clone(), color })
      }

      if (i % RUNG_EVERY === 0) {
        dummy.position.set(0, y, 0)
        dummy.rotation.set(0, -angle, Math.PI / 2)
        dummy.scale.set(0.03, RADIUS * 2, 0.03)
        dummy.updateMatrix()
        rungs.push({ matrix: dummy.matrix.clone(), color: color.clone().multiplyScalar(0.55) })
      }
    }
    return { strandData: strand, rungData: rungs }
  }, [perStrand])

  // Write instance transforms + colors once (geometry is static; the group animates)
  useLayoutEffect(() => {
    const apply = (mesh, data) => {
      if (!mesh) return
      data.forEach(({ matrix, color }, i) => {
        mesh.setMatrixAt(i, matrix)
        mesh.setColorAt(i, color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    apply(strandRef.current, strandData)
    apply(rungRef.current, rungData)
  }, [strandData, rungData])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const showcase = scrollStore.showcase
    group.current.rotation.y += delta * (device.reducedMotion ? 0.06 : 0.22 + showcase * 1.05)
    group.current.position.y = base[1] + Math.sin(clock.elapsedTime * 0.35) * 0.16
    // Drift toward center stage while the technology story scrolls in
    const pull = device.isMobile ? 0 : 1.6
    group.current.position.x = base[0] - showcase * pull
  })

  return (
    <group ref={group} position={base} scale={scale} rotation={[0, 0, 0.1]}>
      <instancedMesh ref={strandRef} args={[undefined, undefined, strandData.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={rungRef} args={[undefined, undefined, rungData.length]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.7} />
      </instancedMesh>
    </group>
  )
}
