import { useState, useCallback, useRef, useEffect } from 'react';
import { WealthRules, GridState, SimulationState, CellData } from '../types';
import {
  createEmptyGrid,
  computeNextGeneration,
  toggleCell as toggleCellFn,
  setCell as setCellFn,
  resizeGrid,
  randomizeGrid,
  defaultWealthRules,
} from '../gameLogic';

const STORAGE_KEY = 'hexalife-state';

interface StoredState {
  gridState: GridState;
  wealthRules: WealthRules;
  speed: number;
}

function loadFromStorage(): StoredState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredState;
      // Validate the structure
      if (
        parsed.gridState?.cells &&
        Array.isArray(parsed.gridState.cells) &&
        typeof parsed.gridState.width === 'number' &&
        typeof parsed.gridState.height === 'number' &&
        Array.isArray(parsed.wealthRules) &&
        parsed.wealthRules.length === 7
      ) {
        // Validate that cells have proper CellData structure
        const firstCell = parsed.gridState.cells[0]?.[0];
        if (firstCell && typeof firstCell === 'object' && 'age' in firstCell && 'wealth' in firstCell) {
          return parsed;
        }
      }
    }
  } catch {
    // Invalid storage, ignore
  }
  return null;
}

function saveToStorage(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable, ignore
  }
}

export function useGameOfLife(initialWidth: number = 60, initialHeight: number = 60) {
  const [gridState, setGridState] = useState<GridState>(() => {
    const stored = loadFromStorage();
    if (stored) {
      return stored.gridState;
    }
    return {
      cells: createEmptyGrid(initialWidth, initialHeight),
      width: initialWidth,
      height: initialHeight,
    };
  });

  const [wealthRules, setWealthRules] = useState<WealthRules>(() => {
    const stored = loadFromStorage();
    return stored?.wealthRules ?? [...defaultWealthRules];
  });

  const [simulationState, setSimulationState] = useState<SimulationState>('stopped');

  const [speed, setSpeed] = useState(() => {
    const stored = loadFromStorage();
    return stored?.speed ?? 200;
  });

  const [generation, setGeneration] = useState(0);

  const intervalRef = useRef<number | null>(null);

  // Save to local storage when state changes
  useEffect(() => {
    saveToStorage({ gridState, wealthRules, speed });
  }, [gridState, wealthRules, speed]);

  const step = useCallback(() => {
    setGridState(prev => {
      const newCells = computeNextGeneration(prev.cells, wealthRules);
      const hasAliveCells = newCells.some(row => row.some(cell => cell.age > 0));
      if (!hasAliveCells) {
        setSimulationState('stopped');
      }
      return { ...prev, cells: newCells };
    });
    setGeneration(prev => prev + 1);
  }, [wealthRules]);

  const play = useCallback(() => {
    setSimulationState('playing');
  }, []);

  const pause = useCallback(() => {
    setSimulationState('paused');
  }, []);

  const clear = useCallback(() => {
    setSimulationState('stopped');
    setGeneration(0);
    setGridState(prev => ({
      ...prev,
      cells: createEmptyGrid(prev.width, prev.height),
    }));
  }, []);

  const toggleCell = useCallback((row: number, col: number) => {
    setGridState(prev => ({
      ...prev,
      cells: toggleCellFn(prev.cells, row, col),
    }));
  }, []);

  const setCell = useCallback((row: number, col: number, value: boolean) => {
    setGridState(prev => {
      const newCells = setCellFn(prev.cells, row, col, value);
      if (newCells === prev.cells) return prev;
      return { ...prev, cells: newCells };
    });
  }, []);

  const resize = useCallback((width: number, height: number) => {
    setGridState(prev => ({
      cells: resizeGrid(prev.cells, width, height),
      width,
      height,
    }));
  }, []);

  const randomize = useCallback((density: number = 0.3) => {
    setGridState(prev => ({
      ...prev,
      cells: randomizeGrid(prev.width, prev.height, density),
    }));
  }, []);

  const resetWealth = useCallback(() => {
    setGridState(prev => ({
      ...prev,
      cells: prev.cells.map(row =>
        row.map(cell =>
          cell.age > 0 ? { ...cell, wealth: 1 } : cell
        )
      ),
    }));
  }, []);

  // Handle simulation loop
  useEffect(() => {
    if (simulationState === 'playing') {
      intervalRef.current = window.setInterval(step, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulationState, speed, step]);

  return {
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
  };
}

export { defaultWealthRules };
