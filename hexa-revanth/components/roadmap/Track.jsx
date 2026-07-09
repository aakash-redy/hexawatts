'use client';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { buildTrackCurve, COLORS } from './trackData';

export default function Track() {
  const glowRef = useRef();
  const curve = useMemo(() => buildTrackCurve(), []);

  const trackGeometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 500, 0.4, 16, true);
    return geo;
  }, [curve]);

  const glowGeometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 300, 1.2, 12, true);
    return geo;
  }, [curve]);

  const edgeGeometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 500, 0.44, 16, true);
    return geo;
  }, [curve]);

  const centerGeometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 500, 0.03, 8, true);
    return geo;
  }, [curve]);

  // ✅ Safe — this component only renders inside <Canvas> via TrackCanvas
  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.material.opacity =
        0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    }
  });

  return (
    <group>
      {/* Wide outer glow halo */}
      <mesh geometry={glowGeometry} ref={glowRef}>
        <meshBasicMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Track edge */}
      <mesh geometry={edgeGeometry}>
        <meshStandardMaterial
          color="#1c1c1c"
          emissive={COLORS.cyan}
          emissiveIntensity={0.02}
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main track surface */}
      <mesh geometry={trackGeometry}>
        <meshStandardMaterial
          color={COLORS.trackBase}
          roughness={0.8}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center racing line */}
      <mesh geometry={centerGeometry}>
        <meshBasicMaterial
          color="#222222"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}