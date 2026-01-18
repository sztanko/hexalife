import { useState } from 'react';
import { HexGrid } from './components/HexGrid';
import { Controls } from './components/Controls';
import { Metrics } from './components/Metrics';
import { WealthRulesPopup } from './components/WealthRulesPopup';
import { useGameOfLife } from './hooks/useGameOfLife';
import { ColoringMode } from './types';

function App() {
  const {
    gridState,
    wealthRules,
    simulationState,
    speed,
    generation,
    step,
    play,
    pause,
    clear,
    toggleCell,
    setCell,
    resize,
    randomize,
    resetWealth,
    setWealthRules,
    setSpeed,
  } = useGameOfLife(60, 60);

  const [showRules, setShowRules] = useState(false);
  const [coloringMode, setColoringMode] = useState<ColoringMode>('wealth');

  return (
    <div className="app">
      <header>
        <h1>HexaLife</h1>
        <p>A wealth-based Game of Life on a hexagonal grid</p>
        <Metrics cells={gridState.cells} generation={generation} />
      </header>

      <main>
        <div className="grid-container">
          <HexGrid
            cells={gridState.cells}
            width={gridState.width}
            height={gridState.height}
            coloringMode={coloringMode}
            onCellToggle={toggleCell}
            onCellSet={setCell}
          />
        </div>

        <Controls
          simulationState={simulationState}
          width={gridState.width}
          height={gridState.height}
          speed={speed}
          coloringMode={coloringMode}
          onPlay={play}
          onPause={pause}
          onClear={clear}
          onStep={step}
          onResize={resize}
          onRandomize={randomize}
          onResetWealth={resetWealth}
          onSpeedChange={setSpeed}
          onColoringModeChange={setColoringMode}
          onOpenProbabilities={() => setShowRules(true)}
        />
      </main>

      {showRules && (
        <WealthRulesPopup
          wealthRules={wealthRules}
          onSave={setWealthRules}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  );
}

export default App;
