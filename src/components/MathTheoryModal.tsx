import React from 'react';
import { BookOpen, X, Award, CheckCircle2 } from 'lucide-react';

interface MathTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathTheoryModal: React.FC<MathTheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white">
                微分幾何學核心定理與流線對應導讀
              </h2>
              <p className="text-xs text-slate-400">
                Primary Reference: Manfredo P. do Carmo, Differential Geometry of Curves and Surfaces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 text-sm leading-relaxed">
          {/* 動機與前言 */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4" /> 實驗室研究動機 (Motivation)
            </h3>
            <p className="text-xs text-slate-300">
              本互動實驗室源自日常生活手沖咖啡注水現象。水流在重力場作用下從壺嘴噴射並下墜至容器，其中心流線在微分幾何中是一條經典的三維參數化曲線
              α(t) = (x(t), y(t), z(t))。我們透過幾何視覺化，將抽象之局部幾何量（曲率、密切圓、Frenet 標架）與真實流體行為緊密對接。
            </p>
          </div>

          {/* 定理 1: 正則性 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 1. 曲線的正則性 (Regular Curves)
            </h4>
            <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              α'(t) ≠ 0, ∀ t ∈ I
            </div>
            <p className="text-xs text-slate-400">
              當注水保持穩定速度時，切向量速度永不為零，流線處處具備明確之切線向量；若傾倒停頓或產生斷流滴漏，α'(t) → 0 則會產生奇異點 (Singular point)。
            </p>
          </section>

          {/* 定理 2: Frenet-Serret 公式 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 2. Frenet-Serret 標架與局部微分方程
            </h4>
            <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
              <p>• 單位切向量 T(s) = α'(s)</p>
              <p>• 主法向量 N(s) = T'(s) / |T'(s)| = T'(s) / κ(s)</p>
              <p>• 副法向量 B(s) = T(s) × N(s)</p>
              <p className="pt-2 text-amber-300">Frenet 矩陣形式：</p>
              <p>[T', N', B']ᵀ = [[0, κ, 0], [-κ, 0, -τ], [0, τ, 0]] · [T, N, B]ᵀ</p>
            </div>
            <p className="text-xs text-slate-400">
              在 3D 畫面中，紅軸 T 表示瞬時水滴噴出前進速度方向，綠軸 N 指向重力與加速度彎曲之中心凹側，藍軸 B 則為密切平面的法向量。
            </p>
          </section>

          {/* 定理 3: 曲率與密切圓 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 3. 任意參數下之曲率 κ 與密切圓 (Osculating Circle)
            </h4>
            <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              κ(t) = |α'(t) × α''(t)| / |α'(t)|³ , 密切圓半徑 R(t) = 1 / κ(t)
            </div>
            <p className="text-xs text-slate-400">
              金黃色光環為密切圓，其所在的平面稱為密切平面 (Osculating Plane)。在出水嘴附近因水平初速與重力作用急劇彎折，曲率 κ 較大，密切圓極為緊密；落入杯內時接近垂直加速，κ 趨於平緩，密切圓半徑 R 急遽擴大。
            </p>
          </section>

          {/* 定理 4: 平面曲線定理 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 4. 平面曲線與扭率 (Characterization of Planar Curves)
            </h4>
            <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 font-mono text-xs">
              曲線為平面曲線 ⟺ 扭率 τ(s) ≡ 0 ⟺ 副法向量 B(s) 為定向量
            </div>
            <p className="text-xs text-slate-400">
              當我們以固定方向垂直傾倒時，水流全段在同一重力鉛直平面內，扭率恆為零，藍軸 B 始終水平鎖定；只有當手持水壺進行旋轉繞圈手沖時，流線形成三維扭曲曲線，τ ≠ 0。
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition"
          >
            關閉說明面板
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathTheoryModal;