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

        <div className="sidebar">
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

          <div className="explanation">
            <h3>How it works</h3>
            <p>
              Each living cell has <strong>wealth</strong> that changes every generation
              based on its neighbor count. Cells gain or lose wealth according to the rules
              you set.
            </p>
            <ul>
              <li>If wealth drops to 0, the cell <strong>dies</strong></li>
              <li>Empty cells <strong>come alive</strong> if their position would be profitable</li>
              <li>New cells start with wealth of 10</li>
            </ul>
            <h3>Default rules</h3>
            <p>Only 3 neighbors is profitable (+1). All other counts drain wealth:</p>
            <div className="rules-summary">
              <span>0: -1</span>
              <span>1: -3</span>
              <span>2: -1</span>
              <span className="profitable">3: +1</span>
              <span>4: -1</span>
              <span>5: -2</span>
              <span>6: -3</span>
            </div>
            <h3>Tips</h3>
            <ul>
              <li>Click or drag to draw cells</li>
              <li>Hover over cells to see their stats</li>
              <li>Try different coloring modes</li>
              <li>Click <strong>Rules</strong> to customize wealth changes</li>
            </ul>
          </div>
        </div>
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
