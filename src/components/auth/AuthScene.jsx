import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';

function FloatingShape({ position, color, speed, geometry }) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.x += delta * 0.18 * speed;
    meshRef.current.rotation.y += delta * 0.22 * speed;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.12;
  });

  return (
    <Float speed={speed} rotationIntensity={0.7} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} emissive={color} emissiveIntensity={0.12} />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  const geometries = useMemo(
    () => [
      <icosahedronGeometry args={[0.8, 1]} key="ico" />,
      <torusKnotGeometry args={[0.45, 0.14, 120, 16]} key="torus" />,
      <octahedronGeometry args={[0.72, 0]} key="octa" />,
    ],
    [],
  );

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 3, 4]} intensity={2.2} color="#a5f3fc" />
      <directionalLight position={[-4, -2, -2]} intensity={1.2} color="#93c5fd" />
      <Sparkles count={90} size={1.4} speed={0.6} opacity={0.75} scale={[10, 7, 6]} color="#7dd3fc" />
      <FloatingShape position={[-1.8, 0.2, -0.4]} color="#7dd3fc" speed={0.6} geometry={geometries[0]} />
      <FloatingShape position={[1.8, 1.1, -1.4]} color="#c4b5fd" speed={0.5} geometry={geometries[1]} />
      <FloatingShape position={[1.2, -1.4, 0]} color="#86efac" speed={0.7} geometry={geometries[2]} />
    </>
  );
}

export function AuthScene() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[12%] h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-[10%] right-[6%] h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-[24%] top-[18%] h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5.4], fov: 42 }} dpr={[1, 1.6]}>
        <SceneContent />
      </Canvas>
    </div>
  );
}

