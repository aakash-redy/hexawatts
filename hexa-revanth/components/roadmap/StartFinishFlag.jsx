'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { buildTrackCurve, COLORS } from './trackData';

/**
 * StartFinishFlag — a checkered flag marker at the start/finish position (t=0)
 */
export default function StartFinishFlag() {
  const curve = useMemo(() => buildTrackCurve(), []);
  const position = useMemo(() => curve.getPointAt(0), [curve]);

  return (
    <group position={[position.x, 0.3, position.z]}>
      {/* Flag pole */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Checkered flag (HTML overlay) */}
      <Html
        position={[0.4, 1.4, 0]}
        center
        distanceFactor={28}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="roadmap-flag-container">
          <div className="roadmap-checkered-flag">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="roadmap-flag-square"
                style={{
                  background: (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? '#fff' : '#111',
                }}
              />
            ))}
          </div>
        </div>
      </Html>

      {/* Ground glow at start line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.3, 0.8, 32]} />
        <meshBasicMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
