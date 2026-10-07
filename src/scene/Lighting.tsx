import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <>
      <hemisphereLight args={['#f8fbff', '#aab6c3', 1.35]} />
      <ambientLight intensity={0.45} color="#fffaf2" />
      <directionalLight
        position={[1.2, 2.2, 1.4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={5.0}
        shadow-camera-top={0.4}
        shadow-camera-right={0.4}
        shadow-camera-bottom={-0.4}
        shadow-camera-left={-0.4}
        shadow-bias={-0.00015}
        shadow-radius={5}
      />
      <directionalLight position={[-1.2, 1.0, 0.8]} intensity={0.55} color="#fff4df" />
      <directionalLight position={[0.2, 1.4, -1.6]} intensity={0.65} color="#c7dcff" />
    </>
  );
};
