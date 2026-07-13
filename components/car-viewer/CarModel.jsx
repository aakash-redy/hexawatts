'use client';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * CarModel - A procedural proxy model representing an open-wheel race car.
 * It is structured into named parts so we can highlight them.
 * 
 * Parts: chassis, suspension, brakes, steering, accumulator
 */
export default function CarModel({ activePart }) {
  const groupRef = useRef();

  // Materials base colors
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.8,
    metalness: 0.5,
    wireframe: true,
  });

  const solidMaterial = new THREE.MeshStandardMaterial({
    color: '#222',
    roughness: 0.5,
    metalness: 0.8,
  });

  // Animation to smoothly highlight active parts
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // We traverse all children. If a child's name matches the activePart, we animate its emissive intensity
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.userData.partName) {
        const isActive = child.userData.partName === activePart;
        const targetColor = isActive ? child.userData.highlightColor : new THREE.Color('#000000');
        const targetIntensity = isActive ? 1.0 : 0.0;
        
        // Ensure material has emissive properties
        if (!child.material.emissive) {
            child.material = child.material.clone();
        }

        child.material.emissive.lerp(targetColor, 0.1);
        // We use a custom property or lerp intensity if available, or just rely on color lerp
      }
    });

    // Optional subtle auto-rotation when idle
    groupRef.current.rotation.y += delta * 0.05;
  });

  const getMat = (partName, hexColor) => {
    const mat = solidMaterial.clone();
    mat.emissive = new THREE.Color('#000');
    return mat;
  };

  const createUserData = (partName, hexColor) => ({
    partName,
    highlightColor: new THREE.Color(hexColor),
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      
      {/* 1. CHASSIS */}
      <group userData={createUserData('CHASSIS', '#5CE1E6')}>
        <mesh 
          position={[0, 0.4, 0]} 
          material={getMat('CHASSIS', '#5CE1E6')}
          userData={createUserData('CHASSIS', '#5CE1E6')}
        >
          {/* Main tub */}
          <boxGeometry args={[0.8, 0.6, 2.8]} />
        </mesh>
        <mesh 
          position={[0, 0.6, -0.8]} 
          material={getMat('CHASSIS', '#5CE1E6')}
          userData={createUserData('CHASSIS', '#5CE1E6')}
        >
          {/* Roll hoop */}
          <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
        </mesh>
        <mesh 
          position={[0, 0.2, 1.6]} 
          material={getMat('CHASSIS', '#5CE1E6')}
          userData={createUserData('CHASSIS', '#5CE1E6')}
        >
          {/* Nose cone */}
          <coneGeometry args={[0.35, 1.2, 4]} />
        </mesh>
      </group>

      {/* 2. ACCUMULATOR */}
      <mesh 
        position={[0, 0.3, -0.4]} 
        material={getMat('ACCUMULATOR', '#facc15')} // Yellow
        userData={createUserData('ACCUMULATOR', '#facc15')}
      >
        {/* Battery pack behind driver */}
        <boxGeometry args={[0.7, 0.4, 0.6]} />
      </mesh>

      {/* 3. SUSPENSION (Front and Rear links) */}
      <group userData={createUserData('BRAKES & SUSPENSION', '#4ade80')}>
        {/* Front links */}
        <mesh position={[0.6, 0.2, 1.0]} rotation={[0, 0, Math.PI / 4]} material={getMat('BRAKES & SUSPENSION', '#4ade80')} userData={createUserData('BRAKES & SUSPENSION', '#4ade80')}>
            <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        </mesh>
        <mesh position={[-0.6, 0.2, 1.0]} rotation={[0, 0, -Math.PI / 4]} material={getMat('BRAKES & SUSPENSION', '#4ade80')} userData={createUserData('BRAKES & SUSPENSION', '#4ade80')}>
            <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        </mesh>
        {/* Rear links */}
        <mesh position={[0.6, 0.3, -1.2]} rotation={[0, 0, Math.PI / 4]} material={getMat('BRAKES & SUSPENSION', '#4ade80')} userData={createUserData('BRAKES & SUSPENSION', '#4ade80')}>
            <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        </mesh>
        <mesh position={[-0.6, 0.3, -1.2]} rotation={[0, 0, -Math.PI / 4]} material={getMat('BRAKES & SUSPENSION', '#4ade80')} userData={createUserData('BRAKES & SUSPENSION', '#4ade80')}>
            <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        </mesh>
      </group>

      {/* 4. BRAKES (Discs inside wheels) */}
      <group userData={createUserData('BRAKES & SUSPENSION', '#4ade80')}>
        <mesh position={[0.9, 0.2, 1.0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={getMat('BRAKES & SUSPENSION', '#ef4444')} userData={createUserData('BRAKES & SUSPENSION', '#ef4444')}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        </mesh>
        <mesh position={[-0.9, 0.2, 1.0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={getMat('BRAKES & SUSPENSION', '#ef4444')} userData={createUserData('BRAKES & SUSPENSION', '#ef4444')}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        </mesh>
        <mesh position={[0.9, 0.3, -1.2]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={getMat('BRAKES & SUSPENSION', '#ef4444')} userData={createUserData('BRAKES & SUSPENSION', '#ef4444')}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        </mesh>
        <mesh position={[-0.9, 0.3, -1.2]} rotation={[Math.PI / 2, 0, Math.PI / 2]} material={getMat('BRAKES & SUSPENSION', '#ef4444')} userData={createUserData('BRAKES & SUSPENSION', '#ef4444')}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        </mesh>
      </group>

      {/* 5. STEERING */}
      <mesh 
        position={[0, 0.55, 0.3]} 
        rotation={[-Math.PI / 6, 0, 0]}
        material={getMat('STEERING', '#a855f7')} // Purple
        userData={createUserData('STEERING', '#a855f7')}
      >
        {/* Steering wheel */}
        <torusGeometry args={[0.15, 0.02, 8, 24]} />
      </mesh>

      {/* TIRES (Not selectable, just for looks) */}
      <group>
        <mesh position={[1.0, 0.2, 1.0]} rotation={[0, 0, Math.PI / 2]} material={baseMaterial}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 24]} />
        </mesh>
        <mesh position={[-1.0, 0.2, 1.0]} rotation={[0, 0, Math.PI / 2]} material={baseMaterial}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 24]} />
        </mesh>
        <mesh position={[1.0, 0.3, -1.2]} rotation={[0, 0, Math.PI / 2]} material={baseMaterial}>
          <cylinderGeometry args={[0.3, 0.3, 0.25, 24]} />
        </mesh>
        <mesh position={[-1.0, 0.3, -1.2]} rotation={[0, 0, Math.PI / 2]} material={baseMaterial}>
          <cylinderGeometry args={[0.3, 0.3, 0.25, 24]} />
        </mesh>
      </group>

    </group>
  );
}
