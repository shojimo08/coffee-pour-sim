import React from 'react';
import { Pause, Play } from 'lucide-react';
import type { FrenetFrameAnalysis } from '../geometry/frenet';

interface TnbLearningPanelProps {
  analysis: FrenetFrameAnalysis;
  parameter: number;
  isPlaying: boolean;
  isSpatialDemo: boolean;
  onParameterChange: (parameter: number) => void;
  onTogglePlay: () => void;
  onToggleSpatialDemo: () => void;
  onInspectEntry?: () => void;
}

const vectorText = (vector: { x: number; y: number; z: number } | null) =>
  vector ? `(${vector.x.toFixed(3)}, ${vector.y.toFixed(3)}, ${vector.z.toFixed(3)})` : '未定義';

export const TnbLearningPanel: React.FC<TnbLearningPanelProps> = ({
  analysis,
  parameter,
  isPlaying,
  isSpatialDemo,
  onParameterChange,
  onTogglePlay,
  onToggleSpatialDemo,
  onInspectEntry,
}) => (
  <div className="tnb-learning-panel absolute bottom-4 right-4 z-20 w-[min(390px,calc(100%-2rem))] max-h-[72vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl p-4 shadow-xl text-slate-800 pointer-events-auto">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900">曲線上的方向：TNB Frame</h3>
        <p className="text-[11px] text-slate-500">選擇咖啡曲線上的觀察位置</p>
      </div>
      <button onClick={onTogglePlay} className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 cursor-pointer">
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        {isPlaying ? '暫停' : '播放 TNB'}
      </button>
    </div>

    <label className="block mb-3 rounded-xl bg-slate-100 border border-slate-200 p-3">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-bold text-slate-700">TNB Position</span>
        <span className="font-mono font-bold text-amber-700">t = {parameter.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span>0</span>
        <input type="range" min={0.02} max={0.98} step={0.01} value={parameter} onChange={(event) => onParameterChange(Number(event.target.value))} className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-amber-500" />
        <span>1</span>
      </div>
    </label>

    <section className="mb-3">
      <h4 className="text-xs font-black text-slate-900 mb-2">現在發生什麼？</h4>
      <div className="space-y-2 text-[11px] leading-relaxed">
        <p><span className="font-bold text-slate-900">P(t)：</span>我們現在正在觀察曲線上的這一點。</p>
        <p><span className="font-bold text-red-600">T — Tangent 切向量：</span>如果咖啡在這一瞬間沿直線繼續前進，T 就是它前進的方向。</p>
        <p><span className="font-bold text-emerald-600">N — Normal 法向量：</span>N 指向曲線正在彎曲的方向。</p>
        <p><span className="font-bold text-blue-600">B — Binormal 副法向量：</span>B = T × N，垂直於 T 和 N 所形成的平面。</p>
      </div>
    </section>

    <div className="mb-3 grid grid-cols-3 gap-1.5 text-[10px] font-bold">
      <span className="rounded-lg bg-red-50 border border-red-200 px-2 py-1.5 text-red-700">紅色 T＝前進方向</span>
      <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5 text-emerald-700">綠色 N＝彎曲方向</span>
      <span className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-1.5 text-blue-700">藍色 B＝垂直方向</span>
    </div>

    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-950">
      <p className="text-xs font-black">Osculating Circle 密切圓</p>
      <p>在 P(t) 附近，最貼近這條曲線的圓。畫面中的半徑線連接 P(t) 與圓心。</p>
      <p className="mt-1 font-semibold">κ 大 → R 小 → 圓小 → 彎得急；κ 小 → R 大 → 圓大 → 曲線較平。</p>
      {analysis.radiusOfCurvature !== null && analysis.radiusOfCurvature > 0.16 && <p className="mt-1 text-amber-700">大型密切圓已依畫面空間縮放顯示；精確 R 請看下方數值。</p>}
    </div>

    {onInspectEntry && (
      <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-[10px] leading-relaxed text-indigo-950">
        <p>現在的紅色 <strong>T @ P(t)</strong> 是目前觀察點的切向量；當流線到達杯蓋 <strong>Q</strong> 時，同一個切向量概念就是 <strong>T_entry @ Q</strong>。</p>
        <button type="button" onClick={onInspectEntry} className="mt-2 min-h-9 w-full rounded-lg border border-indigo-300 bg-white px-3 font-bold text-indigo-700 hover:bg-indigo-100">
          沿著流線看到杯口 · 查看 T_entry
        </button>
      </div>
    )}

    <details className="rounded-xl border border-slate-200 bg-slate-50">
      <summary className="cursor-pointer px-3 py-2.5 text-xs font-black text-slate-800">
        數學細節 <span className="font-semibold text-slate-400">Mathematical details</span>
        {isSpatialDemo && <span className="ml-2 text-[9px] text-indigo-700">空間曲線示範中</span>}
      </summary>
      <div className="space-y-3 border-t border-slate-200 p-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <div>
            <p className="text-[11px] font-bold text-indigo-900">比較：如果曲線離開平面會怎樣？</p>
            <p className="text-[10px] text-indigo-700">{isSpatialDemo ? '空間曲線示範中' : '目前使用真實咖啡流線'}</p>
          </div>
          <button type="button" onClick={onToggleSpatialDemo} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold border cursor-pointer ${isSpatialDemo ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-700 border-indigo-300'}`}>
            {isSpatialDemo ? '空間曲線 ON' : '開啟比較'}
          </button>
        </div>
        {isSpatialDemo && <p className="text-[10px] font-semibold text-indigo-700">教學示範曲線，不代表咖啡物理模型。</p>}

        <section>
          <h4 className="mb-2 text-xs font-black text-slate-900">數學怎麼描述？</h4>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[10px] font-mono text-slate-700">
            <span>t</span><span>{analysis.parameter.toFixed(3)}</span>
            <span>P(t)</span><span>{vectorText(analysis.point)}</span>
            <span className="text-red-600">T</span><span>{vectorText(analysis.tangent)}</span>
            <span className="text-emerald-600">N</span><span>{vectorText(analysis.normal)}</span>
            <span className="text-blue-600">B</span><span>{vectorText(analysis.binormal)}</span>
            <span>κ</span><span>{analysis.stable ? analysis.curvature.toFixed(4) : '≈ 0'}</span>
            <span>R = 1/κ</span><span>{analysis.radiusOfCurvature === null ? '未定義' : `${analysis.radiusOfCurvature.toFixed(4)} m`}</span>
            <span>τ</span><span>{Math.abs(analysis.torsion) < 0.001 ? '≈ 0' : analysis.torsion.toFixed(4)}</span>
          </div>
          <div className="mt-2 space-y-1 text-[10px] leading-relaxed text-slate-600">
            <p><strong>Curvature 曲率：</strong>κ 越大，這裡彎得越急。</p>
            <p><strong>Radius 曲率半徑：</strong>R 越小，這裡彎得越急。</p>
            <p><strong>Torsion 扭率：</strong>描述曲線是否正在離開原本的平面。</p>
          </div>
        </section>

        {!analysis.stable && (
          <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">Curvature ≈ 0；此處的 Normal / Binormal 不穩定或未定義。</p>
        )}

        {analysis.isPlanar ? (
          <aside className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-[10px] leading-relaxed text-sky-900">
            <p className="font-black text-xs mb-1">你發現了嗎？</p>
            <p>T 和 N 會沿曲線改變，但 B 幾乎保持固定。因為咖啡流線位於同一個平面內，所以 τ ≈ 0。</p>
          </aside>
        ) : (
          <aside className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-[10px] leading-relaxed text-indigo-900">
            <p className="font-black text-xs mb-1">空間曲線的不同</p>
            <p>曲線離開原本的平面，因此 B 會轉動，torsion τ 通常不等於 0。</p>
          </aside>
        )}
      </div>
    </details>
  </div>
);

export default TnbLearningPanel;
