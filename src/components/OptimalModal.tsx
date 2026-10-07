import React from 'react';
import { Sparkles, Check, X, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';

export const OptimalModal: React.FC = () => {
  const {
    showOptimalModal,
    optimalResult,
    applyOptimalSettings,
    closeOptimalModal,
    params,
  } = useSimulationStore();

  if (!showOptimalModal || !optimalResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900/95 border border-sky-500/30 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100 relative">
        <button
          onClick={closeOptimalModal}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-sky-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">Optimal Pour Solution Found</h3>
            <p className="text-xs text-slate-400">Calculated via Two-Phase Numerical Optimization</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
          <div className="text-[11px] text-slate-400 uppercase font-sans font-semibold tracking-wider border-b border-white/5 pb-1.5 flex justify-between">
            <span>Parameter</span>
            <span>Current → Optimal</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans">Cup Tilt Angle</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{params.tiltAngle.toFixed(1)}°</span>
              <ArrowRight size={12} className="text-sky-400" />
              <span className="font-bold text-sky-400">{optimalResult.tiltAngle.toFixed(1)}°</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans">Pour Height</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{params.pourHeight.toFixed(1)} cm</span>
              <ArrowRight size={12} className="text-sky-400" />
              <span className="font-bold text-sky-400">{optimalResult.pourHeight.toFixed(1)} cm</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans">Horizontal Distance</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{params.horizontalDistance.toFixed(1)} cm</span>
              <ArrowRight size={12} className="text-sky-400" />
              <span className="font-bold text-sky-400">{optimalResult.horizontalDistance.toFixed(1)} cm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Target size={11} className="text-amber-400" /> Center Offset
            </div>
            <div className="text-sm font-bold font-mono text-slate-100 mt-1">
              {optimalResult.distanceFromCenter.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">cm</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400">Pred. Spillage</div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {optimalResult.spillageVolume.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">ml</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck size={11} className="text-emerald-400" /> Accuracy
            </div>
            <div className="text-sm font-bold font-mono text-sky-400 mt-1">
              {optimalResult.accuracy.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={closeOptimalModal}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={applyOptimalSettings}
            className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-950/50 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Check size={15} />
            Apply Optimal Settings
          </button>
        </div>
      </div>
    </div>
  );
};