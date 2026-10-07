import { create } from 'zustand';
import { calculateTrajectory, type CollisionType } from '../geometry/trajectory';

export interface SimulationParams {
  tiltAngle: number;
  pourHeight: number;
  horizontalDistance: number;
  flowRate: number;
  targetRadius: number;
}

export interface SimulationMetrics {
  offset: string;
  spill: string;
  successRate: string;
  timeNeeded: number;
  hitHole: boolean;
  collisionType: CollisionType;
}

export interface SimulationState {
  params: SimulationParams;
  currentTilt: number;
  streamProgress: number;
  isSimulating: boolean;
  isPresentationMode: boolean;
  isTeachingCup: boolean;
  guidedStep: number;
  showEntryGeometry: boolean;
  metrics: SimulationMetrics;
  setParams: (newParams: Partial<SimulationParams>) => void;
  setMetrics: (metrics: SimulationMetrics) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: (delta: number) => void;
  togglePresentationMode: () => void;
  openPresentationMode: () => void;
  closePresentationMode: () => void;
  toggleTeachingCup: () => void;
  setGuidedStep: (step: number) => void;
  toggleEntryGeometry: () => void;
}

export function calculatePourPhysics(params: SimulationParams) {
  const result = calculateTrajectory(params);
  return { ...result, isHit: result.hitHole };
}

const defaultParams: SimulationParams = {
  tiltAngle: 45,
  pourHeight: 22,
  horizontalDistance: 10,
  flowRate: 50,
  targetRadius: 4.5,
};

const defaultTrajectory = calculateTrajectory(defaultParams);
const defaultMetrics: SimulationMetrics = {
  offset: defaultTrajectory.offset.toFixed(2),
  spill: defaultTrajectory.spillRate.toFixed(1),
  successRate: defaultTrajectory.successRate.toFixed(1),
  timeNeeded: defaultTrajectory.timeNeeded,
  hitHole: defaultTrajectory.hitHole,
  collisionType: defaultTrajectory.collisionType,
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  params: defaultParams,
  currentTilt: 0,
  streamProgress: 0,
  isSimulating: false,
  isPresentationMode: true,
  isTeachingCup: true,
  guidedStep: 0,
  showEntryGeometry: false,
  metrics: defaultMetrics,

  setParams: (newParams) => {
    set((state) => {
      const nextParams = { ...state.params, ...newParams };
      // 如果不在模擬中，傾倒角度不跟著預設跑
      return { params: nextParams };
    });
  },

  setMetrics: (metrics) => set({ metrics }),

  togglePresentationMode: () =>
    set((state) => ({ isPresentationMode: !state.isPresentationMode, guidedStep: 0 })),
  openPresentationMode: () => set({ isPresentationMode: true, guidedStep: 0 }),
  closePresentationMode: () => set({ isPresentationMode: false, guidedStep: 0 }),
  toggleTeachingCup: () => set((state) => ({ isTeachingCup: !state.isTeachingCup })),
  setGuidedStep: (step) => set({ guidedStep: Math.min(7, Math.max(0, step)) }),
  toggleEntryGeometry: () => set((state) => ({ showEntryGeometry: !state.showEntryGeometry })),

  startSimulation: () => {
    set({ isSimulating: true });
  },

  stopSimulation: () => {
    set({ isSimulating: false });
  },

  resetSimulation: () => {
    set({
      isSimulating: false,
      currentTilt: 0,
      streamProgress: 0,
      metrics: defaultMetrics,
    });
  },

  // 由 Three.js useFrame 每一幀平滑推進，絕不再使用脆弱的 setInterval
  stepSimulation: (delta: number) => {
    const { isSimulating, currentTilt, streamProgress, params } = get();
    if (!isSimulating) return;

    const targetTilt = params.tiltAngle || 45;
    const tiltSpeed = 45; // 每秒轉 45 度
    const streamSpeed = 1.2; // 每秒水流推進

    const nextTilt = Math.min(targetTilt, currentTilt + delta * tiltSpeed);
    const nextStream = Math.min(1.0, streamProgress + delta * streamSpeed);

    set({
      currentTilt: Number.isFinite(nextTilt) ? nextTilt : 0,
      streamProgress: Number.isFinite(nextStream) ? nextStream : 0,
    });

    if (nextTilt >= targetTilt && nextStream >= 1.0) {
      set({ isSimulating: false });
    }
  },
}));

export default useSimulationStore;
