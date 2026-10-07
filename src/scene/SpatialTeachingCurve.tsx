import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface SpatialTeachingCurveProps {
  curve: THREE.CatmullRomCurve3;
}

export const SpatialTeachingCurve: React.FC<SpatialTeachingCurveProps> = ({ curve }) => (
  <group>
    <mesh>
      <tubeGeometry args={[curve, 96, 0.0022, 10, false]} />
      <meshStandardMaterial color="#7c3aed" roughness={0.35} metalness={0.05} />
    </mesh>
    <Html position={curve.getPoint(0.58).clone().add(new THREE.Vector3(0, 0.025, 0))} center distanceFactor={0.55}>
      <div className="whitespace-nowrap rounded-lg border border-indigo-300 bg-white/95 px-3 py-2 text-[11px] font-bold text-indigo-800 shadow-lg pointer-events-none">
        空間曲線教學示範<br />
        <span className="font-normal text-indigo-600">不代表咖啡物理模型</span>
      </div>
    </Html>
  </group>
);

export default SpatialTeachingCurve;
