import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, SCENE } from '../../lib/constants'
import { pointerStore, scrollStore } from '../../lib/scrollStore'
import OrbitRings from './OrbitRings'

/* Ashima / Ian McEwan simplex noise (standard MIT-licensed GLSL) */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uBeat;
uniform float uEnergy;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vNoise;
${NOISE_GLSL}
void main() {
  float n = snoise(normalize(position) * 2.3 + vec3(0.0, uTime * 0.28, uTime * 0.12));
  vNoise = n;
  float amp = 0.09 + uEnergy * 0.22 + uBeat * 0.08;
  vec3 displaced = position + normal * (n * amp + uBeat * 0.045);
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBeat;
uniform float uEnergy;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vNoise;
void main() {
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.1);
  vec3 base = mix(uColorA, uColorB, clamp(vNoise * 0.5 + 0.5, 0.0, 1.0));
  vec3 color = base * (0.22 + fresnel * (1.45 + uEnergy * 1.1) + uBeat * 0.38);
  gl_FragColor = vec4(color, 1.0);
}
`

/** Classic "lub-dub" heartbeat envelope */
function heartbeat(t) {
  const primary = Math.pow(Math.max(Math.sin(t * 2.1), 0), 10)
  const echo = Math.pow(Math.max(Math.sin(t * 2.1 - 0.5), 0), 18) * 0.55
  return primary + echo
}

/**
 * The Predictive Core — an icosahedron with simplex-noise vertex
 * displacement and a fresnel glow fragment shader. It beats like a
 * heart and flares up when the visitor moves the pointer (hover energy).
 */
export default function HeartCore({ device }) {
  const group = useRef()
  const base = device.isMobile ? SCENE.core.mobile : SCENE.core.desktop
  const scale = device.isMobile ? 0.62 : 1

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBeat: { value: 0 },
      uEnergy: { value: 0 },
      uColorA: { value: new THREE.Color(COLORS.cyan) },
      uColorB: { value: new THREE.Color(COLORS.violet) },
    }),
    [],
  )

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const beat = device.reducedMotion ? 0 : heartbeat(t)

    uniforms.uTime.value = t
    uniforms.uBeat.value = beat
    uniforms.uEnergy.value += (pointerStore.energy - uniforms.uEnergy.value) * Math.min(delta * 4, 1)

    if (!group.current) return
    const showcase = scrollStore.showcase
    const pull = device.isMobile ? 0 : 1.9
    group.current.position.x = base[0] + showcase * pull
    group.current.position.y = base[1] + Math.sin(t * 0.5) * 0.12
    group.current.scale.setScalar(scale * (1 + beat * 0.05 + uniforms.uEnergy.value * 0.04))
    group.current.rotation.y += delta * (device.reducedMotion ? 0.04 : 0.18)
  })

  return (
    <group ref={group} position={base} scale={scale}>
      {/* Dark inner core — occludes the glow shell's far side */}
      <mesh>
        <icosahedronGeometry args={[0.94, 24]} />
        <meshStandardMaterial color="#0B0E1C" roughness={0.28} metalness={0.65} />
      </mesh>

      {/* Fresnel glow shell with noise displacement */}
      <mesh>
        <icosahedronGeometry args={[1.16, 24]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <OrbitRings reducedMotion={device.reducedMotion} />
    </group>
  )
}
