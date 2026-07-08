'use client';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { buildTrackCurve } from './trackData';

const GOLD       = '#FFC600';
const GOLD_DARK  = '#CC9E00';
const TEAL       = '#00C8E0'; // exact logo teal
const WHITE      = '#ffffff';
const CARBON     = '#1a1a1a';

const TRAIL_COUNT = 12;

function FSAECar() {
  return (
    <group>
      {/* === MAIN BODY === */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.72]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.4} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Cockpit surround */}
      <mesh position={[0, 0.13, 0.05]}>
        <boxGeometry args={[0.18, 0.08, 0.28]} />
        <meshStandardMaterial color={GOLD_DARK} emissive={GOLD_DARK} emissiveIntensity={0.3} metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Roll hoop */}
      <mesh position={[0, 0.22, 0.05]}>
        <boxGeometry args={[0.14, 0.12, 0.04]} />
        <meshStandardMaterial color={CARBON} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* === TEAL STRIPE — logo colour running down spine === */}
      <mesh position={[0, 0.136, 0]}>
        <boxGeometry args={[0.23, 0.013, 0.73]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={1.2} metalness={0.5} roughness={0.2} />
      </mesh>

      {/* === NOSE CONE === */}
      <mesh position={[0, 0.05, 0.52]}>
        <boxGeometry args={[0.10, 0.06, 0.24]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* === FRONT WING === */}
      <mesh position={[0, 0.01, 0.68]}>
        <boxGeometry args={[0.55, 0.025, 0.1]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.28, 0.03, 0.68]}>
        <boxGeometry args={[0.025, 0.06, 0.1]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.28, 0.03, 0.68]}>
        <boxGeometry args={[0.025, 0.06, 0.1]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* === REAR WING === */}
      <mesh position={[0, 0.32, -0.38]}>
        <boxGeometry args={[0.52, 0.04, 0.1]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.3} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, -0.32]}>
        <boxGeometry args={[0.48, 0.025, 0.08]} />
        <meshStandardMaterial color={GOLD_DARK} emissive={GOLD_DARK} emissiveIntensity={0.2} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.26, 0.3, -0.35]}>
        <boxGeometry args={[0.025, 0.12, 0.14]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.26, 0.3, -0.35]}>
        <boxGeometry args={[0.025, 0.12, 0.14]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.18, 0.18, -0.36]}>
        <boxGeometry args={[0.025, 0.18, 0.025]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.18, 0.18, -0.36]}>
        <boxGeometry args={[0.025, 0.18, 0.025]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* === SIDEPODS === */}
      <mesh position={[0.19, 0.06, -0.04]}>
        <boxGeometry args={[0.12, 0.09, 0.38]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-0.19, 0.06, -0.04]}>
        <boxGeometry args={[0.12, 0.09, 0.38]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.25} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* === FLOOR === */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.36, 0.015, 0.78]} />
        <meshStandardMaterial color={CARBON} metalness={0.4} roughness={0.6} />
      </mesh>

      {/* === TYRES === */}
      {[
        [0.3, 0.04, 0.46, 0.1, 0.08],
        [-0.3, 0.04, 0.46, 0.1, 0.08],
        [0.3, 0.04, -0.3, 0.11, 0.09],
        [-0.3, 0.04, -0.3, 0.11, 0.09],
      ].map(([x, y, z, r, w], i) => (
        <mesh key={`tyre-${i}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, w, 12]} />
          <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}

      {/* === RIMS — teal, glowing === */}
      {[
        [0.3, 0.04, 0.46],
        [-0.3, 0.04, 0.46],
        [0.3, 0.04, -0.3],
        [-0.3, 0.04, -0.3],
      ].map(([x, y, z], i) => (
        <mesh key={`rim-${i}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.1, 8]} />
          <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={1.0} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* === LIGHTING === */}
      {/* Main teal underbody glow — logo colour */}
      <pointLight color={TEAL} intensity={3.5} distance={7} decay={2} position={[0, 0.3, 0]} />
      {/* Rear teal glow */}
      <pointLight color={TEAL} intensity={1.5} distance={3} decay={2} position={[0, 0.15, -0.55]} />
      {/* White headlight */}
      <pointLight color={WHITE} intensity={1.2} distance={3} decay={2} position={[0, 0.05, 0.72]} />
    </group>
  );
}

// V1: Shared geometry & material for the 12-particle trail.
// One BufferGeometry is reused across all meshes instead of allocating 12 copies.
const TRAIL_GEOMETRY = new THREE.SphereGeometry(0.08, 6, 6);
const TRAIL_MATERIAL = new THREE.MeshBasicMaterial({
  color: TEAL,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

export default function CarIndicator({ progress = 0 }) {
  const groupRef = useRef();
  const trailRefs = useRef([]);
  const currentT = useRef(0);
  const curve = useMemo(() => buildTrackCurve(), []);

  useFrame(() => {
    currentT.current = THREE.MathUtils.lerp(currentT.current, progress, 0.025);
    const t = currentT.current % 1;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    if (groupRef.current) {
      groupRef.current.position.set(pos.x, 0.38, pos.z);
      groupRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    }

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const trailT = Math.max(0, t - (i + 1) * 0.004) % 1;
      const trailPos = curve.getPointAt(trailT);
      if (trailRefs.current[i]) {
        trailRefs.current[i].position.set(trailPos.x, 0.38, trailPos.z);
        trailRefs.current[i].material.opacity = (1 - i / TRAIL_COUNT) * 0.55;
        const s = (1 - i / TRAIL_COUNT) * 0.14 + 0.03;
        trailRefs.current[i].scale.setScalar(s);
      }
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <FSAECar />
      </group>

      {/* Teal particle trail — logo colour */}
      {/* FIX (V1): Share a single unit-sphere BufferGeometry across all 12 trail
          meshes instead of allocating 12 separate ones. Also: the old code set
          `args={[1, 6, 6]}` (radius 1) and then scaled down to ~0.14, which is
          visually correct but wasteful. Now the geometry itself is the visible
          size — we just scale to fade. */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <mesh key={i} ref={(el) => (trailRefs.current[i] = el)} geometry={TRAIL_GEOMETRY} material={TRAIL_MATERIAL} />
      ))}
    </>
  );
}