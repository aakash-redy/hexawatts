'use client';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { buildTrackCurve, COLORS } from './trackData';

/**
 * Checkpoint — a single milestone node positioned ON the track curve.
 * States: completed (cyan filled), current (pulsing), locked (dimmed fill only)
 *
 * Brightness is now constant across all states (ring + glow are always lit),
 * only the inner fill communicates progress. Node also scales up on mobile
 * viewports so checkpoints stay readable/tappable on small screens.
 */
export default function Checkpoint({
  checkpoint,
  progress,
  onHover,
  onLeave,
  onClick,
  isHovered,
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const curve = useMemo(() => buildTrackCurve(), []);

  // --- Mobile detection: scale the whole node up on small viewports ---
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const mobileScale = isMobile ? 1.6 : 1;

  // Position on the curve + upward offset for label/connector.
  const position = useMemo(() => {
    const p = curve.getPointAt(checkpoint.t);
    return new THREE.Vector3(p.x, p.y, p.z);
  }, [curve, checkpoint.t]);

  // Dynamic state based on progress
  const isCompleted = progress > checkpoint.t + 0.01;
  const isCurrent = Math.abs(progress - checkpoint.t) <= 0.01;
  const isLocked = progress < checkpoint.t - 0.01;

  // Animate pulsing for current checkpoint
  useFrame((state) => {
    if (meshRef.current) {
      if (isCurrent) {
        const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.15 + 1.0;
        meshRef.current.scale.setScalar(pulse * mobileScale);
      } else if (isHovered) {
        meshRef.current.scale.setScalar(
          THREE.MathUtils.lerp(meshRef.current.scale.x, 1.3 * mobileScale, 0.1)
        );
      } else {
        meshRef.current.scale.setScalar(
          THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0 * mobileScale, 0.1)
        );
      }
    }

    if (glowRef.current) {
      // Glow is now always visible (bright at every state), just pulses
      // harder when current and lifts slightly on hover.
      if (isCurrent) {
        const glowPulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.3 + 0.6;
        glowRef.current.material.opacity = glowPulse;
        glowRef.current.scale.setScalar(
          (Math.sin(state.clock.elapsedTime * 2.5) * 0.5 + 2.0) * mobileScale
        );
      } else if (isHovered) {
        glowRef.current.material.opacity = 0.55;
        glowRef.current.scale.setScalar(2.0 * mobileScale);
      } else {
        // Constant baseline glow for every checkpoint, completed or not.
        glowRef.current.material.opacity = 0.4;
        glowRef.current.scale.setScalar(1.8 * mobileScale);
      }
    }
  });

  // Ring/node color & brightness no longer dim when locked — only the
  // inner fill below communicates completion state.
  const nodeColor = COLORS.cyan;
  const nodeOpacity = 1.0;

  return (
    <group position={[position.x, 0.3, position.z]}>
      {/* Glow ring — always lit, not just on completion */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.9, 32]} />
        <meshBasicMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Main node */}
      <group ref={meshRef} scale={mobileScale}>
        {/* Outer ring */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover?.(checkpoint);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onLeave?.();
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(checkpoint);
          }}
        >
          <ringGeometry args={[0.25, 0.4, 32]} />
          <meshStandardMaterial
            color={nodeColor}
            emissive={COLORS.cyan}
            emissiveIntensity={0.5}
            transparent
            opacity={nodeOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner fill — this is what actually shows progress now */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial
            color={COLORS.cyan}
            emissive={COLORS.cyan}
            emissiveIntensity={isCurrent ? 0.8 : isCompleted ? 0.4 : 0.2}
            transparent
            opacity={isCompleted || isCurrent ? 0.9 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Connector Line */}
      <Line
        points={[
          [0, 0.4, 0],
          [0, 4.5, 0],
        ]}
        color="#ffffff"
        lineWidth={1.5}
        transparent
        opacity={0.7}
      />

      {/* Label */}
      <Html
        position={[0, 4.5, 0]}
        center
        distanceFactor={30}
        transform
        sprite
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          className="roadmap-checkpoint-label"
          style={{
            opacity: 1,
            color: COLORS.cyan,
            transform: isMobile ? 'scale(1.3)' : undefined,
          }}
        >
          <span className="roadmap-phase-tag">PHASE {checkpoint.phase}</span>
          <span className="roadmap-phase-name">{checkpoint.name}</span>
        </div>
      </Html>
    </group>
  );
}