import React from 'react';
import { Sliders, RotateCcw, Play, Pause } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';

export const ControlPanel: React.FC = () => {
  const params = useSimulationStore((state) => state.params);
  const setParams = useSimulationStore((state) => state.setParams);
  const currentTilt = useSimulationStore((state) => state.currentTilt);
  const isSimulating = useSimulationStore((state) => state.isSimulating);
  const startSimulation = useSimulationStore((state) => state.startSimulation);
  const stopSimulation = useSimulationStore((state) => state.stopSimulation);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const isTeachingCup = useSimulationStore((state) => state.isTeachingCup);
  const toggleTeachingCup = useSimulationStore((state) => state.toggleTeachingCup);

  const tiltTarget = params?.tiltAngle || 45;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((currentTilt || 0) / tiltTarget) * 100)));
  const safeProgress = Number.isNaN(progressPercent) ? 0 : progressPercent;

  const handleChange = (key: string, value: number) => {
    setParams({ [key]: value });
  };

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between text-slate-200 select-none bg-slate-900 border-l border-slate-700/60 shadow-2xl">
      <div className="space-y-6">
        {/* 標題 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">改變咖啡曲線</h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
            即時連動
          </span>
        </div>

        {/* 4 個核心物理滑桿 */}
        <div className="space-y-5">
          {/* 1. 傾倒傾角 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">傾倒傾角 (Tilt Angle)</span>
              <span className="font-mono text-sky-400 font-bold">{params.tiltAngle}°</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">改變杯子倒出的方向，觀察曲線起始方向如何改變。</p>
            <input
              type="range"
              min={15}
              max={75}
              step={1}
              value={params.tiltAngle}
              onChange={(e) => handleChange('tiltAngle', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* 2. 傾倒高度 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">傾倒高度 (Height)</span>
              <span className="font-mono text-sky-400 font-bold">{params.pourHeight} cm</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">改變咖啡落下的高度，觀察下墜路徑的長短。</p>
            <input
              type="range"
              min={14}
              max={32}
              step={1}
              value={params.pourHeight}
              onChange={(e) => handleChange('pourHeight', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* 3. 水平間距 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">水平間距 (Distance)</span>
              <span className="font-mono text-sky-400 font-bold">{params.horizontalDistance} cm</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">改變兩個杯子的水平距離。</p>
            <input
              type="range"
              min={4}
              max={22}
              step={1}
              value={params.horizontalDistance}
              onChange={(e) => handleChange('horizontalDistance', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* 4. 液體流量 */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">液體流量 (Flow Rate - 水柱粗細)</span>
              <span className="font-mono text-sky-400 font-bold">{params.flowRate} mL/s</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">改變咖啡離開杯口的初始速度與水柱粗細。</p>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={params.flowRate}
              onChange={(e) => handleChange('flowRate', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* 傾倒進度條 */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-slate-400">傾倒進度</span>
            <span className="font-mono text-sky-400 font-bold">{safeProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-75 rounded-full"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
          <div>
            <p className="text-xs font-bold text-slate-200">杯體顯示</p>
            <p className="text-[10px] text-slate-400">只改變外觀；液面高度為幾何近似（非 CFD），不影響計算。</p>
          </div>
          <button type="button" onClick={toggleTeachingCup} className={`control-touch shrink-0 rounded-full border px-3 py-2 text-[10px] font-bold cursor-pointer ${isTeachingCup ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
            {isTeachingCup ? '半透明教學' : '一般'}
          </button>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
        <button
          onClick={() => (isSimulating ? stopSimulation() : startSimulation())}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer ${
            isSimulating
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isSimulating ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isSimulating ? '暫停' : '開始傾倒'}</span>
        </button>

        <button
          onClick={resetSimulation}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          title="重置參數"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
