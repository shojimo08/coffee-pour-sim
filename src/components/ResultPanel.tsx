import { useSimulationStore } from '../store/useSimulationStore';

import type React from 'react';

export const ResultPanel: React.FC = () => {
  const metrics = useSimulationStore((state) => state.metrics);
  const showEntryGeometry = useSimulationStore((state) => state.showEntryGeometry);
  const toggleEntryGeometry = useSimulationStore((state) => state.toggleEntryGeometry);
  const offsetDisplay = metrics.offset;
  const spillDisplay = metrics.spill;
  const successRateNum = Number(metrics.successRate);
  const timeDisplay = metrics.timeNeeded;
  const isSuccess = metrics.hitHole;
  const resultLabel = isSuccess
    ? '準確入杯'
    : metrics.collisionType === 'lid'
      ? '撞擊杯蓋'
      : metrics.collisionType === 'cup-wall'
        ? '撞擊杯壁'
        : '偏離目標';

  return (
    <div className="bg-white/88 backdrop-blur-md border border-slate-300 rounded-xl p-3 shadow-lg text-slate-700 w-60 select-none pointer-events-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="text-[11px] font-bold tracking-wide text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          模擬結果 <span className="font-semibold text-slate-400">What happened?</span>
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
          {resultLabel}
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
        依目前模擬的碰撞與幾何交疊模型，顯示這次倒入的結果。
      </p>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 mb-0.5">飲用孔中心偏移</p>
          <p className="text-sm font-bold font-mono text-slate-800">
            {offsetDisplay} <span className="text-[10px] font-normal text-slate-400">cm</span>
          </p>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 mb-0.5">幾何溢出率</p>
          <p className="text-sm font-bold font-mono text-amber-400">
            {spillDisplay} <span className="text-[10px] font-normal text-slate-400">%</span>
          </p>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 mb-0.5">注入成功率</p>
          <p className={`text-sm font-bold font-mono ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
            {successRateNum.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">%</span>
          </p>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 mb-0.5">落水所需時間</p>
          <p className="text-sm font-bold font-mono text-sky-400">
            {timeDisplay} <span className="text-[10px] font-normal text-slate-400">ms</span>
          </p>
        </div>
      </div>
      <p className="mt-2 text-[9px] leading-snug text-slate-500">
        Geometric Approximation：以水柱截面與飲用孔的圓形交疊面積估算，非 CFD 流體模擬。
      </p>
      <p className="mt-2 text-[9px] leading-snug text-slate-600">
        中心線命中只是第一步；杯口幾何可以進一步檢查入射方向與水柱寬度。
      </p>
      <button type="button" onClick={toggleEntryGeometry} className={`mt-2 min-h-9 w-full rounded-lg border px-2 text-[10px] font-bold transition ${showEntryGeometry ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
        {showEntryGeometry ? '隱藏杯口進入幾何' : '為什麼？查看杯口幾何'}
      </button>
    </div>
  );
};

export default ResultPanel;
