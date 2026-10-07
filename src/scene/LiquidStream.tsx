import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { TrajectoryResult } from '../geometry/trajectory';
import { TAKEAWAY_CUP } from '../geometry/cupGeometry';

interface LiquidStreamProps {
  trajectory: TrajectoryResult;
  radius: number;
  progress: number;
  emphasized?: boolean;
}

export const LiquidStream: React.FC<LiquidStreamProps> = ({ trajectory, radius, progress, emphasized = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. 動態流體材質隨時間擾動 (模擬液體表面高頻折射)
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.roughness = 0.12 + 0.05 * Math.sin(time * 18);
    }

    // 2. 杯口落水同心圓漣漪擴散動畫
    if (rippleRef.current && progress > 0.95) {
      const scale = 1 + (time * 3) % 2.5;
      rippleRef.current.scale.set(scale, scale, 1);
      const rippleMat = rippleRef.current.material as THREE.MeshBasicMaterial;
      rippleMat.opacity = Math.max(0, 0.65 - (scale - 1) / 2.5);
    }
  });

  if (!trajectory.curve) return null;

  return (
    <group>
      {/* 3D 咖啡柱主體 (管徑隨落水加速向下自然變細) */}
      <mesh ref={meshRef}>
        <tubeGeometry args={[trajectory.curve, 48, radius, 12, false]} />
        <meshStandardMaterial
          color="#3c1d11"
          roughness={0.12}
          metalness={0.1}
          transparent
          opacity={0.92}
          emissive={emphasized ? '#d97706' : '#000000'}
          emissiveIntensity={emphasized ? 0.45 : 0}
        />
      </mesh>

      {/* 落水點擴散波紋漣漪 */}
      {trajectory.hitHole &&
        progress > 0.95 &&
        Math.abs(trajectory.finalVisibleEndpoint.y - TAKEAWAY_CUP.coffeeSurfaceY) < 0.001 && (
        <mesh
          ref={rippleRef}
          position={[trajectory.finalVisibleEndpoint.x, TAKEAWAY_CUP.coffeeSurfaceY + 0.0005, trajectory.finalVisibleEndpoint.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.003, 0.006, 32]} />
          <meshBasicMaterial color="#b45309" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default LiquidStream;
