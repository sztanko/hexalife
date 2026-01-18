// Cell data structure
export interface CellData {
  age: number;    // 0 = dead, 1+ = number of generations alive
  wealth: number; // current wealth (only meaningful when alive)
}

// WealthRules: profit/cost for each neighbor count (0-6)
// Positive = profit, Negative = cost
// Index 0-6 represents number of alive neighbors
export type WealthRules = number[];

export interface GridState {
  cells: CellData[][];
  width: number;
  height: number;
}

export type SimulationState = 'stopped' | 'paused' | 'playing';

export type ColoringMode = 'age' | 'neighbors' | 'wealth';

// Starting wealth for newly born cells
export const DEFAULT_STARTING_WEALTH = 10;
