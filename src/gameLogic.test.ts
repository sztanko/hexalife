import { describe, it, expect } from 'vitest';
import {
  createEmptyGrid,
  createEmptyCell,
  createAliveCell,
  getHexNeighborOffsets,
  getNeighborCount,
  getNeighborPositions,
  computeNextGeneration,
  toggleCell,
  setCell,
  resizeGrid,
  randomizeGrid,
  defaultWealthRules,
  isAlive,
  getCellAge,
  getCellWealth,
} from './gameLogic';
import { DEFAULT_STARTING_WEALTH } from './types';

describe('createEmptyGrid', () => {
  it('creates a grid with correct dimensions', () => {
    const grid = createEmptyGrid(5, 3);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(5);
  });

  it('initializes all cells as dead', () => {
    const grid = createEmptyGrid(4, 4);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.age).toBe(0);
        expect(cell.wealth).toBe(0);
      }
    }
  });

  it('handles 1x1 grid', () => {
    const grid = createEmptyGrid(1, 1);
    expect(grid.length).toBe(1);
    expect(grid[0].length).toBe(1);
    expect(grid[0][0]).toEqual(createEmptyCell());
  });

  it('creates independent rows (not references)', () => {
    const grid = createEmptyGrid(3, 3);
    grid[0][0] = createAliveCell();
    expect(grid[1][0].age).toBe(0);
    expect(grid[2][0].age).toBe(0);
  });
});

describe('getHexNeighborOffsets', () => {
  it('returns 6 offsets for even rows', () => {
    const offsets = getHexNeighborOffsets(false);
    expect(offsets.length).toBe(6);
  });

  it('returns 6 offsets for odd rows', () => {
    const offsets = getHexNeighborOffsets(true);
    expect(offsets.length).toBe(6);
  });

  it('returns different offsets for even vs odd rows', () => {
    const evenOffsets = getHexNeighborOffsets(false);
    const oddOffsets = getHexNeighborOffsets(true);
    expect(evenOffsets).not.toEqual(oddOffsets);
  });

  it('even row offsets are correct for odd-r layout', () => {
    const offsets = getHexNeighborOffsets(false);
    expect(offsets).toContainEqual([-1, -1]);
    expect(offsets).toContainEqual([-1, 0]);
    expect(offsets).toContainEqual([0, -1]);
    expect(offsets).toContainEqual([0, 1]);
    expect(offsets).toContainEqual([1, -1]);
    expect(offsets).toContainEqual([1, 0]);
  });

  it('odd row offsets are correct for odd-r layout', () => {
    const offsets = getHexNeighborOffsets(true);
    expect(offsets).toContainEqual([-1, 0]);
    expect(offsets).toContainEqual([-1, 1]);
    expect(offsets).toContainEqual([0, -1]);
    expect(offsets).toContainEqual([0, 1]);
    expect(offsets).toContainEqual([1, 0]);
    expect(offsets).toContainEqual([1, 1]);
  });
});

describe('getNeighborCount', () => {
  it('returns 0 for cell with no alive neighbors', () => {
    const grid = createEmptyGrid(5, 5);
    expect(getNeighborCount(grid, 2, 2)).toBe(0);
  });

  it('counts all 6 neighbors when surrounded (even row)', () => {
    const grid = createEmptyGrid(5, 5);
    grid[1][1] = createAliveCell();
    grid[1][2] = createAliveCell();
    grid[2][1] = createAliveCell();
    grid[2][3] = createAliveCell();
    grid[3][1] = createAliveCell();
    grid[3][2] = createAliveCell();
    expect(getNeighborCount(grid, 2, 2)).toBe(6);
  });

  it('counts all 6 neighbors when surrounded (odd row)', () => {
    const grid = createEmptyGrid(5, 5);
    grid[0][2] = createAliveCell();
    grid[0][3] = createAliveCell();
    grid[1][1] = createAliveCell();
    grid[1][3] = createAliveCell();
    grid[2][2] = createAliveCell();
    grid[2][3] = createAliveCell();
    expect(getNeighborCount(grid, 1, 2)).toBe(6);
  });

  it('handles corner cells correctly (top-left)', () => {
    const grid = createEmptyGrid(5, 5);
    grid[0][1] = createAliveCell();
    grid[1][0] = createAliveCell();
    expect(getNeighborCount(grid, 0, 0)).toBe(2);
  });

  it('handles edge cells correctly', () => {
    const grid = createEmptyGrid(5, 5);
    grid[0][1] = createAliveCell();
    grid[0][3] = createAliveCell();
    grid[1][1] = createAliveCell();
    grid[1][2] = createAliveCell();
    expect(getNeighborCount(grid, 0, 2)).toBe(4);
  });

  it('returns correct count with partial neighbors', () => {
    const grid = createEmptyGrid(5, 5);
    grid[1][2] = createAliveCell();
    grid[2][3] = createAliveCell();
    expect(getNeighborCount(grid, 2, 2)).toBe(2);
  });

  it('counts cells with any age > 0 as alive', () => {
    const grid = createEmptyGrid(5, 5);
    grid[1][2] = { age: 5, wealth: 50 };
    grid[2][3] = { age: 100, wealth: 200 };
    expect(getNeighborCount(grid, 2, 2)).toBe(2);
  });
});

describe('getNeighborPositions', () => {
  it('returns 6 positions for center cell', () => {
    const positions = getNeighborPositions(2, 2, 5, 5);
    expect(positions.length).toBe(6);
  });

  it('returns fewer positions for corner cell', () => {
    const positions = getNeighborPositions(0, 0, 5, 5);
    expect(positions.length).toBeLessThan(6);
  });

  it('filters out-of-bounds positions', () => {
    const positions = getNeighborPositions(0, 0, 5, 5);
    for (const pos of positions) {
      expect(pos.row).toBeGreaterThanOrEqual(0);
      expect(pos.col).toBeGreaterThanOrEqual(0);
      expect(pos.row).toBeLessThan(5);
      expect(pos.col).toBeLessThan(5);
    }
  });
});

describe('computeNextGeneration', () => {
  it('cell stays dead with no neighbors and negative wealth rule', () => {
    const grid = createEmptyGrid(3, 3);
    const rules = [-5, -3, 2, 3, -1, -2, -3]; // 0 neighbors = -5
    const next = computeNextGeneration(grid, rules);
    expect(next[1][1].age).toBe(0);
  });

  it('dead cell becomes alive when profit is positive', () => {
    const grid = createEmptyGrid(3, 3);
    grid[0][1] = createAliveCell();
    grid[1][0] = createAliveCell();
    // Center cell has 2 neighbors
    const rules = [-5, -3, 5, 3, -1, -2, -3]; // 2 neighbors = +5
    const next = computeNextGeneration(grid, rules);
    expect(next[1][1].age).toBe(1);
    expect(next[1][1].wealth).toBe(DEFAULT_STARTING_WEALTH);
  });

  it('alive cell survives and ages when wealth stays positive', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = { age: 5, wealth: 50 };
    const rules = [5, 0, 0, 0, 0, 0, 0]; // 0 neighbors = +5
    const next = computeNextGeneration(grid, rules);
    expect(next[1][1].age).toBe(6);
    expect(next[1][1].wealth).toBe(55);
  });

  it('alive cell dies when wealth drops to 0 or below', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = { age: 5, wealth: 3 };
    const rules = [-5, 0, 0, 0, 0, 0, 0]; // 0 neighbors = -5
    const next = computeNextGeneration(grid, rules);
    expect(next[1][1].age).toBe(0);
  });

  it('preserves grid dimensions', () => {
    const grid = createEmptyGrid(7, 5);
    const next = computeNextGeneration(grid, defaultWealthRules);
    expect(next.length).toBe(5);
    expect(next[0].length).toBe(7);
  });

  it('does not mutate original grid', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = createAliveCell();
    const gridCopy = JSON.parse(JSON.stringify(grid));
    computeNextGeneration(grid, defaultWealthRules);
    expect(grid).toEqual(gridCopy);
  });
});

describe('toggleCell', () => {
  it('toggles dead to alive', () => {
    const grid = createEmptyGrid(3, 3);
    const newGrid = toggleCell(grid, 1, 1);
    expect(newGrid[1][1].age).toBe(1);
    expect(newGrid[1][1].wealth).toBe(DEFAULT_STARTING_WEALTH);
  });

  it('toggles alive to dead', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = { age: 5, wealth: 100 };
    const newGrid = toggleCell(grid, 1, 1);
    expect(newGrid[1][1].age).toBe(0);
    expect(newGrid[1][1].wealth).toBe(0);
  });

  it('does not mutate original grid', () => {
    const grid = createEmptyGrid(3, 3);
    const newGrid = toggleCell(grid, 1, 1);
    expect(grid[1][1].age).toBe(0);
    expect(newGrid[1][1].age).toBe(1);
  });

  it('only affects specified cell', () => {
    const grid = createEmptyGrid(3, 3);
    grid[0][0] = createAliveCell();
    const newGrid = toggleCell(grid, 1, 1);
    expect(newGrid[0][0].age).toBe(1);
    expect(newGrid[1][1].age).toBe(1);
    expect(newGrid[2][2].age).toBe(0);
  });
});

describe('setCell', () => {
  it('sets cell to alive', () => {
    const grid = createEmptyGrid(3, 3);
    const newGrid = setCell(grid, 1, 1, true);
    expect(newGrid[1][1].age).toBe(1);
    expect(newGrid[1][1].wealth).toBe(DEFAULT_STARTING_WEALTH);
  });

  it('sets cell to dead', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = { age: 5, wealth: 100 };
    const newGrid = setCell(grid, 1, 1, false);
    expect(newGrid[1][1].age).toBe(0);
    expect(newGrid[1][1].wealth).toBe(0);
  });

  it('returns same reference if already dead and setting to dead', () => {
    const grid = createEmptyGrid(3, 3);
    const newGrid = setCell(grid, 1, 1, false);
    expect(newGrid).toBe(grid);
  });

  it('returns same reference if already alive and setting to alive', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = createAliveCell();
    const newGrid = setCell(grid, 1, 1, true);
    expect(newGrid).toBe(grid);
  });

  it('returns new grid when value changes', () => {
    const grid = createEmptyGrid(3, 3);
    const newGrid = setCell(grid, 1, 1, true);
    expect(newGrid).not.toBe(grid);
  });

  it('does not mutate original grid', () => {
    const grid = createEmptyGrid(3, 3);
    setCell(grid, 1, 1, true);
    expect(grid[1][1].age).toBe(0);
  });
});

describe('resizeGrid', () => {
  it('increases grid size correctly', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = { age: 5, wealth: 50 };
    const newGrid = resizeGrid(grid, 5, 5);
    expect(newGrid.length).toBe(5);
    expect(newGrid[0].length).toBe(5);
    expect(newGrid[1][1].age).toBe(5);
    expect(newGrid[1][1].wealth).toBe(50);
  });

  it('decreases grid size correctly', () => {
    const grid = createEmptyGrid(5, 5);
    grid[1][1] = { age: 3, wealth: 30 };
    grid[4][4] = { age: 7, wealth: 70 };
    const newGrid = resizeGrid(grid, 3, 3);
    expect(newGrid.length).toBe(3);
    expect(newGrid[0].length).toBe(3);
    expect(newGrid[1][1].age).toBe(3);
  });

  it('preserves existing cells in overlapping area', () => {
    const grid = createEmptyGrid(5, 5);
    grid[0][0] = { age: 1, wealth: 10 };
    grid[1][1] = { age: 2, wealth: 20 };
    grid[2][2] = { age: 3, wealth: 30 };
    const newGrid = resizeGrid(grid, 3, 3);
    expect(newGrid[0][0].age).toBe(1);
    expect(newGrid[1][1].age).toBe(2);
    expect(newGrid[2][2].age).toBe(3);
  });

  it('new cells are initialized as dead', () => {
    const grid = createEmptyGrid(2, 2);
    const newGrid = resizeGrid(grid, 4, 4);
    expect(newGrid[3][3].age).toBe(0);
    expect(newGrid[0][3].age).toBe(0);
    expect(newGrid[3][0].age).toBe(0);
  });

  it('does not mutate original grid', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = createAliveCell();
    const originalCopy = JSON.parse(JSON.stringify(grid));
    resizeGrid(grid, 5, 5);
    expect(grid).toEqual(originalCopy);
  });
});

describe('randomizeGrid', () => {
  it('creates grid with correct dimensions', () => {
    const grid = randomizeGrid(5, 3);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(5);
  });

  it('respects density with mock random', () => {
    let callCount = 0;
    const mockRandom = () => {
      callCount++;
      return callCount % 2 === 0 ? 0.2 : 0.8;
    };

    const grid = randomizeGrid(4, 4, 0.5, DEFAULT_STARTING_WEALTH, mockRandom);
    const aliveCount = grid.flat().filter(cell => cell.age > 0).length;
    expect(aliveCount).toBe(8);
  });

  it('returns all dead with density 0', () => {
    const grid = randomizeGrid(3, 3, 0, DEFAULT_STARTING_WEALTH, () => 0.5);
    const aliveCount = grid.flat().filter(cell => cell.age > 0).length;
    expect(aliveCount).toBe(0);
  });

  it('returns all alive with density 1', () => {
    const grid = randomizeGrid(3, 3, 1, DEFAULT_STARTING_WEALTH, () => 0.5);
    const aliveCount = grid.flat().filter(cell => cell.age > 0).length;
    expect(aliveCount).toBe(9);
  });

  it('alive cells start with age 1 and starting wealth', () => {
    const grid = randomizeGrid(3, 3, 1, 15, () => 0.5);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.age).toBe(1);
        expect(cell.wealth).toBe(15);
      }
    }
  });
});

describe('defaultWealthRules', () => {
  it('has length 7 (for 0-6 neighbors)', () => {
    expect(defaultWealthRules.length).toBe(7);
  });

  it('has some positive and some negative values', () => {
    expect(defaultWealthRules.some(r => r > 0)).toBe(true);
    expect(defaultWealthRules.some(r => r < 0)).toBe(true);
  });
});

describe('helper functions', () => {
  describe('isAlive', () => {
    it('returns false for dead cell', () => {
      expect(isAlive({ age: 0, wealth: 0 })).toBe(false);
    });

    it('returns true for alive cells', () => {
      expect(isAlive({ age: 1, wealth: 10 })).toBe(true);
      expect(isAlive({ age: 5, wealth: 50 })).toBe(true);
      expect(isAlive({ age: 100, wealth: 1000 })).toBe(true);
    });
  });

  describe('getCellAge', () => {
    it('returns the cell age', () => {
      expect(getCellAge({ age: 0, wealth: 0 })).toBe(0);
      expect(getCellAge({ age: 1, wealth: 10 })).toBe(1);
      expect(getCellAge({ age: 50, wealth: 500 })).toBe(50);
    });
  });

  describe('getCellWealth', () => {
    it('returns the cell wealth', () => {
      expect(getCellWealth({ age: 0, wealth: 0 })).toBe(0);
      expect(getCellWealth({ age: 1, wealth: 10 })).toBe(10);
      expect(getCellWealth({ age: 50, wealth: 500 })).toBe(500);
    });
  });
});
