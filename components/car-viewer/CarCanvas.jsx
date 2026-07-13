'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import CarModel from './CarModel';

export default function CarCanvas({ activePart }) {
  return (
    <Canvas
      camera={{ position: [4, 2, 4], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={1.5} />
      <hemisphereLight skyColor="#ffffff" groundColor="#000000" intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={1} />
      
      {/* 
        Uncomment when a real model is used. 
        For a proxy model built of basic materials, standard lights are fine.
      */}
      {/* <Environment preset="city" /> */}

      <CarModel activePart={activePart} />

      <ContactShadows 
        position={[0, -0.4, 0]} 
        opacity={0.6} 
        scale={10} 
        blur={2} 
        far={4} 
        color="#000000" 
      />

      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2 + 0.1} // Prevent going below ground
        autoRotate={!activePart} // Auto rotate when idle
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
