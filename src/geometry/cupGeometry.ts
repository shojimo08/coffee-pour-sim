/** Shared scene dimensions in metres. */
export const TAKEAWAY_CUP = {
  height: 0.125,
  bottomOuterRadius: 0.03,
  cupOuterRadius: 0.042,
  wallThickness: 0.003,
  cupInnerRadius: 0.039,
  lidRadius: 0.0435,
  lidRimHeight: 0.006,
  lidDeckHeight: 0.006,
  lidPlaneY: 0.137,
  drinkingHoleRadius: 0.0075,
  drinkingHoleCenter: { x: 0.025, z: 0 },
  coffeeSurfaceRadius: 0.0275,
  coffeeSurfaceY: 0.018,
  bottomY: 0.004,
} as const;

export const MUG = {
  height: 0.08,
  outerTopRadius: 0.036,
  outerBottomRadius: 0.033,
  innerTopRadius: 0.0325,
  innerBottomRadius: 0.0295,
} as const;
