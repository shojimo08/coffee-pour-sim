import React from 'react';
import { Presentation, BookOpen, Settings } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';

interface TopBarProps {
  onOpenSettings: () => void;
  onOpenTheory: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onOpenTheory }) => {
  const openPresentationMode = useSimulationStore((state) => state.openPresentationMode);

  return (
    <div className="w-full flex items-center justify-between">
      {/* 左側：專案標題與幾何副標題 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow">
          3D
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">
            咖啡流線幾何實驗室
          </h1>
          <p className="text-[10px] text-slate-400">
            用 P(t)、TNB、曲率與扭率看懂一條曲線
          </p>
        </div>
      </div>

      {/* 右側：功能按鈕群組 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTheory}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>幾何定理導讀</span>
        </button>

        <button
          onClick={openPresentationMode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/80 rounded-lg hover:bg-slate-700 transition cursor-pointer"
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>引導學習模式</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="設定"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
