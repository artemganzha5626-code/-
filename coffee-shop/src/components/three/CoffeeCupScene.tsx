'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import type { Group } from 'three';
import { usePrefersReducedMotion } from '@/lib/hooks';

function Cup({ spin }: { spin: boolean }) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current && spin) {
      // Повільне, плавне обертання.
      ref.current.rotation.y += delta * 0.28;
    }
  });

  return (
    <group ref={ref} position={[0, -0.15, 0]} rotation={[0.12, 0.4, 0]}>
      {/* Блюдце */}
      <mesh position={[0, -0.62, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.5, 1.55, 0.12, 64]} />
        <meshStandardMaterial color="#efe6d6" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Корпус чашки */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.72, 1.15, 64]} />
        <meshStandardMaterial color="#f6f1e8" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Внутрішня стінка */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.86, 0.64, 1.05, 64, 1, true]} />
        <meshStandardMaterial color="#e7dccb" roughness={0.5} side={2} />
      </mesh>

      {/* Поверхня кави */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 64]} />
        <meshStandardMaterial color="#5a3a26" roughness={0.25} metalness={0.15} />
      </mesh>

      {/* Ручка */}
      <mesh position={[1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.42, 0.11, 20, 48, Math.PI * 1.1]} />
        <meshStandardMaterial color="#f6f1e8" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Пара кавових зерен поруч */}
      <mesh position={[-1.35, -0.52, 0.7]} rotation={[0.4, 0.6, 1.2]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#3f2a1c" roughness={0.5} />
      </mesh>
      <mesh position={[1.4, -0.52, -0.5]} rotation={[0.2, 0.3, 0.8]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color="#4a3221" roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function CoffeeCupScene() {
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.6, 4.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} color="#c9825f" />
      <Suspense fallback={null}>
        <Float
          speed={reduced ? 0 : 1.2}
          rotationIntensity={reduced ? 0 : 0.2}
          floatIntensity={reduced ? 0 : 0.5}
        >
          <Cup spin={!reduced} />
        </Float>
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.28}
          scale={7}
          blur={2.6}
          far={3}
          color="#3b2e25"
        />
      </Suspense>
    </Canvas>
  );
}
