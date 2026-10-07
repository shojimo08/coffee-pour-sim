import * as THREE from 'three';

export interface FrenetFrameAnalysis {
  parameter: number;
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3 | null;
  binormal: THREE.Vector3 | null;
  curvature: number;
  radiusOfCurvature: number | null;
  torsion: number;
  isPlanar: boolean;
  stable: boolean;
  circleCenter: THREE.Vector3 | null;
  circleQuaternion: THREE.Quaternion | null;
}

const DERIVATIVE_STEP = 0.002;
const CURVATURE_EPSILON = 1e-5;
const TORSION_EPSILON = 1e-3;
const PLANAR_EPSILON = 1e-4;

export function isCurveApproximatelyPlanar(curve: THREE.Curve<THREE.Vector3>) {
  const samples = Array.from({ length: 17 }, (_, index) => curve.getPoint(index / 16));
  const origin = samples[0];
  const firstDirection = samples.find((point) => point.distanceToSquared(origin) > 1e-10)?.clone().sub(origin);
  if (!firstDirection) return true;

  let planeNormal: THREE.Vector3 | null = null;
  for (const point of samples) {
    const candidate = new THREE.Vector3().crossVectors(firstDirection, point.clone().sub(origin));
    if (candidate.lengthSq() > 1e-10) {
      planeNormal = candidate.normalize();
      break;
    }
  }
  if (!planeNormal) return true;
  return samples.every((point) => Math.abs(point.clone().sub(origin).dot(planeNormal)) < PLANAR_EPSILON);
}

/** Computes a Frenet frame directly from the same curve rendered as coffee. */
export function analyzeFrenetFrame(
  curve: THREE.Curve<THREE.Vector3>,
  parameter: number,
): FrenetFrameAnalysis {
  const t = THREE.MathUtils.clamp(parameter, 0.02, 0.98);
  const t0 = Math.max(0, t - DERIVATIVE_STEP);
  const t1 = Math.min(1, t + DERIVATIVE_STEP);
  const span = t1 - t0;
  const pointBefore = curve.getPoint(t0);
  const point = curve.getPoint(t);
  const pointAfter = curve.getPoint(t1);
  const isPlanar = isCurveApproximatelyPlanar(curve);

  const firstDerivative = pointAfter.clone().sub(pointBefore).divideScalar(span);
  const tangent = firstDerivative.lengthSq() > 1e-12
    ? firstDerivative.clone().normalize()
    : new THREE.Vector3(1, 0, 0);

  const tangentBefore = curve.getTangent(t0).normalize();
  const tangentAfter = curve.getTangent(t1).normalize();
  const tangentDerivative = tangentAfter.clone().sub(tangentBefore).divideScalar(span);
  const speed = firstDerivative.length();
  const curvature = speed > 1e-8 ? tangentDerivative.length() / speed : 0;
  const derivativeT0 = Math.max(0, t - 2 * DERIVATIVE_STEP);
  const derivativeT3 = Math.min(1, t + 2 * DERIVATIVE_STEP);
  const h = Math.min(t - derivativeT0, derivativeT3 - t) / 2;
  let torsion = 0;
  if (h > 1e-6) {
    const pm2 = curve.getPoint(t - 2 * h);
    const pm1 = curve.getPoint(t - h);
    const pp1 = curve.getPoint(t + h);
    const pp2 = curve.getPoint(t + 2 * h);
    const r1 = pp1.clone().sub(pm1).divideScalar(2 * h);
    const r2 = pp1.clone().add(pm1).sub(point.clone().multiplyScalar(2)).divideScalar(h * h);
    const r3 = pp2.clone().addScaledVector(pp1, -2).addScaledVector(pm1, 2).sub(pm2).divideScalar(2 * h * h * h);
    const cross = new THREE.Vector3().crossVectors(r1, r2);
    const denominator = cross.lengthSq();
    if (denominator > 1e-12) torsion = cross.dot(r3) / denominator;
  }
  if (!Number.isFinite(torsion) || Math.abs(torsion) < TORSION_EPSILON || isPlanar) torsion = 0;
  const stable =
    Number.isFinite(curvature) &&
    curvature >= CURVATURE_EPSILON &&
    tangentDerivative.lengthSq() > 1e-12;

  if (!stable) {
    return {
      parameter: t,
      point,
      tangent,
      normal: null,
      binormal: null,
      curvature: Number.isFinite(curvature) ? curvature : 0,
      radiusOfCurvature: null,
      torsion,
      isPlanar,
      stable: false,
      circleCenter: null,
      circleQuaternion: null,
    };
  }

  const normal = tangentDerivative.normalize();
  const binormalCandidate = new THREE.Vector3().crossVectors(tangent, normal);
  if (binormalCandidate.lengthSq() < 1e-12) {
    return {
      parameter: t,
      point,
      tangent,
      normal: null,
      binormal: null,
      curvature,
      radiusOfCurvature: null,
      torsion,
      isPlanar,
      stable: false,
      circleCenter: null,
      circleQuaternion: null,
    };
  }

  const binormal = binormalCandidate.normalize();
  // Re-orthogonalize N to prevent finite-difference drift.
  normal.crossVectors(binormal, tangent).normalize();
  const radiusOfCurvature = 1 / curvature;
  const displayRadius = THREE.MathUtils.clamp(radiusOfCurvature, 0.012, 0.16);
  const circleCenter = point.clone().add(normal.clone().multiplyScalar(displayRadius));
  const basis = new THREE.Matrix4().makeBasis(tangent, normal, binormal);

  return {
    parameter: t,
    point,
    tangent,
    normal,
    binormal,
    curvature,
    radiusOfCurvature,
    torsion,
    isPlanar,
    stable: true,
    circleCenter,
    circleQuaternion: new THREE.Quaternion().setFromRotationMatrix(basis),
  };
}
