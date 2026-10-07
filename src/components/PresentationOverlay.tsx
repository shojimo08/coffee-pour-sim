import type React from 'react';
import { ChevronLeft, ChevronRight, Compass, X } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';

const steps = [
  { title: '先試著倒一次', body: '看起來只是「倒歪了」。但如果要用幾何描述，究竟是哪裡出了問題？', cue: '咖啡沒有乾淨地進入飲用孔。' },
  { title: '咖啡其實畫出了一條曲線', body: '我們可以把咖啡流線看成參數曲線 α(t)。t 改變時，我們就在沿著這條流線移動。', cue: '沿著亮起的流線觀察 P(t)。' },
  { title: '它現在往哪裡走？', body: '紅色的 T 是切向量。它告訴我們咖啡在這一瞬間前進的方向。', cue: '注意 P 移動時，紅色 T 如何轉向。' },
  { title: '它為什麼在轉彎？', body: '綠色的 N 指向曲線彎曲的一側；曲率 κ 告訴我們方向改變得有多快。', cue: '黃色圓是在這一小段最貼近流線的圓。κ 越大，R = 1/κ 越小。' },
  { title: '為什麼藍色的 B 幾乎沒有轉？', body: '這不是程式壞掉。目前的理想化流線幾乎位於同一平面，所以扭率 τ ≈ 0。', cue: '讓 P 前進，觀察藍色 B 幾乎保持固定。' },
  { title: '最後，回到一開始的問題', body: '倒咖啡不只是「看起來有沒有對準」。想一想：如果咖啡的中心線已經穿過飲用孔，就一定不會灑出來嗎？', cue: '接下來我們還可以研究：咖啡進入杯口時的方向，以及離孔邊還有多少安全距離。' },
  { title: '現在換你試試看', body: '改變 Tilt、Height、Distance、Flow，觀察咖啡流線與 T、N、B、曲率如何一起改變。', cue: '完整實驗室已經準備好了。' },
] as const;

export const PresentationOverlay: React.FC = () => {
  const guidedStep = useSimulationStore((state) => state.guidedStep);
  const setGuidedStep = useSimulationStore((state) => state.setGuidedStep);
  const closeGuidedLearning = useSimulationStore((state) => state.closePresentationMode);
  const showEntryGeometry = useSimulationStore((state) => state.showEntryGeometry);
  const toggleEntryGeometry = useSimulationStore((state) => state.toggleEntryGeometry);

  if (guidedStep === 0) {
    return (
      <div className="presentation-layer fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="presentation-scrim absolute inset-0" />
        <section className="welcome-card pointer-events-auto relative w-full max-w-lg rounded-3xl border border-white/60 bg-white/94 p-6 text-center text-slate-900 shadow-2xl sm:p-8">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Compass size={23} /></div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Coffee Stream Geometry Lab</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">咖啡流線幾何實驗室</h1>
          <h2 className="mt-5 text-lg font-bold text-slate-800">「不打開杯蓋，也能準確把咖啡倒進去嗎？」</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">從一次失敗的倒咖啡經驗，探索一條曲線如何前進、彎曲，以及如何穿過一個小小的杯口。</p>
          <div className="mt-7 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <button type="button" onClick={closeGuidedLearning} className="min-h-11 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">直接進入實驗室</button>
            <button type="button" onClick={() => setGuidedStep(1)} className="min-h-11 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">開始探索</button>
          </div>
        </section>
      </div>
    );
  }

  const step = steps[guidedStep - 1];
  return (
    <div className={`presentation-layer fixed inset-0 z-40 pointer-events-none ${guidedStep === 7 ? 'presentation-finale' : ''}`}>
      {guidedStep < 7 && <div className="guided-scene-vignette absolute inset-0" />}
      <div className="guided-badge absolute top-4 left-4 pointer-events-auto flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/95 px-3 py-2 text-indigo-900 shadow-lg">
        <Compass size={17} />
        <div><p className="text-xs font-black">引導學習</p><p className="text-[10px] text-indigo-600">讓 3D 畫面先說明</p></div>
        <button onClick={closeGuidedLearning} className="ml-2 rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="關閉引導學習"><X size={16} /></button>
      </div>

      <section className="guided-card absolute bottom-5 left-5 pointer-events-auto w-[min(390px,calc(100%-2.5rem))] rounded-2xl border border-slate-300 bg-white/97 p-5 text-slate-800 shadow-2xl">
        <div className="mb-3 flex items-center gap-1.5" aria-label={`步驟 ${guidedStep}，共 7 步`}>
          {steps.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index + 1 <= guidedStep ? 'bg-indigo-500' : 'bg-slate-200'}`} />)}
        </div>
        <p className="text-[10px] font-black tracking-wider text-indigo-600">STEP {guidedStep} / 7</p>
        <h2 className="mt-1 text-lg font-black text-slate-900">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{step.cue}</p>
        {guidedStep === 6 && (
          <button type="button" onClick={toggleEntryGeometry} className={`mt-3 min-h-10 w-full rounded-lg border px-3 text-xs font-bold ${showEntryGeometry ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {showEntryGeometry ? '隱藏杯口幾何' : '看看杯口幾何'}
          </button>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button onClick={() => setGuidedStep(guidedStep - 1)} className="flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"><ChevronLeft size={14} />上一個</button>
          {guidedStep < 7 ? (
            <button onClick={() => setGuidedStep(guidedStep + 1)} className="ml-auto flex min-h-11 items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500">下一個<ChevronRight size={14} /></button>
          ) : (
            <button onClick={closeGuidedLearning} className="ml-auto min-h-11 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500">開始實驗</button>
          )}
        </div>
      </section>
    </div>
  );
};

export default PresentationOverlay;
