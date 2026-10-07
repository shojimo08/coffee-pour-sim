import React from 'react';
import { X, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-sci-border rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-slate-200">
        <div className="flex items-center justify-between border-b border-sci-border pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-100">
            <Sliders size={14} className="text-sky-400" />
            Simulation Settings
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-300">Gravity Constant (g)</span>
            <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-sci-border">
              9.81 m/s²
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-300">Solver Method</span>
            <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-sci-border">
              Kinematics RK2
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-300">Ground Grid Shadow</span>
            <span className="font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/30">
              Enabled (Soft)
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition"
        >
          <Check size={14} />
          Close
        </button>
      </div>
    </div>
  );
};