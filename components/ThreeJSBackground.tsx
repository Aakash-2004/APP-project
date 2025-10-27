
import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleWave: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 5000;
  const separation = 100;
  
  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const origPos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = Math.random() * separation - separation / 2;
      const z = Math.random() * separation - separation / 2;
      
      pos[i3] = x;
      pos[i3 + 1] = 0;
      pos[i3 + 2] = z;
      
      origPos[i3] = x;
      origPos[i3 + 1] = 0;
      origPos[i3 + 2] = z;
    }
    return [pos, origPos];
  }, [count, separation]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (pointsRef.current) {
        const buffer = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const x = originalPositions[i3];
            const z = originalPositions[i3 + 2];
            buffer.array[i3 + 1] = Math.sin(x * 0.1 + elapsedTime) * 2 + Math.sin(z * 0.1 + elapsedTime) * 2;
        }
        buffer.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

const ThreeJSBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 10, 50], fov: 75 }}>
          {/* FIX: Property 'ambientLight' does not exist on type 'JSX.IntrinsicElements'. Using 'primitive' to work around this TypeScript error. */}
          <primitive object={new THREE.AmbientLight(0xffffff, 0.5)} />
          <ParticleWave />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ThreeJSBackground;