'use client';
import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Track from './Track';
import ProgressLine from './ProgressLine';
import Checkpoint from './Checkpoint';
import CarIndicator from './CarIndicator';
import StartFinishFlag from './StartFinishFlag';
import { CHECKPOINTS } from './trackData';

/**
 * FitCameraToTrack — measures ONLY the tagged track group (not lights,
 * controls, or anything else in the scene) and positions the camera
 * so it fills the viewport regardless of the track's authored scale.
 */
function FitCameraToTrack({ padding = 1.35, elevation = 0.65, debug = true }) {
  const { camera, scene, invalidate } = useThree();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const trackRoot = scene.getObjectByName('trackRoot');
      if (!trackRoot) {
        if (debug) console.warn('[FitCameraToTrack] trackRoot not found in scene');
        return;
      }

      const box = new THREE.Box3().setFromObject(trackRoot);
      if (box.isEmpty()) {
        if (debug) console.warn('[FitCameraToTrack] trackRoot bounding box is empty');
        return;
      }

      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.z, size.y || 1);

      const fovRad = camera.fov * (Math.PI / 180);
      const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * padding;

      if (debug) {
        console.log('[FitCameraToTrack]', {
          boxMin: box.min.toArray(),
          boxMax: box.max.toArray(),
          size: size.toArray(),
          center: center.toArray(),
          maxDim,
          computedDistance: distance,
        });
      }

      // Sanity clamp — if something is still off, don't let the camera
      // fly off to some absurd distance and render a speck.
      const safeDistance = THREE.MathUtils.clamp(distance, 2, 150);

      camera.position.set(center.x, safeDistance * elevation, center.z + safeDistance);
      camera.lookAt(center);
      camera.near = Math.max(0.1, safeDistance / 100);
      camera.far = safeDistance * 10;
      camera.updateProjectionMatrix();

      invalidate();
    });

    return () => cancelAnimationFrame(raf);
  }, [scene, camera, padding, elevation, invalidate, debug]);

  return null;
}

export default function TrackCanvas({
  progress = 0,
  hoveredCheckpoint = null,
  onHoverCheckpoint = () => {},
  onLeaveCheckpoint = () => {},
  onClickCheckpoint = () => {},
}) {
  return (
    <Canvas
      camera={{
        fov: 50,
        near: 0.1,
        far: 200,
      }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <FitCameraToTrack />

      {/* Lighting — NOT inside trackRoot, so it's excluded from the fit */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#5CE1E6" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={200}
        makeDefault
      />

      {/* Only what's inside this named group counts toward the camera fit */}
      <group name="trackRoot">
        <Suspense fallback={null}>
          <Track />
          <ProgressLine progress={progress} />

          {CHECKPOINTS.map((cp) => (
            <Checkpoint
              key={cp.id}
              checkpoint={cp}
              progress={progress}
              isHovered={hoveredCheckpoint?.id === cp.id}
              onHover={onHoverCheckpoint}
              onLeave={onLeaveCheckpoint}
              onClick={onClickCheckpoint}
            />
          ))}

          <StartFinishFlag />
          <CarIndicator progress={progress} />
        </Suspense>
      </group>
    </Canvas>
  );
}