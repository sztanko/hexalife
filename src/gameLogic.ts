import { CellData, WealthRules, DEFAULT_STARTING_WEALTH } from './types';

// Default wealth rules: profit/cost based on neighbor count (0-6)
// Negative = cost (lose wealth), Positive = profit (gain wealth)
// Only 3 neighbors is profitable
export const defaultWealthRules: WealthRules = [-1, -3, -1, 1, -1, -2, -3];

// Create an empty cell
export function createEmptyCell(): CellData {
  return { age: 0, wealth: 0 };
}

// Create a new alive cell with starting wealth
export function createAliveCell(startingWealth: number = DEFAULT_STARTING_WEALTH): CellData {
  return { age: 1, wealth: startingWealth };
}

// Create empty grid with CellData
export function createEmptyGrid(width: number, height: number): CellData[][] {
  return Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => createEmptyCell())
  );
}

// Get neighbor offsets for hexagonal grid based on row parity
export function getHexNeighborOffsets(isOddRow: boolean): [number, number][] {
  // Using "odd-r" horizontal layout
  return isOddRow
    ? [
        [-1, 0], [-1, 1],  // top-left, top-right
        [0, -1], [0, 1],   // left, right
        [1, 0], [1, 1],    // bottom-left, bottom-right
      ]
    : [
        [-1, -1], [-1, 0], // top-left, top-right
        [0, -1], [0, 1],   // left, right
        [1, -1], [1, 0],   // bottom-left, bottom-right
      ];
}

// Get neighbors for hexagonal grid (offset coordinates)
export function getNeighborCount(grid: CellData[][], row: number, col: number): number {
  const height = grid.length;
  const width = grid[0].length;
  const isOddRow = row % 2 === 1;
  const neighbors = getHexNeighborOffsets(isOddRow);

  let count = 0;
  for (const [dr, dc] of neighbors) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
      if (grid[newRow][newCol].age > 0) {
        count++;
      }
    }
  }
  return count;
}

// Get all neighbor positions for a cell
export function getNeighborPositions(
  row: number,
  col: number,
  height: number,
  width: number
): { row: number; col: number }[] {
  const isOddRow = row % 2 === 1;
  const offsets = getHexNeighborOffsets(isOddRow);
  const positions: { row: number; col: number }[] = [];

  for (const [dr, dc] of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
      positions.push({ row: newRow, col: newCol });
    }
  }
  return positions;
}

// Compute next generation with wealth-based rules
export function computeNextGeneration(
  grid: CellData[][],
  wealthRules: WealthRules,
  startingWealth: number = DEFAULT_STARTING_WEALTH
): CellData[][] {
  const height = grid.length;
  const width = grid[0].length;
  const newGrid = createEmptyGrid(width, height);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const neighborCount = getNeighborCount(grid, row, col);
      const currentCell = grid[row][col];
      const isCurrentlyAlive = currentCell.age > 0;

      // Get wealth change based on neighbor count
      const wealthChange = wealthRules[neighborCount] ?? 0;

      if (isCurrentlyAlive) {
        // Calculate new wealth
        const newWealth = currentCell.wealth + wealthChange;

        if (newWealth > 0) {
          // Cell survives - increment age and update wealth
          newGrid[row][col] = {
            age: currentCell.age + 1,
            wealth: newWealth,
          };
        } else {
          // Cell dies - wealth dropped to 0 or below
          newGrid[row][col] = createEmptyCell();
        }
      } else {
        // Dead cell - check if it should be born
        // Born if the position would be profitable (positive wealth change)
        if (wealthChange > 0) {
          newGrid[row][col] = {
            age: 1,
            wealth: startingWealth,
          };
        } else {
          // Stay dead
          newGrid[row][col] = createEmptyCell();
        }
      }
    }
  }

  return newGrid;
}

// Toggle a cell in the grid (immutable)
// Dead -> Alive (with starting wealth), Alive -> Dead
export function toggleCell(
  grid: CellData[][],
  row: number,
  col: number,
  startingWealth: number = DEFAULT_STARTING_WEALTH
): CellData[][] {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  const currentCell = newGrid[row][col];

  if (currentCell.age > 0) {
    // Kill the cell
    newGrid[row][col] = createEmptyCell();
  } else {
    // Bring to life
    newGrid[row][col] = createAliveCell(startingWealth);
  }

  return newGrid;
}

// Set a cell value in the grid (immutable)
// value: true = alive (with starting wealth), false = dead
export function setCell(
  grid: CellData[][],
  row: number,
  col: number,
  value: boolean,
  startingWealth: number = DEFAULT_STARTING_WEALTH
): CellData[][] {
  const currentAlive = grid[row]?.[col]?.age > 0;
  if (currentAlive === value) return grid;

  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  newGrid[row][col] = value
    ? createAliveCell(startingWealth)
    : createEmptyCell();

  return newGrid;
}

// Resize grid, preserving existing cells where possible
export function resizeGrid(grid: CellData[][], newWidth: number, newHeight: number): CellData[][] {
  const newGrid = createEmptyGrid(newWidth, newHeight);
  const oldHeight = grid.length;
  const oldWidth = grid[0]?.length ?? 0;

  for (let row = 0; row < Math.min(oldHeight, newHeight); row++) {
    for (let col = 0; col < Math.min(oldWidth, newWidth); col++) {
      newGrid[row][col] = { ...grid[row][col] };
    }
  }
  return newGrid;
}

// Randomize grid with given density
// Alive cells start with starting wealth
export function randomizeGrid(
  width: number,
  height: number,
  density: number = 0.3,
  startingWealth: number = DEFAULT_STARTING_WEALTH,
  randomFn: () => number = Math.random
): CellData[][] {
  return Array(height)
    .fill(null)
    .map(() =>
      Array(width)
        .fill(null)
        .map(() => randomFn() < density
          ? createAliveCell(startingWealth)
          : createEmptyCell()
        )
    );
}

// Helper to check if a cell is alive
export function isAlive(cell: CellData): boolean {
  return cell.age > 0;
}

// Helper to get cell age (0 if dead)
export function getCellAge(cell: CellData): number {
  return cell.age;
}

// Helper to get cell wealth (0 if dead)
export function getCellWealth(cell: CellData): number {
  return cell.wealth;
}
