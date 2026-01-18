import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameOfLife } from './useGameOfLife';
import { DEFAULT_STARTING_WEALTH } from '../types';

describe('useGameOfLife', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('initializes with default dimensions (60x60)', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.gridState.width).toBe(60);
      expect(result.current.gridState.height).toBe(60);
    });

    it('initializes with custom dimensions', () => {
      const { result } = renderHook(() => useGameOfLife(10, 8));
      expect(result.current.gridState.width).toBe(10);
      expect(result.current.gridState.height).toBe(8);
    });

    it('initializes with empty grid', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      const aliveCount = result.current.gridState.cells.flat().filter(c => c.age > 0).length;
      expect(aliveCount).toBe(0);
    });

    it('initializes in stopped state', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.simulationState).toBe('stopped');
    });

    it('initializes with default speed', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.speed).toBe(200);
    });

    it('initializes with default wealth rules (array)', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(Array.isArray(result.current.wealthRules)).toBe(true);
      expect(result.current.wealthRules.length).toBe(7);
    });

    it('initializes with generation 0', () => {
      const { result } = renderHook(() => useGameOfLife());
      expect(result.current.generation).toBe(0);
    });
  });

  describe('toggleCell', () => {
    it('toggles cell from dead to alive', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(2, 2);
      });
      expect(result.current.gridState.cells[2][2].age).toBe(1);
      expect(result.current.gridState.cells[2][2].wealth).toBe(DEFAULT_STARTING_WEALTH);
    });

    it('toggles cell from alive to dead', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(2, 2);
        result.current.toggleCell(2, 2);
      });
      expect(result.current.gridState.cells[2][2].age).toBe(0);
    });
  });

  describe('setCell', () => {
    it('sets cell to specified value', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.setCell(2, 2, true);
      });
      expect(result.current.gridState.cells[2][2].age).toBe(1);
    });

    it('does not trigger re-render if value unchanged', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      const initialCells = result.current.gridState.cells;
      act(() => {
        result.current.setCell(2, 2, false);
      });
      expect(result.current.gridState.cells).toBe(initialCells);
    });
  });

  describe('resize', () => {
    it('resizes grid to new dimensions', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.resize(10, 8);
      });
      expect(result.current.gridState.width).toBe(10);
      expect(result.current.gridState.height).toBe(8);
      expect(result.current.gridState.cells.length).toBe(8);
      expect(result.current.gridState.cells[0].length).toBe(10);
    });

    it('preserves existing cells when expanding', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(2, 2);
        result.current.resize(10, 10);
      });
      expect(result.current.gridState.cells[2][2].age).toBe(1);
    });
  });

  describe('randomize', () => {
    it('randomizes the grid', () => {
      const { result } = renderHook(() => useGameOfLife(10, 10));
      act(() => {
        result.current.randomize(1);
      });
      const aliveCount = result.current.gridState.cells.flat().filter(c => c.age > 0).length;
      expect(aliveCount).toBe(100);
    });
  });

  describe('resetWealth', () => {
    it('sets all alive cells wealth to 1', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(1, 1);
        result.current.toggleCell(2, 2);
        result.current.toggleCell(3, 3);
      });
      // All cells start with DEFAULT_STARTING_WEALTH (10)
      expect(result.current.gridState.cells[1][1].wealth).toBe(10);
      expect(result.current.gridState.cells[2][2].wealth).toBe(10);

      act(() => {
        result.current.resetWealth();
      });

      expect(result.current.gridState.cells[1][1].wealth).toBe(1);
      expect(result.current.gridState.cells[2][2].wealth).toBe(1);
      expect(result.current.gridState.cells[3][3].wealth).toBe(1);
    });

    it('does not affect dead cells', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(1, 1);
        result.current.resetWealth();
      });
      // Dead cells should remain unchanged
      expect(result.current.gridState.cells[0][0].wealth).toBe(0);
      expect(result.current.gridState.cells[0][0].age).toBe(0);
    });

    it('preserves cell age', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(1, 1);
        result.current.step(); // age becomes 2
        result.current.step(); // age becomes 3
      });
      const ageBeforeReset = result.current.gridState.cells[1][1].age;

      act(() => {
        result.current.resetWealth();
      });

      expect(result.current.gridState.cells[1][1].age).toBe(ageBeforeReset);
      expect(result.current.gridState.cells[1][1].wealth).toBe(1);
    });
  });

  describe('simulation controls', () => {
    it('play sets state to playing', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.play();
      });
      expect(result.current.simulationState).toBe('playing');
    });

    it('pause sets state to paused', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.play();
        result.current.pause();
      });
      expect(result.current.simulationState).toBe('paused');
    });

    it('step advances one generation', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(2, 2);
      });
      const initialCells = JSON.stringify(result.current.gridState.cells);
      act(() => {
        result.current.step();
      });
      const newCells = JSON.stringify(result.current.gridState.cells);
      expect(newCells).not.toBe(initialCells);
    });

    it('step increments generation counter', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      expect(result.current.generation).toBe(0);
      act(() => {
        result.current.step();
      });
      expect(result.current.generation).toBe(1);
      act(() => {
        result.current.step();
        result.current.step();
      });
      expect(result.current.generation).toBe(3);
    });

    it('stops simulation when all cells die', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(2, 2);
        result.current.play();
      });
      expect(result.current.simulationState).toBe('playing');

      // Step until cell dies (isolated cell loses 1 wealth per step with default rules)
      // Starting wealth is 10, so it takes 10 steps to die
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.step();
        }
      });

      // After enough steps, the single cell should die and simulation should stop
      const aliveCount = result.current.gridState.cells.flat().filter(c => c.age > 0).length;
      expect(aliveCount).toBe(0);
      expect(result.current.simulationState).toBe('stopped');
    });
  });

  describe('clear', () => {
    it('clears the grid and stops simulation', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.toggleCell(2, 2);
        result.current.toggleCell(1, 1);
        result.current.play();
        result.current.clear();
      });
      expect(result.current.simulationState).toBe('stopped');
      const aliveCount = result.current.gridState.cells.flat().filter(c => c.age > 0).length;
      expect(aliveCount).toBe(0);
    });

    it('preserves grid dimensions when clearing', () => {
      const { result } = renderHook(() => useGameOfLife(10, 8));
      act(() => {
        result.current.toggleCell(2, 2);
        result.current.clear();
      });
      expect(result.current.gridState.width).toBe(10);
      expect(result.current.gridState.height).toBe(8);
    });

    it('resets generation counter to 0', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.step();
        result.current.step();
        result.current.step();
      });
      expect(result.current.generation).toBe(3);
      act(() => {
        result.current.clear();
      });
      expect(result.current.generation).toBe(0);
    });
  });

  describe('setSpeed', () => {
    it('updates speed value', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      act(() => {
        result.current.setSpeed(500);
      });
      expect(result.current.speed).toBe(500);
    });
  });

  describe('setWealthRules', () => {
    it('updates wealth rules', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));
      const newRules = [1, 1, 1, 1, 1, 1, 1];
      act(() => {
        result.current.setWealthRules(newRules);
      });
      expect(result.current.wealthRules).toEqual(newRules);
    });
  });

  describe('simulation loop', () => {
    it('runs steps at specified interval when playing', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));

      act(() => {
        result.current.toggleCell(2, 2);
        result.current.setSpeed(100);
        result.current.play();
      });

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.simulationState).toBe('playing');
    });

    it('stops running when paused', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));

      act(() => {
        result.current.toggleCell(2, 2);
        result.current.setSpeed(100);
        result.current.play();
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      act(() => {
        result.current.pause();
      });

      const cellsAfterPause = JSON.stringify(result.current.gridState.cells);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const cellsAfterWait = JSON.stringify(result.current.gridState.cells);
      expect(cellsAfterPause).toBe(cellsAfterWait);
    });
  });

  describe('local storage', () => {
    it('saves state to local storage', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));

      act(() => {
        result.current.toggleCell(2, 2);
      });

      act(() => {
        vi.runAllTimers();
      });

      const stored = localStorage.getItem('hexalife-state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.gridState.cells[2][2].age).toBe(1);
    });

    it('loads state from local storage on initialization', () => {
      const savedState = {
        gridState: {
          cells: [
            [{ age: 1, wealth: 10 }, { age: 0, wealth: 0 }],
            [{ age: 0, wealth: 0 }, { age: 2, wealth: 20 }],
          ],
          width: 2,
          height: 2,
        },
        wealthRules: [0, 0, 1, 1, 0, 0, 0],
        speed: 300,
      };
      localStorage.setItem('hexalife-state', JSON.stringify(savedState));

      const { result } = renderHook(() => useGameOfLife(5, 5));

      expect(result.current.gridState.width).toBe(2);
      expect(result.current.gridState.height).toBe(2);
      expect(result.current.gridState.cells[0][0].age).toBe(1);
      expect(result.current.gridState.cells[1][1].age).toBe(2);
      expect(result.current.speed).toBe(300);
      expect(result.current.wealthRules).toEqual([0, 0, 1, 1, 0, 0, 0]);
    });

    it('uses defaults when localStorage has invalid data', () => {
      localStorage.setItem('hexalife-state', 'invalid json');

      const { result } = renderHook(() => useGameOfLife(5, 5));

      expect(result.current.gridState.width).toBe(5);
      expect(result.current.gridState.height).toBe(5);
    });

    it('saves wealth rules to local storage', () => {
      const { result } = renderHook(() => useGameOfLife(5, 5));

      const newRules = [1, 1, 1, 1, 1, 1, 1];

      act(() => {
        result.current.setWealthRules(newRules);
      });

      act(() => {
        vi.runAllTimers();
      });

      const stored = localStorage.getItem('hexalife-state');
      const parsed = JSON.parse(stored!);
      expect(parsed.wealthRules).toEqual(newRules);
    });
  });
});
