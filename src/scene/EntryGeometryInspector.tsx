import type React from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { EntryGeometryAnalysis } from '../geometry/entryGeometry';

interface EntryGeometryInspectorProps {
  analysis: EntryGeometryAnalysis;
}

export const EntryGeometryInspector: React.FC<EntryGeometryInspectorProps> = ({ analysis }) => {
  const lift = new THREE.Vector3(0, 0.0016, 0);
  const point = analysis.point.clone().add(lift);
  const center = analysis.holeCenter.clone().add(lift);
  const footprintColor = analysis.directionalStatus === 'safe' ? '#16a34a' : '#ea580c';
  const ellipsePoints = analysis.nearGrazing
    ? []
    : Array.from({ length: 97 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2;
        return point.clone()
          .addScaledVector(analysis.footprintMajorDirection, analysis.footprintSemiMajor * Math.cos(angle))
          .addScaledVector(analysis.footprintMinorDirection, analysis.footprintSemiMinor * Math.sin(angle));
      });
  const circleCenter = point.clone().add(new THREE.Vector3(0, 0.00012, 0));
  const basicCirclePoints = Array.from({ length: 97 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2;
    return circleCenter.clone()
      .addScaledVector(analysis.footprintMajorDirection, analysis.footprintSemiMinor * Math.cos(angle))
      .addScaledVector(analysis.footprintMinorDirection, analysis.footprintSemiMinor * Math.sin(angle));
  });
  const arrowLength = 0.05;
  const arrowDirection = analysis.tangent.clone().normalize();
  const arrowQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDirection);

  return (
    <group>
      <mesh position={point} renderOrder={10}>
        <sphereGeometry args={[0.0031, 18, 18]} />
        <meshBasicMaterial color="#fde047" depthTest={false} />
      </mesh>
      <mesh position={center} renderOrder={10}>
        <sphereGeometry args={[0.0022, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" depthTest={false} />
      </mesh>
      <Line points={[center, point]} color="#38bdf8" lineWidth={1.5} dashed dashSize={0.002} gapSize={0.0015} />
      <Line
        points={basicCirclePoints}
        color="#64748b"
        lineWidth={1.25}
        dashed
        dashSize={0.0015}
        gapSize={0.0012}
        transparent
        opacity={0.72}
      />
      {ellipsePoints.length > 0 && <Line points={ellipsePoints} color={footprintColor} lineWidth={2.5} />}
      <group position={point} quaternion={arrowQuaternion}>
        <mesh position={[0, arrowLength * 0.38, 0]}>
          <cylinderGeometry args={[0.00125, 0.00125, arrowLength * 0.76, 10]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, arrowLength * 0.84, 0]}>
          <coneGeometry args={[0.0042, arrowLength * 0.16, 12]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>
    </group>
  );
};

export default EntryGeometryInspector;
