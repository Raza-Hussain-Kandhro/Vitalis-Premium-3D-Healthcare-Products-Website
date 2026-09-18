import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '../../lib/constants'
import { scrollStore } from '../../lib/scrollStore'

const vertexShader = /* glsl */ `
attribute float aScale;
attribute float aMix;
uniform float uTime;
uniform float uSize;
varying float vMix;
varying float vFade;
void main() {
  vMix = aMix;
  vec3 p = position;
  float breathe = 1.0 + 0.05 * sin(uTime * 0.35 + aMix * 6.2831);
  p *= breathe;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aScale * uSize * (12.0 / -mvPosition.z);
  vFade = smoothstep(27.0, 9.0, -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vMix;
varying float vFade;
void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  float alpha = smoothstep(0.5, 0.04, dist) * vFade * 0.8;
  vec3 color = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(color, alpha);
}
`

/**
 * Ambient particle nebula — one THREE.Points draw call with a custom
 * shader. Rotates gently on its own and swirls harder while the
 * showcase section scrolls. Particle budget adapts per device tier.
 */
export default function ParticleField({ device }) {
  const points = useRef()
  const count = device.particles

  const { positions, scales, mixes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const mixes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Flattened spherical shell — reads as depth behind the models
      const r = 6 + Math.pow(Math.random(), 0.6) * 9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.62
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      scales[i] = 0.4 + Math.random() * 1.6
      mixes[i] = Math.random()
    }
    return { positions, scales, mixes }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 8 },
      uColorA: { value: new THREE.Color(COLORS.cyan) },
      uColorB: { value: new THREE.Color(COLORS.violet) },
    }),
    [],
  )

  useFrame(({ clock, gl }, delta) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uSize.value = (device.isMobile ? 5.5 : 7.5) * gl.getPixelRatio()
    if (points.current && !device.reducedMotion) {
      points.current.rotation.y += delta * (0.016 + scrollStore.showcase * 0.22)
    }
  })

  return (
    // key forces a clean buffer rebuild if the device tier changes the budget
    <points key={count} ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" count={count} array={scales} itemSize={1} />
        <bufferAttribute attach="attributes-aMix" count={count} array={mixes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
