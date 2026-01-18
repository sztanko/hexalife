# HexaLife

A wealth-based cellular automaton on a hexagonal grid. An evolution of Conway's Game of Life where cells have wealth that determines their survival.

**[Play it live](https://sztanko.github.io/hexalife/)**

## What is this?

HexaLife reimagines the classic Game of Life with two twists:

1. **Hexagonal grid** — Each cell has 6 neighbors instead of 8, creating different dynamics
2. **Wealth mechanics** — Cells don't just live or die based on neighbor count. They have wealth that increases or decreases each generation based on their neighborhood

## How it works

### The Wealth System

Every living cell has:
- **Age** — How many generations it has survived
- **Wealth** — A numeric value that changes each generation

Each generation:
- Cells gain or lose wealth based on their neighbor count
- If wealth drops to 0 or below, the cell dies
- Empty cells become alive if having that many neighbors would be profitable

### Default Rules

| Neighbors | Wealth Change |
|-----------|---------------|
| 0 | -1 |
| 1 | -3 |
| 2 | -1 |
| 3 | +1 |
| 4 | -1 |
| 5 | -2 |
| 6 | -3 |

Only cells with exactly 3 neighbors profit. All other configurations drain wealth over time.

## Features

- **Draw cells** — Click or drag to create/remove cells
- **Simulation controls** — Play, Pause, Step through generations
- **Speed control** — Adjust simulation speed (50ms - 1000ms)
- **Grid resize** — Change grid dimensions on the fly
- **Coloring modes:**
  - *Age* — Green (young) to Red (old), relative to current population
  - *Neighbors* — Blue (isolated) to Yellow (crowded)
  - *Wealth* — Red (poor) to Cyan (rich), relative to current population
- **Cell tooltips** — Hover over cells to see their age and wealth
- **Custom rules** — Configure profit/cost for each neighbor count
- **Presets** — Try different rule configurations
- **Reset Wealth** — Set all cells to wealth 1 for a fresh start
- **Auto-stop** — Simulation stops when all cells die
- **Persistent state** — Your grid and settings are saved in localStorage

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Vitest for testing
- Canvas API for rendering

## License

MIT
