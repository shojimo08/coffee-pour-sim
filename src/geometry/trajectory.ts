import * as THREE from 'three';
import type { SimulationParams } from '../store/useSimulationStore';
import { MUG, TAKEAWAY_CUP } from './cupGeometry';

export type CollisionType = 'hole' | 'lid' | 'cup-wall' | 'cup-bottom' | 'miss';

export interface TrajectoryResult {
  points: THREE.Vector3[];
  curve: THREE.CatmullRomCurve3 | null;
  outletPoint: THREE.Vector3;
  lidIntersectionPoint: THREE.Vector3 | null;
  lidIntersectionTime: number | null;
  collisionTime: number;
  drinkingHoleCenter: THREE.Vector3;
  hitHole: boolean;
  collisionType: CollisionType;
  finalVisibleEndpoint: THREE.Vector3;
  timeNeeded: number;
  offset: number;
  spill: number;
  successRate: number;
  spillRate: number;
  streamRadius: number;
  overlapArea: number;
}

const GRAVITY = 9.81;
const EPSILON = 1e-7;

export function calculateStreamRadius(flowRate: number) {
  return 0.0022 + (flowRate / 100) * 0.003;
}

/** Area shared by two circles with radii r1/r2 and centre distance d. */
export function calculateCircleOverlapArea(r1: number, r2: number, d: number) {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;

  const angle1 = Math.acos(THREE.MathUtils.clamp((d * d + r1 * r1 - r2 * r2) / (2 * d * r1), -1, 1));
  const angle2 = Math.acos(THREE.MathUtils.clamp((d * d + r2 * r2 - r1 * r1) / (2 * d * r2), -1, 1));
  const lens = 0.5 * Math.sqrt(
    Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)),
  );
  return r1 * r1 * angle1 + r2 * r2 * angle2 - lens;
}

function pointAt(outlet: THREE.Vector3, vx: number, vy: number, time: number) {
  return new THREE.Vector3(
    outlet.x + vx * time,
    outlet.y + vy * time - 0.5 * GRAVITY * time * time,
    outlet.z,
  );
}

function timeAtY(outletY: number, vy: number, targetY: number): number | null {
  const discriminant = vy * vy + 2 * GRAVITY * (outletY - targetY);
  if (discriminant < 0) return null;
  const time = (vy + Math.sqrt(discriminant)) / GRAVITY;
  return time >= 0 ? time : null;
}

function outerRadiusAtY(y: number) {
  const ratio = THREE.MathUtils.clamp(y / TAKEAWAY_CUP.height, 0, 1);
  return THREE.MathUtils.lerp(
    TAKEAWAY_CUP.bottomOuterRadius,
    TAKEAWAY_CUP.cupOuterRadius,
    ratio,
  );
}

function innerRadiusAtY(y: number) {
  return outerRadiusAtY(y) - TAKEAWAY_CUP.wallThickness;
}

/**
 * Computes the canonical ballistic curve and clips it at the first solid object.
 * The lid hole is tested at the exact lid-plane intersection, not at a later
 * landing point. All scene and result consumers use this result.
 */
export function calculateTrajectory(
  params: SimulationParams,
  tiltDegrees = params.tiltAngle,
  visibleProgress = 1,
): TrajectoryResult {
  const tiltRad = THREE.MathUtils.degToRad(tiltDegrees);
  const distance = params.horizontalDistance / 100;
  const height = params.pourHeight / 100;

  // Matches the mug's lip pivot and its tilted outer rim.
  const outletPoint = new THREE.Vector3(
    -distance + MUG.outerTopRadius * Math.cos(tiltRad),
    height - MUG.outerTopRadius * Math.sin(tiltRad),
    0,
  );
  const speed = (params.flowRate / 100) * 0.9 + 0.25;
  const vx = speed * Math.sin(tiltRad);
  const vy = -speed * Math.cos(tiltRad) * 0.4;
  const holeCenter = new THREE.Vector3(
    TAKEAWAY_CUP.drinkingHoleCenter.x,
    TAKEAWAY_CUP.lidPlaneY,
    TAKEAWAY_CUP.drinkingHoleCenter.z,
  );

  const lidTime = timeAtY(outletPoint.y, vy, TAKEAWAY_CUP.lidPlaneY);
  const lidPoint = lidTime === null ? null : pointAt(outletPoint, vx, vy, lidTime);
  const lidDistance = lidPoint
    ? Math.hypot(lidPoint.x - holeCenter.x, lidPoint.z - holeCenter.z)
    : Number.POSITIVE_INFINITY;
  const radialAtLid = lidPoint ? Math.hypot(lidPoint.x, lidPoint.z) : Number.POSITIVE_INFINITY;
  const hitHole = lidDistance <= TAKEAWAY_CUP.drinkingHoleRadius + EPSILON;
  const streamRadius = calculateStreamRadius(params.flowRate);
  const streamCrossSectionArea = Math.PI * streamRadius * streamRadius;
  const overlapArea = Number.isFinite(lidDistance)
    ? calculateCircleOverlapArea(streamRadius, TAKEAWAY_CUP.drinkingHoleRadius, lidDistance)
    : 0;
  // Geometric approximation only: circular stream/hole overlap, not CFD.
  const successRate = THREE.MathUtils.clamp(
    (overlapArea / streamCrossSectionArea) * 100,
    0,
    100,
  );
  const spillRate = 100 - successRate;

  let collisionType: CollisionType = 'miss';
  let collisionTime: number;

  if (lidTime !== null && hitHole) {
    collisionType = 'hole';
    const coffeeTime = timeAtY(outletPoint.y, vy, TAKEAWAY_CUP.coffeeSurfaceY) ?? lidTime;
    collisionTime = coffeeTime;

    // A fast stream can enter the hole and then meet the inner wall. Clip it
    // there so the tube never emerges through the cup's solid shell.
    const samples = 160;
    for (let i = 1; i <= samples; i += 1) {
      const t = THREE.MathUtils.lerp(lidTime, coffeeTime, i / samples);
      const point = pointAt(outletPoint, vx, vy, t);
      if (Math.hypot(point.x, point.z) >= innerRadiusAtY(point.y)) {
        let low = THREE.MathUtils.lerp(lidTime, coffeeTime, (i - 1) / samples);
        let high = t;
        for (let iteration = 0; iteration < 18; iteration += 1) {
          const mid = (low + high) / 2;
          const candidate = pointAt(outletPoint, vx, vy, mid);
          if (Math.hypot(candidate.x, candidate.z) >= innerRadiusAtY(candidate.y)) high = mid;
          else low = mid;
        }
        collisionTime = high;
        break;
      }
    }
  } else if (lidTime !== null && radialAtLid <= TAKEAWAY_CUP.lidRadius + EPSILON) {
    collisionType = 'lid';
    collisionTime = lidTime;
  } else {
    // Search continuously enough for the first crossing of the tapered wall.
    const groundTime = timeAtY(outletPoint.y, vy, 0) ?? 1;
    collisionTime = groundTime;
    const samples = 400;
    let previousInside = false;

    for (let i = 1; i <= samples; i += 1) {
      const t = (groundTime * i) / samples;
      const point = pointAt(outletPoint, vx, vy, t);
      const inCupHeight = point.y >= TAKEAWAY_CUP.bottomY && point.y <= TAKEAWAY_CUP.height;
      const inside = inCupHeight && Math.hypot(point.x, point.z) <= outerRadiusAtY(point.y);

      if (inside && !previousInside) {
        let low = (groundTime * (i - 1)) / samples;
        let high = t;
        for (let iteration = 0; iteration < 18; iteration += 1) {
          const mid = (low + high) / 2;
          const candidate = pointAt(outletPoint, vx, vy, mid);
          const candidateInside =
            candidate.y >= TAKEAWAY_CUP.bottomY &&
            candidate.y <= TAKEAWAY_CUP.height &&
            Math.hypot(candidate.x, candidate.z) <= outerRadiusAtY(candidate.y);
          if (candidateInside) high = mid;
          else low = mid;
        }
        collisionType = 'cup-wall';
        collisionTime = high;
        break;
      }
      previousInside = inside;
    }
  }

  const progress = THREE.MathUtils.clamp(visibleProgress, 0, 1);
  const visibleTime = collisionTime * progress;
  const steps = Math.max(8, Math.ceil(48 * progress));
  const points = Array.from({ length: steps + 1 }, (_, index) =>
    pointAt(outletPoint, vx, vy, (visibleTime * index) / steps),
  );
  const finalVisibleEndpoint = points[points.length - 1].clone();

  return {
    points,
    curve: points.length >= 3 ? new THREE.CatmullRomCurve3(points) : null,
    outletPoint,
    lidIntersectionPoint: lidPoint,
    lidIntersectionTime: lidTime,
    collisionTime,
    drinkingHoleCenter: holeCenter,
    hitHole,
    collisionType,
    finalVisibleEndpoint,
    timeNeeded: Math.round((lidTime ?? collisionTime) * 1000),
    offset: Number.isFinite(lidDistance) ? Number((lidDistance * 100).toFixed(2)) : 99.9,
    spill: spillRate,
    spillRate,
    successRate,
    streamRadius,
    overlapArea,
  };
}
