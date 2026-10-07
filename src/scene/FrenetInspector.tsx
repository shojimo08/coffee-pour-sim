import React from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { FrenetFrameAnalysis } from '../geometry/frenet';

export type TnbHighlight = 'tangent' | 'normal' | 'binormal' | null;

export interface FrenetInspectorProps {
  analysis: FrenetFrameAnalysis;
  highlight?: TnbHighlight;
  visibility?: {
    tangent?: boolean;
    normal?: boolean;
    binormal?: boolean;
    circle?: boolean;
  };
  localCircleArc?: boolean;
}

interface VectorArrowProps {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  color: string;
  shortLabel: string;
  longLabel: string;
  highlighted: boolean;
  labelOffset: THREE.Vector3;
  compact: boolean;
}

const VectorArrow: React.FC<VectorArrowProps> = ({ origin, direction, color, shortLabel, longLabel, highlighted, labelOffset, compact }) => {
  const length = compact ? (highlighted ? 0.054 : 0.047) : (highlighted ? 0.067 : 0.058);
  const headLength = compact ? 0.01 : (highlighted ? 0.014 : 0.012);
  const shaftLength = length - headLength;
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  const labelPosition = origin.clone().addScaledVector(direction, length).add(labelOffset);

  return (
    <>
      <group position={origin} quaternion={quaternion}>
        <mesh position={[0, shaftLength / 2, 0]}>
          <cylinderGeometry args={[highlighted ? 0.0019 : 0.0015, highlighted ? 0.0019 : 0.0015, shaftLength, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[0, shaftLength + headLength / 2, 0]}>
          <coneGeometry args={[highlighted ? 0.0058 : 0.0048, headLength, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
      <Html position={labelPosition} center distanceFactor={0.5}>
        <div className={`whitespace-nowrap rounded-lg bg-white/95 font-bold shadow-md pointer-events-none ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'} ${highlighted ? 'ring-2 ring-amber-300' : ''}`} style={{ color }}>
          <span className="font-black">{shortLabel}</span>{compact ? '' : ` — ${longLabel}`}
        </div>
      </Html>
    </>
  );
};

export const FrenetInspector: React.FC<FrenetInspectorProps> = ({
  analysis,
  highlight = null,
  visibility = {},
  localCircleArc = false,
}) => {
  const compact = useThree((state) => state.size.width < 768);
  const displayRadius = analysis.circleCenter ? analysis.circleCenter.distanceTo(analysis.point) : null;
  const {
    tangent: showTangent = true,
    normal: showNormal = true,
    binormal: showBinormal = true,
    circle: showCircle = true,
  } = visibility;
  const circleLabelPosition = localCircleArc && analysis.normal
    ? analysis.point.clone()
      .addScaledVector(analysis.normal, compact ? 0.018 : 0.027)
      .addScaledVector(analysis.tangent, compact ? 0.008 : 0.016)
    : analysis.circleCenter?.clone().add(new THREE.Vector3(0, 0.013, 0));

  return (
    <group>
      <mesh position={analysis.point}>
        <sphereGeometry args={[0.006, 24, 24]} />
        <meshBasicMaterial color="#fff7d6" />
      </mesh>
      <mesh position={analysis.point}>
        <sphereGeometry args={[0.0085, 20, 20]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <Html position={analysis.point.clone().add(new THREE.Vector3(0, compact ? 0.011 : 0.014, 0))} center distanceFactor={0.5}>
        <span className={`whitespace-nowrap rounded-md bg-slate-900 font-black text-white shadow pointer-events-none ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[11px]'}`}>P(t){compact ? '' : ' 觀察點'}</span>
      </Html>

      {showTangent && <VectorArrow origin={analysis.point} direction={analysis.tangent} color="#dc2626" shortLabel="T" longLabel="Tangent" highlighted={highlight === 'tangent'} labelOffset={new THREE.Vector3(0, compact ? 0.005 : 0.008, 0)} compact={compact} />}

      {analysis.stable && analysis.normal && analysis.binormal && (
        <>
          {showNormal && <VectorArrow origin={analysis.point} direction={analysis.normal} color="#059669" shortLabel="N" longLabel="Normal" highlighted={highlight === 'normal'} labelOffset={new THREE.Vector3(0, compact ? -0.005 : -0.009, 0)} compact={compact} />}
          {showBinormal && <VectorArrow origin={analysis.point} direction={analysis.binormal} color="#2563eb" shortLabel="B" longLabel="Binormal" highlighted={highlight === 'binormal'} labelOffset={new THREE.Vector3(compact ? 0.005 : 0.008, 0.005, 0)} compact={compact} />}
        </>
      )}

      {showCircle && analysis.stable && analysis.circleCenter && analysis.circleQuaternion && displayRadius !== null && (
        <group>
          <mesh position={analysis.circleCenter} quaternion={analysis.circleQuaternion}>
            <ringGeometry args={[
              Math.max(0.0001, displayRadius - 0.0008),
              displayRadius + 0.0008,
              80,
              1,
              localCircleArc ? -Math.PI / 2 - 0.82 : 0,
              localCircleArc ? 1.64 : Math.PI * 2,
            ]} />
            <meshBasicMaterial color="#d89b17" side={THREE.DoubleSide} transparent opacity={highlight === 'normal' ? 0.9 : 0.62} />
          </mesh>
          <mesh position={analysis.circleCenter}>
            <sphereGeometry args={[0.0032, 16, 16]} />
            <meshBasicMaterial color="#a16207" />
          </mesh>
          <Line points={[analysis.point, analysis.circleCenter]} color="#a16207" lineWidth={highlight === 'normal' ? 3 : 2} transparent opacity={0.75} />
          {!compact && circleLabelPosition && <Html position={circleLabelPosition} center distanceFactor={0.52}>
            <div className={`whitespace-nowrap rounded-lg border bg-amber-50/95 px-2 py-1 text-[10px] text-amber-900 shadow pointer-events-none ${highlight === 'normal' ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-300'}`}>
              <strong>Osculating Circle 密切圓</strong><br />κ = {analysis.curvature.toFixed(2)} · R = {analysis.radiusOfCurvature?.toFixed(3)} m
            </div>
          </Html>}
        </group>
      )}
    </group>
  );
};

export default FrenetInspector;
