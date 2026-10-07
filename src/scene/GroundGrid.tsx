import React from 'react';
import { Grid } from '@react-three/drei';

export const GroundGrid: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      <Grid
        renderOrder={-1}
        position={[0, 0.001, 0]}
        infiniteGrid
        cellSize={0.1}
        cellThickness={0.45}
        cellColor="#9da4ad"
        sectionSize={0.5}
        sectionThickness={0.9}
        sectionColor="#858d98"
        fadeDistance={1.8}
        fadeStrength={1.8}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#c5c9cf" roughness={0.92} metalness={0} />
      </mesh>
    </group>
  );
};
