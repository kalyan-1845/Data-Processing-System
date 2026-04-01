import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLE_COUNT = 2000;

function BoltParticles({ explosionPhase, phase, isHovered }: { explosionPhase: boolean, phase: number, isHovered: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Custom Lightning Bolt Shape for each particle
  const boltShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, 0.4);
    shape.lineTo(0.15, 0.4);
    shape.lineTo(0.0, 0.8);
    shape.lineTo(0.4, 0.1);
    shape.lineTo(0.15, 0.1);
    shape.lineTo(0.3, -0.4);
    shape.lineTo(-0.1, 0.4);
    return shape;
  }, []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 5 + Math.random() * 10;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      temp.push({
        position: new THREE.Vector3(x, y, z),
        originalPos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.4,
        rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
        scale: 0.2 + Math.random() * 0.8
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      if (explosionPhase) {
        // High-velocity outward explosion
        const dir = p.position.clone().normalize().add(new THREE.Vector3(0,0,1)).normalize();
        const accel = dir.multiplyScalar(80 * delta);
        p.velocity.add(accel);
        p.position.add(p.velocity.clone().multiplyScalar(delta));
        p.rotation.x += 10 * delta;
      } else if (phase === 2 || phase === 3) {
          // Formation phase: particles gather around the logo
          const target = p.originalPos.clone().normalize().multiplyScalar(isHovered ? 1.5 : 2.5);
          p.position.lerp(target, 2 * delta);
          p.rotation.y += p.speed;
      } else {
        // Birth phase: drifting in
        const angle = time * p.speed + p.phase;
        p.position.x += Math.sin(angle) * 0.01;
        p.position.y += Math.cos(angle) * 0.01;
      }
      
      dummy.position.copy(p.position);
      dummy.rotation.copy(p.rotation);
      const scale = explosionPhase 
        ? Math.max(0.01, p.scale * (1 - p.velocity.length() * 0.003)) 
        : p.scale;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <shapeGeometry args={[boltShape]} />
      <meshBasicMaterial color="#c084fc" transparent opacity={0.3} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function Logo3D({ explosionPhase, isHovered }: { explosionPhase: boolean, isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  const boltShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, 0.4);
    shape.lineTo(0.15, 0.4);
    shape.lineTo(0.0, 0.8);
    shape.lineTo(0.4, 0.1);
    shape.lineTo(0.15, 0.1);
    shape.lineTo(0.3, -0.4);
    shape.lineTo(-0.1, 0.4);
    return shape;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y += delta * (isHovered ? 1.5 : 0.5);
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;

      if (explosionPhase) {
        groupRef.current.scale.multiplyScalar(0.8);
        groupRef.current.position.z += 15 * delta;
      } else {
        const targetScale = isHovered ? 1.5 : 1.2;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 5 * delta);
      }
    }
    if (outerRef.current) {
        outerRef.current.rotation.x += delta * 2;
        outerRef.current.rotation.y += delta * 1;
    }
  });

  return (
    <Float speed={4} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={groupRef}>
        {/* Core - Glass Shield */}
        <mesh>
          <boxGeometry args={[1.2, 1.2, 0.4]} />
          <meshPhysicalMaterial 
            color="#4f46e5"
            emissive="#1e1b4b"
            emissiveIntensity={1}
            roughness={0}
            metalness={1}
            transparent
            opacity={0.8}
            transmission={0.8}
            thickness={1}
            envMapIntensity={2}
          />
        </mesh>
        
        {/* Primary Bolt */}
        <mesh position={[-0.15, -0.2, 0.22]}>
          <extrudeGeometry args={[boltShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 5 }]} />
          <meshStandardMaterial 
            color="white" 
            emissive="white" 
            emissiveIntensity={isHovered ? 5 : 2}
          />
        </mesh>

        {/* Dynamic Energy Rings */}
        <mesh ref={outerRef}>
            <torusGeometry args={[1.1, 0.015, 16, 100]} />
            <MeshDistortMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} distort={0.5} speed={5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.0, 0.01, 16, 100]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ phase, setIsHovered, isHovered }: { phase: number, setIsHovered: (v: boolean) => void, isHovered: boolean }) {
  const mousePos = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_state, delta) => {
    const targetCamX = mousePos.current.x * 2;
    const targetCamY = mousePos.current.y * 2;
    const targetCamZ = isHovered ? 5 : 7;
    
    if (phase < 4) {
      camera.position.x += (targetCamX - camera.position.x) * 3 * delta;
      camera.position.y += (targetCamY - camera.position.y) * 3 * delta;
      camera.position.z += (targetCamZ - camera.position.z) * 3 * delta;
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.x += (Math.random() - 0.5) * 0.5;
      camera.position.y += (Math.random() - 0.5) * 0.5;
      camera.position.z -= 12 * delta;
    }
  });

  return (
    <>
      <color attach="background" args={['#010103']} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
      <spotLight position={[0, 0, 15]} angle={0.3} penumbra={1} intensity={3} color="#ffffff" castShadow />
      
      <Environment preset="night" />

      {phase >= 2 && (
        <group 
          onPointerOver={() => setIsHovered(true)} 
          onPointerOut={() => setIsHovered(false)}
        >
          <Logo3D explosionPhase={phase === 4} isHovered={isHovered} />
          <BoltParticles explosionPhase={phase === 4} phase={phase} isHovered={isHovered} />
        </group>
      )}

      {/* Grid Floor */}
      <gridHelper args={[100, 50, '#1e1b4b', '#0a0a2a']} position={[0, -5, 0]} />
    </>
  );
}

export function Entrance({ onComplete, onPhaseChange, onHoverChange }: { 
  onComplete: () => void, 
  onPhaseChange?: (phase: number) => void,
  onHoverChange?: (hovered: boolean) => void 
}) {
  const [phase, setPhase] = useState(0); 
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    onHoverChange?.(isHovered);
  }, [isHovered, onHoverChange]);

  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), 300);
    const t1 = setTimeout(() => setPhase(2), 1500);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  const handleClick = () => {
    if (phase >= 2 && phase < 4) {
      setPhase(4);
      setTimeout(() => {
        onComplete();
      }, 2500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-[100] bg-[#020205] overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#020205_90%)]" />
      
      {/* HUD Scanner */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div 
            initial={{ top: '-10%', opacity: 0 }}
            animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute left-0 w-full h-[15vh] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent shadow-[0_0_50px_rgba(34,211,238,0.3)] z-20"
          />
        )}
      </AnimatePresence>

      {/* Text Overlays */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-between py-16 pointer-events-none">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -20 }}
            className="text-center"
        >
            <h2 className="font-outfit text-white/20 text-[10px] tracking-[1em] uppercase">Initializing Neural Core</h2>
        </motion.div>

        <AnimatePresence mode="wait">
            {phase >= 2 && phase < 4 && (
                <motion.div
                    key="prompt"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative group overflow-hidden px-8 py-3 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
                        <motion.div 
                            animate={{ opacity: [0.3, 0.6, 0.3] }} 
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-violet-500/10" 
                        />
                        <p className="font-outfit text-white/60 tracking-[0.3em] text-xs uppercase relative z-10">
                            {isHovered ? 'Ready for Authorization' : 'DocuShrink AI Terminal'}
                        </p>
                    </div>
                    <motion.div 
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-6 w-px h-12 bg-gradient-to-b from-violet-500/50 to-transparent"
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Terminal data streams (Left/Right) */}
      <AnimatePresence>
        {phase >= 2 && phase < 4 && (
            <>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="w-12 h-[2px] bg-white/10" />
                            <div className="w-8 h-[2px] bg-white/5" />
                        </div>
                    ))}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-right items-end">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex flex-col gap-1 items-end">
                            <div className="w-12 h-[2px] bg-white/10" />
                            <div className="w-8 h-[2px] bg-white/5" />
                        </div>
                    ))}
                </motion.div>
            </>
        )}
      </AnimatePresence>
      
      {/* Main 3D Canvas */}
      <Canvas 
        shadows
        gl={{ antialias: true, alpha: true, stencil: false, depth: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <Scene phase={phase} setIsHovered={setIsHovered} isHovered={isHovered} />
      </Canvas>

      {/* Lens Flare Overlay during explosion */}
      <AnimatePresence>
        {phase === 4 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-50 bg-white pointer-events-none mix-blend-overlay"
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// version control incremental update 81

// version control incremental update 82

// version control incremental update 83

// version control incremental update 84

// version control incremental update 85

// version control incremental update 86

// version control incremental update 87

// version control incremental update 88

// version control incremental update 89

// version control incremental update 90

// version control incremental update 91

// version control incremental update 92

// version control incremental update 93

// version control incremental update 94

// version control incremental update 95

// version control incremental update 96

// version control incremental update 97

// version control incremental update 98

// version control incremental update 99

// version control incremental update 100

// version control incremental update 101

// version control incremental update 102

// version control incremental update 103

// version control incremental update 104

// version control incremental update 105

// version control incremental update 106

// version control incremental update 107

// version control incremental update 108

// version control incremental update 109

// version control incremental update 110

// version control incremental update 111

// version control incremental update 112

// version control incremental update 113

// version control incremental update 114

// version control incremental update 115

// version control incremental update 116

// version control incremental update 117

// version control incremental update 118

// version control incremental update 119

// version control incremental update 120

// version control incremental update 121

// version control incremental update 122

// version control incremental update 123

// version control incremental update 124

// version control incremental update 125

// version control incremental update 126

// version control incremental update 127

// version control incremental update 128

// version control incremental update 129

// version control incremental update 130

// version control incremental update 131

// version control incremental update 132

// version control incremental update 133
