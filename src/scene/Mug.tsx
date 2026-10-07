import React from 'react';
import * as THREE from 'three';
import { useSimulationStore, type SimulationParams } from '../store/useSimulationStore';
import { MUG } from '../geometry/cupGeometry';

interface MugProps {
  presentationParams?: SimulationParams;
  presentationTilt?: number;
}

export const Mug: React.FC<MugProps> = ({ presentationParams, presentationTilt }) => {
  const storedParams = useSimulationStore((state) => state.params);
  const currentTilt = useSimulationStore((state) => state.currentTilt);
  const isSimulating = useSimulationStore((state) => state.isSimulating);

  const params = presentationParams ?? storedParams;
  const d = params.horizontalDistance / 100;
  const h = params.pourHeight / 100;

  // 若未在動態模擬中，直接反映設定的傾倒角度，讓使用者調整滑桿能即時看到旋轉角度！
  const activeTiltDeg = presentationTilt ?? (isSimulating ? currentTilt : params.tiltAngle);
  const tiltRad = (activeTiltDeg * Math.PI) / 180;

  return (
    // Body, handle, rim and contents deliberately share this transform hierarchy.
    <group position={[-d, h, 0]}>
      <group rotation={[0, 0, -tiltRad]}>
        {/* Open-ended outer and inner walls make the opening unambiguous. */}
        <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[MUG.outerTopRadius, MUG.outerBottomRadius, MUG.height, 36, 1, true]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} />
        </mesh>

        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[MUG.innerTopRadius, MUG.innerBottomRadius, MUG.height - 0.004, 36, 1, true]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} side={THREE.BackSide} />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[(MUG.outerTopRadius + MUG.innerTopRadius) / 2, (MUG.outerTopRadius - MUG.innerTopRadius) / 2, 10, 48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>

        {/* 馬克杯杯底 */}
        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.033, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* 杯內咖啡液面 (深色液體) */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.034, 32]} />
          <meshStandardMaterial color="#241209" roughness={0.2} />
        </mesh>

        {/* Full torus avoids partial-arc clipping; it remains a child of the mug. */}
        <mesh position={[-0.039, -0.04, 0]} castShadow>
          <torusGeometry args={[0.022, 0.005, 16, 40]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
};

export default Mug;
