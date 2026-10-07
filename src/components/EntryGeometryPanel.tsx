import type React from 'react';
import type { EntryGeometryAnalysis, EntryGeometryStatus } from '../geometry/entryGeometry';
import { useSimulationStore } from '../store/useSimulationStore';

interface EntryGeometryPanelProps {
  analysis: EntryGeometryAnalysis | null;
  guided?: boolean;
  docked?: boolean;
}

const statusText: Record<EntryGeometryStatus, string> = {
  safe: 'SAFE 安全',
  tight: 'TIGHT 邊界',
  'spill-risk': 'SPILL RISK 溢出風險',
};

const statusClass: Record<EntryGeometryStatus, string> = {
  safe: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  tight: 'text-amber-700 bg-amber-50 border-amber-200',
  'spill-risk': 'text-rose-700 bg-rose-50 border-rose-200',
};

const cm = (metres: number) => (metres * 100).toFixed(2);

const LidPlaneInset: React.FC<{ analysis: EntryGeometryAnalysis }> = ({ analysis }) => {
  const width = 260;
  const height = 184;
  const centerX = width / 2;
  const centerY = 76;
  const holeRadius = analysis.basicMargin + analysis.footprintSemiMinor + analysis.centerOffset;
  const qx = analysis.point.x - analysis.holeCenter.x;
  const qz = analysis.point.z - analysis.holeCenter.z;
  const requiredExtent = analysis.centerOffset + analysis.footprintSemiMajor * 1.16;
  const maximumExtent = holeRadius * 2.2;
  const worldExtent = Math.max(holeRadius * 1.35, Math.min(requiredExtent, maximumExtent));
  const scale = 62 / worldExtent;
  const qDiagramX = centerX + qx * scale;
  const qDiagramY = centerY - qz * scale;
  const qOffScale = analysis.centerOffset + analysis.footprintSemiMajor > worldExtent;
  const majorAngle = Math.atan2(
    -analysis.footprintMajorDirection.z,
    analysis.footprintMajorDirection.x,
  ) * 180 / Math.PI;
  const footprintColor = analysis.directionalStatus === 'safe' ? '#059669' : '#ea580c';
  const elongationRatio = analysis.footprintSemiMajor / analysis.footprintSemiMinor;

  const directionLength = Math.hypot(qx, qz);
  const directionX = directionLength > 1e-12 ? qx / directionLength : 1;
  const directionY = directionLength > 1e-12 ? -qz / directionLength : 0;
  const cueX = centerX + directionX * 58;
  const cueY = centerY + directionY * 58;

  return (
    <figure className="rounded-xl border border-slate-200 bg-slate-50 p-2">
      <figcaption className="mb-1 flex items-center justify-between gap-2">
        <span className="font-black text-slate-800">杯口幾何放大圖</span>
        <span className="text-[9px] font-semibold text-slate-500">Lid-plane Geometry</span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label="杯口中心、流線到達點、圓形水柱截面與方向修正橢圓的等比例放大比較">
        <defs>
          <marker id="entry-offset-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" />
          </marker>
        </defs>

        <circle cx={centerX} cy={centerY} r={holeRadius * scale} fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx={centerX} cy={centerY} r="2.5" fill="#0284c7" />
        <text x={centerX + 5} y={centerY - 5} fill="#0369a1" fontSize="9" fontWeight="700">C</text>

        {!qOffScale ? (
          <>
            <line x1={centerX} y1={centerY} x2={qDiagramX} y2={qDiagramY} stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={qDiagramX} cy={qDiagramY} r={analysis.footprintSemiMinor * scale} fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 2" />
            {!analysis.nearGrazing && (
              <ellipse
                cx={qDiagramX}
                cy={qDiagramY}
                rx={analysis.footprintSemiMajor * scale}
                ry={analysis.footprintSemiMinor * scale}
                fill="none"
                stroke={footprintColor}
                strokeWidth="2"
                transform={`rotate(${majorAngle} ${qDiagramX} ${qDiagramY})`}
              />
            )}
            <circle cx={qDiagramX} cy={qDiagramY} r="2.8" fill="#eab308" />
            <text x={qDiagramX + 5} y={qDiagramY - 5} fill="#a16207" fontSize="9" fontWeight="700">Q</text>
            <text x={(centerX + qDiagramX) / 2 + 3} y={(centerY + qDiagramY) / 2 - 3} fill="#475569" fontSize="8">d</text>
          </>
        ) : (
          <>
            <line x1={centerX} y1={centerY} x2={cueX} y2={cueY} stroke="#64748b" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#entry-offset-arrow)" />
            <text x={centerX} y="151" textAnchor="middle" fill="#9a3412" fontSize="9" fontWeight="700">Q 位於杯口放大範圍之外</text>
            <text x={centerX} y="163" textAnchor="middle" fill="#64748b" fontSize="8">d = {cm(analysis.centerOffset)} cm</text>
          </>
        )}

        <text x="8" y="177" fill="#475569" fontSize="8">C＝杯口中心 · Q＝流線到達杯蓋的位置 · d＝中心偏移</text>
      </svg>
      <div className="mt-1 grid gap-1 text-[9px] leading-snug text-slate-600">
        <span><i className="mr-1 inline-block w-4 border-t border-dashed border-slate-500" />圓＝只看水柱寬度</span>
        <span><i className={`mr-1 inline-block h-0.5 w-4 align-middle ${analysis.directionalStatus === 'safe' ? 'bg-emerald-600' : 'bg-orange-600'}`} />橢圓＝加入 T_entry 入射方向</span>
        <strong className="text-slate-700">
          {elongationRatio <= 1.08
            ? '入射接近垂直，方向修正很小。'
            : '斜向入射使杯蓋平面上的水柱 footprint 被拉長。'}
        </strong>
        <span className="text-slate-400">幾何分析疊圖，不參與碰撞或成功率計算。</span>
      </div>
    </figure>
  );
};

export const EntryGeometryPanel: React.FC<EntryGeometryPanelProps> = ({ analysis, guided = false, docked = false }) => {
  const toggleEntryGeometry = useSimulationStore((state) => state.toggleEntryGeometry);

  return (
    <details open className={`entry-geometry-panel ${guided ? 'guided' : ''} ${docked ? 'docked' : ''} pointer-events-auto rounded-2xl border border-slate-300 bg-white/95 p-3 text-slate-800 shadow-xl`}>
      <summary className="cursor-pointer list-none text-xs font-black text-slate-900">
        杯口進入幾何 <span className="font-semibold text-slate-500">Entry Geometry</span>
      </summary>
      {!analysis ? (
        <p className="mt-3 text-[11px] leading-relaxed text-slate-600">目前流線尚未抵達杯蓋平面，因此沒有杯口進入資料。</p>
      ) : (
        <div className="mt-3 space-y-2 text-[10px]">
          <LidPlaneInset analysis={analysis} />

          {!guided && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2.5 leading-relaxed text-indigo-950">
              <p><strong>T 到達 Q 時，就是這裡的 T_entry。</strong></p>
              <p className="mt-1 text-indigo-800">P(t) 是你目前選擇觀察的曲線位置；Q 是流線與杯蓋平面的交點。兩者通常不是同一點。</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <p className="font-bold leading-relaxed text-slate-700">圓：只看位置與水柱寬度。</p>
            <p className="mt-1 font-bold leading-relaxed text-slate-700">橢圓：再加入 T_entry 的入射方向。</p>
          </div>

          <div className="grid gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-[9px] leading-relaxed text-slate-500">只看位置與水柱寬度，還剩多少空間？</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <strong className="text-[10px] text-slate-700">基本安全餘裕</strong>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${statusClass[analysis.basicStatus]}`}>{statusText[analysis.basicStatus]}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-[9px] leading-relaxed text-slate-500">加入 T_entry 的入射方向後，真正還剩多少幾何安全空間？</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <strong className="text-[10px] text-slate-700">方向修正後餘裕</strong>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${statusClass[analysis.directionalStatus ?? analysis.basicStatus]}`}>{statusText[analysis.directionalStatus ?? analysis.basicStatus]}</span>
              </div>
            </div>
          </div>

          {analysis.nearGrazing ? (
            <p className="rounded-lg bg-rose-50 p-2 leading-relaxed text-rose-700">入射方向幾乎與杯蓋平行，此局部橢圓近似不再適合直接解讀。</p>
          ) : (
            <p className="leading-relaxed text-slate-600">位置對準，不代表方向也適合。咖啡越斜著進入，杯蓋上的投影截面越長。</p>
          )}
          {guided && <p className="font-bold leading-relaxed text-indigo-700">原來「對準」至少有兩件事：位置有沒有對準，以及方向有沒有對準。</p>}

          <details open={guided || undefined} className="rounded-xl border border-slate-200 bg-slate-50/80">
            <summary className="cursor-pointer px-2.5 py-2 font-black text-slate-700">
              數學細節 <span className="font-semibold text-slate-400">Mathematical details</span>
            </summary>
            <div className="space-y-2 border-t border-slate-200 p-2.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 font-mono">
                <span>抵達點 Q / t_lid</span><span>{Math.round(analysis.lidTime * 1000)} ms</span>
                <span>中心偏移 d</span><span>{cm(analysis.centerOffset)} cm</span>
                <span>基本安全餘裕 m</span><span>{cm(analysis.basicMargin)} cm</span>
                <span>基本判定</span><span>{statusText[analysis.basicStatus]}</span>
                <span>入射角 θ（從法線）</span><span>{analysis.entryAngleDegrees.toFixed(1)}°</span>
                <span>橢圓 a / b</span><span>{cm(analysis.footprintSemiMajor)} / {cm(analysis.footprintSemiMinor)} cm</span>
                <span>方向修正後餘裕</span><span>{analysis.directionalMargin === null ? '不適用' : `${cm(analysis.directionalMargin)} cm`}</span>
                <span>方向修正判定</span><span>{analysis.directionalStatus ? statusText[analysis.directionalStatus] : '不適用'}</span>
              </div>
              <p className="leading-relaxed text-slate-500">m 是「垂直投影／圓形截面的幾何安全餘裕近似」；方向修正值以橢圓邊界取樣估算。皆非 CFD，也不改變原有注入成功率。</p>
              <p className="leading-relaxed text-slate-500">T 直接決定局部入射方向；N 與 κ 說明抵達前如何彎曲，B 與 τ 描述空間行為，但它們不直接決定孔邊餘裕。</p>
            </div>
          </details>
        </div>
      )}
      <button type="button" onClick={toggleEntryGeometry} className="mt-3 min-h-9 w-full rounded-lg border border-slate-300 text-[10px] font-bold text-slate-600 hover:bg-slate-100">
        {guided ? '關閉杯口幾何' : '回到曲線上的 TNB'}
      </button>
    </details>
  );
};

export default EntryGeometryPanel;
