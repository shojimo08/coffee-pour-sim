import * as THREE from 'three';

/** Independent geometry example. It is never used by coffee physics/collision. */
export function createSpatialTeachingCurve() {
  const points = Array.from({ length: 65 }, (_, index) => {
    const t = index / 64;
    const angle = t * Math.PI * 2;
    return new THREE.Vector3(
      -0.13 + t * 0.23,
      0.105 + t * 0.07 + Math.sin(angle) * 0.018,
      Math.cos(angle) * 0.035,
    );
  });
  return new THREE.CatmullRomCurve3(points, false, 'centripetal');
}
