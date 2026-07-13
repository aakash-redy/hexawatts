'use client';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { buildTrackCurve } from './trackData';

/**
 * ProgressLine — Animated electric lightning-blue progress overlay.
 * Uses Additive Blending and high-frequency shaders to simulate a plasma/energy trail.
 */

const vertexShader = `
  attribute float curveT;
  varying float vT;
  void main() {
    vT = curveT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderBright = `
  uniform float uProgress;
  uniform vec3 uColor;
  uniform float uTime;
  varying float vT;

  void main() {
    // Discard fragments ahead of the car
    if (vT > uProgress) discard;

    // Distance from the "head" of the car
    float dist = uProgress - vT;
    
    // Intense white-hot glow at the very front
    float frontGlow = smoothstep(0.04, 0.0, dist);

    // Fast, sharp electrical pulse/crackle math
    float fastPulse = abs(sin(uTime * 20.0 - vT * 150.0));
    float slowPulse = sin(uTime * 4.0 + vT * 20.0) * 0.5 + 0.5;
    float electricity = mix(slowPulse, fastPulse, 0.7);

    // Fade out slightly towards the tail, but keep it energetic
    float baseAlpha = 0.5 + (electricity * 0.5) + frontGlow;

    // The core is blue, but spikes to pure white during electrical surges and at the head
    vec3 finalColor = mix(uColor, vec3(1.0), frontGlow * 0.9 + electricity * 0.4);

    gl_FragColor = vec4(finalColor, baseAlpha);
  }
`;

const fragmentShaderGlow = `
  uniform float uProgress;
  uniform vec3 uColor;
  uniform float uTime;
  varying float vT;

  void main() {
    if (vT > uProgress) discard;

    float dist = uProgress - vT;
    float frontGlow = smoothstep(0.08, 0.0, dist);

    // Subtle, fast flicker in the outer aura
    float flicker = sin(uTime * 30.0) * 0.1 + 0.9;
    float alpha = (0.15 + frontGlow * 0.3) * flicker;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function createGeometryWithT(curve, radius, segments, radialSegments) {
  const tubeGeo = new THREE.TubeGeometry(curve, segments, radius, radialSegments, true);
  const count = tubeGeo.attributes.position.count;
  const curveTs = new Float32Array(count);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    for (let j = 0; j <= radialSegments; j++) {
      const idx = i * (radialSegments + 1) + j;
      if (idx < count) {
        curveTs[idx] = t;
      }
    }
  }

  tubeGeo.setAttribute('curveT', new THREE.BufferAttribute(curveTs, 1));
  return tubeGeo;
}

export default function ProgressLine({ progress = 0 }) {
  const brightMatRef = useRef();
  const glowMatRef = useRef();
  const curve = useMemo(() => buildTrackCurve(), []);

  // Inner bright plasma core (slightly thinner for a sharper lightning look).
  // Empty deps: build once. With 500 segs x 12 radial, rebuild cost = ~6,600 verts.
  const brightGeometry = useMemo(
    () => createGeometryWithT(curve, 0.25, 500, 12),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Outer electric aura. Empty deps: 300 x 10 = ~3,000 verts built once.
  const glowGeometry = useMemo(
    () => createGeometryWithT(curve, 0.9, 300, 10),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Animate uniforms
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    [brightMatRef, glowMatRef].forEach((ref) => {
      if (ref.current) {
        ref.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
          ref.current.uniforms.uProgress.value,
          progress,
          0.05 // Slightly faster lerp so the lightning snaps to position quicker
        );
        ref.current.uniforms.uTime.value = t;
      }
    });
  });

  // Hardcoded to Hexawatts Lightning Blue
  const brightUniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color('#42AACC') }, 
    uTime: { value: 0 },
  }), []);

  const glowUniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color('#42AACC') },
    uTime: { value: 0 },
  }), []);

  return (
    <group>
      {/* Outer glow layer */}
      <mesh geometry={glowGeometry}>
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShaderGlow}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending} // CRITICAL: Makes the light stack and glow
        />
      </mesh>

      {/* Inner bright lightning line */}
      <mesh geometry={brightGeometry}>
        <shaderMaterial
          ref={brightMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShaderBright}
          uniforms={brightUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending} // CRITICAL: Burns bright white when overlapping
        />
      </mesh>
    </group>
  );
}