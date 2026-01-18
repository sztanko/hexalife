import { SimulationState, ColoringMode } from '../types';

interface ControlsProps {
  simulationState: SimulationState;
  width: number;
  height: number;
  speed: number;
  coloringMode: ColoringMode;
  onPlay: () => void;
  onPause: () => void;
  onClear: () => void;
  onStep: () => void;
  onResize: (width: number, height: number) => void;
  onRandomize: () => void;
  onResetWealth: () => void;
  onSpeedChange: (speed: number) => void;
  onColoringModeChange: (mode: ColoringMode) => void;
  onOpenProbabilities: () => void;
}

export function Controls({
  simulationState,
  width,
  height,
  speed,
  coloringMode,
  onPlay,
  onPause,
  onClear,
  onStep,
  onResize,
  onRandomize,
  onResetWealth,
  onSpeedChange,
  onColoringModeChange,
  onOpenProbabilities,
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="control-group">
        <label>Simulation</label>
        <div className="button-row">
          {simulationState !== 'playing' ? (
            <button onClick={onPlay} className="btn btn-primary">
              ▶ Play
            </button>
          ) : (
            <button onClick={onPause} className="btn btn-warning">
              ⏸ Pause
            </button>
          )}
          <button onClick={onStep} className="btn btn-secondary" disabled={simulationState === 'playing'}>
            ⏭ Step
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Speed: {speed}ms</label>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>Grid Size</label>
        <div className="size-inputs">
          <div className="input-group">
            <span>W:</span>
            <input
              type="number"
              min="5"
              max="150"
              value={width}
              onChange={(e) => onResize(Number(e.target.value), height)}
            />
          </div>
          <div className="input-group">
            <span>H:</span>
            <input
              type="number"
              min="5"
              max="150"
              value={height}
              onChange={(e) => onResize(width, Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="control-group">
        <label>Cell Colors</label>
        <div className="button-row">
          <button
            onClick={() => onColoringModeChange('age')}
            className={`btn btn-small ${coloringMode === 'age' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Age
          </button>
          <button
            onClick={() => onColoringModeChange('neighbors')}
            className={`btn btn-small ${coloringMode === 'neighbors' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Neighbors
          </button>
          <button
            onClick={() => onColoringModeChange('wealth')}
            className={`btn btn-small ${coloringMode === 'wealth' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Wealth
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Actions</label>
        <div className="button-row">
          <button onClick={() => onRandomize()} className="btn btn-secondary">
            🎲 Random
          </button>
          <button onClick={onResetWealth} className="btn btn-secondary">
            💰 Reset Wealth
          </button>
          <button onClick={onClear} className="btn btn-danger">
            🗑 Clear
          </button>
          <button onClick={onOpenProbabilities} className="btn btn-secondary">
            ⚙ Rules
          </button>
        </div>
      </div>
    </div>
  );
}
