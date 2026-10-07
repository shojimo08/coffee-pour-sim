import * as THREE from 'three';
import { TAKEAWAY_CUP } from './cupGeometry';
import { analyzeFrenetFrame } from './frenet';
import type { TrajectoryResult } from './trajectory';

export type EntryGeometryStatus = 'safe' | 'tight' | 'spill-risk';

export interface EntryGeometryAnalysis {
  lidTime: number;
  curveParameter: number;
  point: THREE.Vector3;
  holeCenter: THREE.Vector3;
  tangent: THREE.Vector3;
  centerOffset: number;
  basicMargin: number;
  basicStatus: EntryGeometryStatus;
  entryAngleRadians: number;
  entryAngleDegrees: number;
  footprintSemiMajor: number;
  footprintSemiMinor: number;
  footprintMajorDirection: THREE.Vector3;
  footprintMinorDirection: THREE.Vector3;
  directionalMargin: number | null;
  directionalStatus: EntryGeometryStatus | null;
  nearGrazing: boolean;
  marginTolerance: number;
}

const LID_NORMAL = new THREE.Vector3(0, 1, 0);
const GRAZING_COSINE_LIMIT = 0.05;
const FOOTPRINT_SAMPLES = 96;

const classifyMargin = (margin: number, tolerance: number): EntryGeometryStatus => {
  if (margin > tolerance) return 'safe';
  if (margin < -tolerance) return 'spill-risk';
  return 'tight';
};

/**
 * Analyzes the already-computed lid event. It does not solve another trajectory
 * intersection and does not participate in collision or success calculations.
 */
export function analyzeEntryGeometry(trajectory: TrajectoryResult): EntryGeometryAnalysis | null {
  const { lidIntersectionPoint: point, lidIntersectionTime: lidTime, collisionTime, curve } = trajectory;
  if (!point || lidTime === null || !curve || collisionTime <= 0) return null;

  const rawParameter = lidTime / collisionTime;
  if (!Number.isFinite(rawParameter)) return null;
  const frenet = analyzeFrenetFrame(curve, rawParameter);
  const tangent = frenet.tangent.clone();
  if (!Number.isFinite(tangent.lengthSq()) || tangent.lengthSq() < 1e-12) return null;

  const holeCenter = trajectory.drinkingHoleCenter.clone();
  // d = ||Q-C|| is measured only in the existing horizontal lid plane.
  const centerOffset = Math.hypot(point.x - holeCenter.x, point.z - holeCenter.z);
  const holeRadius = TAKEAWAY_CUP.drinkingHoleRadius;
  const streamRadius = trajectory.streamRadius;
  // Circular, lid-plane approximation: positive m means the entire circle fits.
  const basicMargin = holeRadius - streamRadius - centerOffset;

  // θ is measured from the lid normal: 0° is perpendicular, 90° is grazing.
  const cosine = THREE.MathUtils.clamp(Math.abs(tangent.dot(LID_NORMAL)), 0, 1);
  const entryAngleRadians = Math.acos(cosine);
  const nearGrazing = cosine < GRAZING_COSINE_LIMIT;
  // A local circular cylinder cuts the lid plane as an ellipse: a=r/cosθ, b=r.
  const footprintSemiMajor = streamRadius / Math.max(cosine, GRAZING_COSINE_LIMIT);
  const footprintSemiMinor = streamRadius;

  const projectedTangent = tangent.clone().setY(0);
  const footprintMajorDirection = projectedTangent.lengthSq() > 1e-12
    ? projectedTangent.normalize()
    : new THREE.Vector3(1, 0, 0);
  const footprintMinorDirection = new THREE.Vector3()
    .crossVectors(LID_NORMAL, footprintMajorDirection)
    .normalize();

  // 0.2% of the hole radius (at least 0.01 mm) absorbs display-only float noise.
  const marginTolerance = Math.max(1e-5, holeRadius * 0.002);
  let directionalMargin: number | null = null;
  let directionalStatus: EntryGeometryStatus | null = null;
  if (!nearGrazing) {
    // The ellipse contains the radius-r_s circle, so its farthest boundary
    // cannot be closer to C than the circular baseline d + r_s.
    let maximumDistance = centerOffset + streamRadius;
    for (let index = 0; index < FOOTPRINT_SAMPLES; index += 1) {
      const angle = (index / FOOTPRINT_SAMPLES) * Math.PI * 2;
      const boundaryPoint = point.clone()
        .addScaledVector(footprintMajorDirection, footprintSemiMajor * Math.cos(angle))
        .addScaledVector(footprintMinorDirection, footprintSemiMinor * Math.sin(angle));
      const sampledEllipseDistance = Math.hypot(
        boundaryPoint.x - holeCenter.x,
        boundaryPoint.z - holeCenter.z,
      );
      maximumDistance = Math.max(maximumDistance, sampledEllipseDistance);
    }
    directionalMargin = holeRadius - maximumDistance;
    directionalStatus = classifyMargin(directionalMargin, marginTolerance);
  }

  if (![centerOffset, basicMargin, entryAngleRadians, footprintSemiMajor].every(Number.isFinite)) return null;
  return {
    lidTime,
    curveParameter: frenet.parameter,
    point: point.clone(),
    holeCenter,
    tangent,
    centerOffset,
    basicMargin,
    basicStatus: classifyMargin(basicMargin, marginTolerance),
    entryAngleRadians,
    entryAngleDegrees: THREE.MathUtils.radToDeg(entryAngleRadians),
    footprintSemiMajor,
    footprintSemiMinor,
    footprintMajorDirection,
    footprintMinorDirection,
    directionalMargin,
    directionalStatus,
    nearGrazing,
    marginTolerance,
  };
}
