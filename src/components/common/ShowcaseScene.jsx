import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';

const variantConfigs = {
  workspace: {
    camera: [0, 0, 6.4],
    sparkles: { count: 60, scale: [16, 10, 8], color: '#93c5fd' },
    shapes: [
      { kind: 'torus', position: [-3.2, 1.4, -1.8], color: '#7dd3fc', scale: 1.15, speed: 0.3 },
      { kind: 'sphere', position: [3.1, -1.1, -2.2], color: '#c4b5fd', scale: 1.2, speed: 0.24 },
      { kind: 'octahedron', position: [0.2, 2.1, -1.4], color: '#86efac', scale: 0.85, speed: 0.38 },
      { kind: 'icosahedron', position: [-0.8, -2.2, -1.1], color: '#f9a8d4', scale: 0.74, speed: 0.35 },
    ],
  },
  dashboard: {
    camera: [0, 0, 4.4],
    sparkles: { count: 44, scale: [7, 5, 4], color: '#93c5fd' },
    shapes: [
      { kind: 'torus', position: [-1.2, 0.4, -0.6], color: '#7dd3fc', scale: 0.92, speed: 0.55 },
      { kind: 'icosahedron', position: [1.35, 0.2, -0.3], color: '#c4b5fd', scale: 0.76, speed: 0.48 },
      { kind: 'octahedron', position: [0.3, -1, 0], color: '#86efac', scale: 0.62, speed: 0.7 },
    ],
  },
  sidebar: {
    camera: [0, 0, 4.2],
    sparkles: { count: 26, scale: [6, 4, 3], color: '#f0f9ff' },
    shapes: [
      { kind: 'icosahedron', position: [-1.05, -0.15, -0.4], color: '#d9f99d', scale: 0.66, speed: 0.42 },
      { kind: 'sphere', position: [1.05, 0.65, -0.8], color: '#e0f2fe', scale: 0.74, speed: 0.35 },
      { kind: 'torus', position: [0.35, -0.9, -0.2], color: '#a5f3fc', scale: 0.54, speed: 0.52 },
    ],
  },
  starter: {
    camera: [0, 0, 4.6],
    sparkles: { count: 34, scale: [8, 5, 4], color: '#7dd3fc' },
    shapes: [
      { kind: 'box', position: [-1.35, 0.35, -0.5], color: '#7dd3fc', scale: 0.74, speed: 0.4 },
      { kind: 'torus', position: [1.25, 0.55, -0.9], color: '#34d399', scale: 0.72, speed: 0.58 },
      { kind: 'octahedron', position: [0.2, -0.85, 0], color: '#c4b5fd', scale: 0.58, speed: 0.63 },
      { kind: 'sphere', position: [-0.25, 0.9, -1.2], color: '#f9a8d4', scale: 0.48, speed: 0.46 },
    ],
  },
  settings: {
    camera: [0, 0, 4.1],
    sparkles: { count: 22, scale: [5, 4, 3], color: '#bae6fd' },
    shapes: [
      { kind: 'torus', position: [-0.95, 0.15, -0.4], color: '#60a5fa', scale: 0.68, speed: 0.46 },
      { kind: 'sphere', position: [0.95, -0.2, -0.7], color: '#a78bfa', scale: 0.7, speed: 0.36 },
      { kind: 'icosahedron', position: [0.15, 0.9, -0.2], color: '#5eead4', scale: 0.5, speed: 0.56 },
    ],
  },
};

function Geometry({ kind }) {
  switch (kind) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'sphere':
      return <sphereGeometry args={[0.6, 32, 32]} />;
    case 'torus':
      return <torusKnotGeometry args={[0.45, 0.14, 120, 16]} />;
    case 'octahedron':
      return <octahedronGeometry args={[0.72, 0]} />;
    default:
      return <icosahedronGeometry args={[0.72, 1]} />;
  }
}

function FloatingMesh({ shape }) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.x += delta * 0.18 * shape.speed;
    meshRef.current.rotation.y += delta * 0.22 * shape.speed;
    meshRef.current.position.y = shape.position[1] + Math.sin(state.clock.elapsedTime * shape.speed) * 0.08;
  });

  return (
    <Float speed={shape.speed} rotationIntensity={0.6} floatIntensity={0.7}>
      <mesh ref={meshRef} position={shape.position} scale={shape.scale}>
        <Geometry kind={shape.kind} />
        <meshStandardMaterial
          color={shape.color}
          roughness={0.2}
          metalness={0.16}
          emissive={shape.color}
          emissiveIntensity={0.14}
        />
      </mesh>
    </Float>
  );
}

function SceneContent({ variant }) {
  const config = useMemo(() => variantConfigs[variant] ?? variantConfigs.dashboard, [variant]);

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 2.8, 4]} intensity={2.1} color="#a5f3fc" />
      <directionalLight position={[-3, -2, -1.5]} intensity={1.25} color="#c4b5fd" />
      <Sparkles
        count={config.sparkles.count}
        size={1.35}
        speed={0.45}
        opacity={0.7}
        scale={config.sparkles.scale}
        color={config.sparkles.color}
      />
      {config.shapes.map((shape) => (
        <FloatingMesh key={`${variant}-${shape.kind}-${shape.position.join('-')}`} shape={shape} />
      ))}
    </>
  );
}

function StaticScene({ variant }) {
  const styles = {
    workspace: {
      first: 'bg-sky-400/16',
      second: 'bg-violet-300/12',
      third: 'bg-emerald-300/12',
    },
    dashboard: {
      first: 'bg-sky-400/18',
      second: 'bg-cyan-300/12',
      third: 'bg-emerald-300/12',
    },
    sidebar: {
      first: 'bg-white/18',
      second: 'bg-lime-200/14',
      third: 'bg-cyan-200/16',
    },
    starter: {
      first: 'bg-sky-400/18',
      second: 'bg-violet-300/14',
      third: 'bg-emerald-300/14',
    },
    settings: {
      first: 'bg-sky-400/18',
      second: 'bg-fuchsia-300/12',
      third: 'bg-cyan-300/14',
    },
  };

  const palette = styles[variant] ?? styles.dashboard;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute left-[12%] top-[15%] h-28 w-28 rounded-full blur-3xl ${palette.first}`} />
      <div className={`absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full blur-3xl ${palette.second}`} />
      <div className={`absolute right-[28%] top-[24%] h-24 w-24 rounded-full blur-3xl ${palette.third}`} />
    </div>
  );
}

export function ShowcaseScene({ variant = 'dashboard' }) {
  const prefersReducedMotion = useReducedMotion();
  const config = variantConfigs[variant] ?? variantConfigs.dashboard;

  if (prefersReducedMotion) {
    return <StaticScene variant={variant} />;
  }

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: config.camera, fov: 44 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'low-power' }}>
        <SceneContent variant={variant} />
      </Canvas>
    </div>
  );
}
