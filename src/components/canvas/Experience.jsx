import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneRig from './SceneRig'
import ParticleField from './ParticleField'
import DNAHelix from './DNAHelix'
import HeartCore from './HeartCore'
import { COLORS } from '../../lib/constants'

/**
 * The single fullscreen WebGL canvas that lives behind the whole page.
 * Fixed position, pointer-events disabled — all interaction data arrives
 * through the scroll/pointer stores, so DOM content stays fully interactive.
 */
export default function Experience({ device, onReady }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={device.dpr}
        camera={{ position: [0, 0.6, 9], fov: 42, near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(COLORS.void, 0)
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            window.dispatchEvent(new CustomEvent('vitalis:gl-context-lost'))
          })
          requestAnimationFrame(() => onReady?.())
        }}
      >
        {/* Depth cueing: distant geometry dissolves into the void */}
        <fog attach="fog" args={[COLORS.void, 11, 27]} />

        {/* Lighting rig — cool key light, violet rim */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 8, 4]} intensity={1.1} color={COLORS.ice} />
        <pointLight position={[-6, -3, -4]} intensity={140} distance={22} decay={2} color={COLORS.violet} />

        <Suspense fallback={null}>
          <SceneRig device={device}>
            <ParticleField device={device} />
            <DNAHelix device={device} />
            <HeartCore device={device} />
          </SceneRig>
        </Suspense>
      </Canvas>
    </div>
  )
}
