import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, PerspectiveCamera } from '@react-three/drei';
import { Lighting } from './Lighting';
import { GroundGrid } from './GroundGrid';
import { Mug } from './Mug';
import { TakeawayCup } from './TakeawayCup';
import { FrenetInspector } from './FrenetInspector';
import { LiquidStream } from './LiquidStream';
import { useSimulationStore } from '../store/useSimulationStore';
import { calculateTrajectory } from '../geometry/trajectory';
import { analyzeFrenetFrame } from '../geometry/frenet';
import { TnbLearningPanel } from '../components/TnbLearningPanel';
import { createSpatialTeachingCurve } from '../geometry/teachingCurve';
import { SpatialTeachingCurve } from './SpatialTeachingCurve';
import type { TnbHighlight } from './FrenetInspector';
import type { SimulationParams } from '../store/useSimulationStore';
import { analyzeEntryGeometry } from '../geometry/entryGeometry';
import { EntryGeometryInspector } from './EntryGeometryInspector';
import { EntryGeometryPanel } from '../components/EntryGeometryPanel';

const TEACHING_PARAMS: SimulationParams = {
  tiltAngle: 45,
  pourHeight: 22,
  horizontalDistance: 10,
  flowRate: 50,
  targetRadius: 4.5,
};

const SimulationDriver: React.FC = () => {
  const stepSimulation = useSimulationStore((state) => state.stepSimulation);
  const isPresentationMode = useSimulationStore((state) => state.isPresentationMode);
  useFrame((_, delta) => {
    if (!isPresentationMode) stepSimulation(delta);
  });
  return null;
};

const ResponsiveCamera: React.FC = () => {
  const width = useThree((state) => state.size.width);
  const position: [number, number, number] = width < 768
    ? [0.44, 0.3, 0.58]
    : width < 1200
      ? [0.38, 0.27, 0.48]
      : [0.32, 0.24, 0.38];
  const fov = width < 768 ? 48 : width < 1200 ? 43 : 38;
  return <PerspectiveCamera makeDefault position={position} fov={fov} near={0.01} far={10} />;
};

interface SceneContainerProps {
  showLearningPanel?: boolean;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ showLearningPanel = true }) => {
  const [tnbParameter, setTnbParameter] = useState(0.5);
  const [isTnbPlaying, setIsTnbPlaying] = useState(false);
  const [isSpatialDemo, setIsSpatialDemo] = useState(false);
  const [guidedProgress, setGuidedProgress] = useState(1);
  const tnbParameterRef = useRef(0.5);

  const params = useSimulationStore((state) => state.params);
  const currentTilt = useSimulationStore((state) => state.currentTilt);
  const streamProgress = useSimulationStore((state) => state.streamProgress);
  const isSimulating = useSimulationStore((state) => state.isSimulating);
  const setMetrics = useSimulationStore((state) => state.setMetrics);
  const guidedStep = useSimulationStore((state) => state.guidedStep);
  const isGuidedLearning = useSimulationStore((state) => state.isPresentationMode);
  const showEntryGeometry = useSimulationStore((state) => state.showEntryGeometry);
  const toggleEntryGeometry = useSimulationStore((state) => state.toggleEntryGeometry);

  const activeTilt = isSimulating ? currentTilt : params.tiltAngle;
  const normalTrajectory = useMemo(
    () => calculateTrajectory(params, activeTilt, streamProgress),
    [params, activeTilt, streamProgress],
  );
  const normalEntryTrajectory = useMemo(
    () => calculateTrajectory(params, activeTilt, 1),
    [params, activeTilt],
  );
  const isTeachingScene = isGuidedLearning && guidedStep <= 6;
  const visibleTrajectoryProgress = isTeachingScene ? guidedProgress : streamProgress;
  const teachingTrajectory = useMemo(
    () => calculateTrajectory(TEACHING_PARAMS, TEACHING_PARAMS.tiltAngle, guidedProgress),
    [guidedProgress],
  );
  const teachingEntryTrajectory = useMemo(
    () => calculateTrajectory(TEACHING_PARAMS, TEACHING_PARAMS.tiltAngle, 1),
    [],
  );
  const trajectory = isTeachingScene ? teachingTrajectory : normalTrajectory;
  const entryTrajectory = isTeachingScene
    ? teachingEntryTrajectory
    : normalEntryTrajectory;
  const entryAnalysis = useMemo(
    () => analyzeEntryGeometry(entryTrajectory),
    [entryTrajectory],
  );
  const entryGeometryVisible = showEntryGeometry && (!isGuidedLearning || guidedStep === 6 || guidedStep === 7);
  const normalEntryFocus = !isGuidedLearning && entryGeometryVisible;
  const points = visibleTrajectoryProgress > 0.02 ? trajectory.points : [];
  const metricsData = useMemo(() => ({
    offset: normalTrajectory.offset.toFixed(2),
    spill: normalTrajectory.spill.toFixed(1),
    successRate: normalTrajectory.successRate.toFixed(1),
    timeNeeded: normalTrajectory.timeNeeded,
    hitHole: normalTrajectory.hitHole,
    collisionType: normalTrajectory.collisionType,
  }), [normalTrajectory]);

  useEffect(() => {
    if (!isGuidedLearning || guidedStep === 0 || guidedStep === 7) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (guidedStep === 1) {
      if (reduceMotion) {
        const frame = requestAnimationFrame(() => setGuidedProgress(1));
        return () => cancelAnimationFrame(frame);
      }
      const startedAt = performance.now();
      let frame = 0;
      const reveal = (now: number) => {
        setGuidedProgress(Math.min(1, 0.04 + ((now - startedAt) / 1800) * 0.96));
        if (now - startedAt < 1800) frame = requestAnimationFrame(reveal);
      };
      frame = requestAnimationFrame(reveal);
      return () => cancelAnimationFrame(frame);
    }

    if (guidedStep < 2 || guidedStep > 5) {
      const frame = requestAnimationFrame(() => setGuidedProgress(1));
      return () => cancelAnimationFrame(frame);
    }
    const start = reduceMotion ? 0.5 : 0.12;
    if (reduceMotion) {
      const frame = requestAnimationFrame(() => {
        setGuidedProgress(1);
        tnbParameterRef.current = start;
        setTnbParameter(start);
      });
      return () => cancelAnimationFrame(frame);
    }

    const startedAt = performance.now();
    let frame = 0;
    const travel = (now: number) => {
      setGuidedProgress(1);
      const progress = Math.min(1, (now - startedAt) / 4200);
      const next = THREE.MathUtils.lerp(0.12, 0.84, progress);
      tnbParameterRef.current = next;
      setTnbParameter(next);
      if (progress < 1) frame = requestAnimationFrame(travel);
    };
    frame = requestAnimationFrame(travel);
    return () => cancelAnimationFrame(frame);
  }, [guidedStep, isGuidedLearning]);

  useEffect(() => {
    if (metricsData && typeof setMetrics === 'function') {
      setMetrics(metricsData);
    }
  }, [metricsData, setMetrics]);

  useEffect(() => {
    if (!isTnbPlaying || isGuidedLearning) return;
    let animationFrame = 0;
    let previousTime = performance.now();

    const animate = (time: number) => {
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const next = Math.min(tnbParameterRef.current + deltaSeconds * 0.22, 0.98);
      tnbParameterRef.current = next;
      setTnbParameter(next);
      if (next >= 0.98) {
        setIsTnbPlaying(false);
        return;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isTnbPlaying, isGuidedLearning]);

  const spatialTeachingCurve = useMemo(() => createSpatialTeachingCurve(), []);
  const showSpatialDemo = isSpatialDemo && !isGuidedLearning;
  const activeLearningCurve = showSpatialDemo ? spatialTeachingCurve : trajectory.curve;
  const frenetAnalysis = useMemo(
    () => activeLearningCurve ? analyzeFrenetFrame(activeLearningCurve, tnbParameter) : null,
    [activeLearningCurve, tnbParameter],
  );
  const guidedHighlight: TnbHighlight = isGuidedLearning
    ? guidedStep === 3
      ? 'tangent'
      : guidedStep === 4
        ? 'normal'
        : guidedStep === 5
          ? 'binormal'
          : null
    : null;
  const guidedFrenetVisibility = isGuidedLearning
    ? {
        tangent: guidedStep >= 3,
        normal: guidedStep >= 4,
        binormal: guidedStep >= 5,
        circle: guidedStep === 4,
      }
    : undefined;

  const handleToggleTnbPlay = () => {
    if (!isTnbPlaying && tnbParameter >= 0.98) {
      tnbParameterRef.current = 0.02;
      setTnbParameter(0.02);
    }
    setIsTnbPlaying((playing) => !playing);
  };

  const handleTnbParameterChange = (parameter: number) => {
    setIsTnbPlaying(false);
    tnbParameterRef.current = parameter;
    setTnbParameter(parameter);
  };

  return (
    <div className="scene-container cursor-grab active:cursor-grabbing select-none">
      <div className="scene-canvas-shell">
        <Canvas
          shadows
          camera={{ position: [0.32, 0.24, 0.38], fov: 38 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ touchAction: 'none' }}
        >
        <ResponsiveCamera />
        <color attach="background" args={['#d6d9de']} />
        <fog attach="fog" args={['#d6d9de', 0.75, 2.2]} />
        <Lighting />
        <GroundGrid />

        <Mug
          presentationParams={isTeachingScene ? TEACHING_PARAMS : undefined}
          presentationTilt={isTeachingScene ? TEACHING_PARAMS.tiltAngle : undefined}
        />
        <TakeawayCup />
        <SimulationDriver />

        {visibleTrajectoryProgress > 0.02 && (
          <LiquidStream
            trajectory={trajectory}
            radius={trajectory.streamRadius}
            progress={visibleTrajectoryProgress}
            emphasized={isGuidedLearning && guidedStep === 2}
          />
        )}

        {showSpatialDemo && <SpatialTeachingCurve curve={spatialTeachingCurve} />}

        {!normalEntryFocus && (points.length > 6 || showSpatialDemo) && frenetAnalysis &&
          (!isGuidedLearning || (guidedStep >= 2 && guidedStep <= 5)) && (
          <FrenetInspector
            analysis={frenetAnalysis}
            highlight={guidedHighlight}
            visibility={guidedFrenetVisibility}
            localCircleArc={isGuidedLearning && guidedStep === 4}
          />
        )}

        {entryGeometryVisible && entryAnalysis && <EntryGeometryInspector analysis={entryAnalysis} />}

        <OrbitControls
          makeDefault
          target={[0, 0.08, 0]}
          minDistance={0.15}
          maxDistance={1.4}
          maxPolarAngle={Math.PI / 2 - 0.02}
          dampingFactor={0.06}
          enableDamping
          enablePan={false}
        />

        <GizmoHelper alignment="top-right" margin={[60, 90]}>
          <GizmoViewport axisColors={['#dc2626', '#059669', '#2563eb']} labelColor="#0f172a" />
        </GizmoHelper>
        </Canvas>
      </div>

      {!isGuidedLearning && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[520px] rounded-xl border border-slate-300 bg-white/90 px-4 py-2 text-center shadow-sm pointer-events-none">
        <p className="text-sm font-black text-slate-900">一條咖啡流線，在每個位置是如何前進與彎曲的？</p>
        <p className="text-[11px] text-slate-600">
          {normalEntryFocus
            ? '這條流線到達杯口時，是否能安全通過？'
            : '拖動參數，觀察 P(t)、T、N、B 與曲率如何改變。'}
        </p>
      </div>}

      {!isGuidedLearning && (
        <div className={`analysis-panel-host tnb-panel-host ${showLearningPanel ? '' : 'mobile-panel-hidden'}`}>
          {(points.length > 6 || showSpatialDemo) && frenetAnalysis && (
            <div hidden={normalEntryFocus}>
              <TnbLearningPanel
                analysis={frenetAnalysis}
                parameter={tnbParameter}
                isPlaying={isTnbPlaying}
                isSpatialDemo={isSpatialDemo}
                onParameterChange={handleTnbParameterChange}
                onTogglePlay={handleToggleTnbPlay}
                onToggleSpatialDemo={() => setIsSpatialDemo((enabled) => !enabled)}
                onInspectEntry={toggleEntryGeometry}
              />
            </div>
          )}
          <div hidden={!normalEntryFocus}>
            <EntryGeometryPanel analysis={entryAnalysis} docked />
          </div>
        </div>
      )}

      {isGuidedLearning && guidedStep === 7 && (points.length > 6 || showSpatialDemo) && frenetAnalysis && (
        <div className={`tnb-panel-host ${showLearningPanel ? '' : 'mobile-panel-hidden'}`}>
          <TnbLearningPanel
            analysis={frenetAnalysis}
            parameter={tnbParameter}
            isPlaying={isTnbPlaying}
            isSpatialDemo={isSpatialDemo}
            onParameterChange={handleTnbParameterChange}
            onTogglePlay={handleToggleTnbPlay}
            onToggleSpatialDemo={() => setIsSpatialDemo((enabled) => !enabled)}
          />
        </div>
      )}

      {isGuidedLearning && entryGeometryVisible && (
        <EntryGeometryPanel analysis={entryAnalysis} guided={guidedStep === 6} />
      )}
    </div>
  );
};

export default SceneContainer;
