import React, { useState } from 'react';
import { SceneContainer } from './scene/SceneContainer';
import { TopBar } from './components/TopBar';
import { ControlPanel } from './components/ControlPanel';
import { ResultPanel } from './components/ResultPanel';
import { OptimalModal } from './components/OptimalModal';
import { SettingsModal } from './components/SettingsModal';
import { MathTheoryModal } from './components/MathTheoryModal';
import { PresentationOverlay } from './components/PresentationOverlay';
import { useSimulationStore } from './store/useSimulationStore';

export const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'geometry' | 'controls' | 'results'>('geometry');
  const isPresentationMode = useSimulationStore((state) => state.isPresentationMode);
  const guidedStep = useSimulationStore((state) => state.guidedStep);
  const concealLabUi = isPresentationMode && guidedStep < 7;

  return (
    <div className="app-shell">
      {/* 頂部導航列 */}
      {!concealLabUi && (
        <header className="app-header">
          <TopBar
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTheory={() => setIsTheoryOpen(true)}
          />
        </header>
      )}

      {!concealLabUi && (
        <nav className="mobile-tabs" aria-label="行動版功能分頁">
          {([
            ['geometry', '幾何觀察'],
            ['controls', '倒咖啡控制'],
            ['results', '即時結果'],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setMobilePanel(key)} className={mobilePanel === key ? 'active' : ''}>{label}</button>
          ))}
        </nav>
      )}

      {/* 主畫面 */}
      <main className="app-main">
        <section className="scene-section">
          <SceneContainer showLearningPanel={(!isPresentationMode || guidedStep === 7) && mobilePanel === 'geometry'} />
          
          {!concealLabUi && (
            <div className="desktop-result">
              <ResultPanel />
            </div>
          )}
        </section>

        {!concealLabUi && (
          <aside className={`controls-region ${mobilePanel === 'controls' ? 'mobile-active' : ''}`}>
            <ControlPanel />
          </aside>
        )}

        {!concealLabUi && (
          <section className={`responsive-result ${mobilePanel === 'results' ? 'mobile-active' : ''}`}>
            <ResultPanel />
          </section>
        )}
      </main>

      {/* 彈出視窗 */}
      {isPresentationMode && <PresentationOverlay />}
      <OptimalModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <MathTheoryModal isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />
    </div>
  );
};

export default App;
