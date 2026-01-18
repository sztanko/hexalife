import { useRef, useEffect, useCallback, useState } from 'react';
import { ColoringMode, CellData } from '../types';
import { getNeighborCount } from '../gameLogic';

interface HexGridProps {
  cells: CellData[][];
  width: number;
  height: number;
  coloringMode: ColoringMode;
  onCellToggle: (row: number, col: number) => void;
  onCellSet: (row: number, col: number, value: boolean) => void;
}

const HEX_SIZE = 7; // Radius of hexagon (smaller for larger grids)
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;
const VERTICAL_SPACING = HEX_HEIGHT * 0.75;

// Get color based on cell age (relative to min/max in grid)
// Age = minAge = bright light green
// Age = maxAge = red
function getAgeColor(age: number, minAge: number, maxAge: number): string {
  if (age === 0) {
    return '#1e293b'; // Dead cell color
  }

  // Normalize age to 0-1 range relative to current grid
  const range = maxAge - minAge;
  const normalizedAge = range > 0 ? (age - minAge) / range : 0;

  // Interpolate from light green (HSL: 120, 70%, 65%) to red (HSL: 0, 70%, 50%)
  const hue = 120 - normalizedAge * 120; // 120 (green) -> 0 (red)
  const saturation = 70 + normalizedAge * 10; // 70% -> 80%
  const lightness = 65 - normalizedAge * 20; // 65% -> 45%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Get color based on number of neighbors
// 0 neighbors = blue, 6 neighbors = yellow
function getNeighborColor(isAlive: boolean, neighborCount: number): string {
  if (!isAlive) {
    return '#1e293b'; // Dead cell color
  }

  // Map 0-6 neighbors to a color spectrum (blue to cyan to green to yellow)
  // Using hue: 240 (blue) -> 60 (yellow)
  const normalizedCount = neighborCount / 6;
  const hue = 240 - normalizedCount * 180; // 240 (blue) -> 60 (yellow)
  const saturation = 70;
  const lightness = 55;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Get color based on wealth (relative to min/max in grid)
// Low wealth = red/orange (danger), High wealth = green/cyan (prosperous)
function getWealthColor(isAlive: boolean, wealth: number, minWealth: number, maxWealth: number): string {
  if (!isAlive) {
    return '#1e293b'; // Dead cell color
  }

  // Normalize wealth to 0-1 range relative to current grid
  const range = maxWealth - minWealth;
  const normalizedWealth = range > 0 ? (wealth - minWealth) / range : 0;

  // Interpolate from red (low wealth) to cyan (high wealth)
  // Hue: 0 (red) -> 180 (cyan)
  const hue = normalizedWealth * 180; // 0 (red) -> 180 (cyan)
  const saturation = 70;
  const lightness = 50 + normalizedWealth * 15; // 50% -> 65%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function getHexCenter(row: number, col: number): { x: number; y: number } {
  const isOddRow = row % 2 === 1;
  const x = HEX_WIDTH * col + (isOddRow ? HEX_WIDTH / 2 : 0) + HEX_SIZE + 5;
  const y = VERTICAL_SPACING * row + HEX_SIZE + 5;
  return { x, y };
}

function pixelToHex(px: number, py: number, gridHeight: number, gridWidth: number): { row: number; col: number } | null {
  // Approximate conversion - find closest hex center
  let closestRow = -1;
  let closestCol = -1;
  let minDist = Infinity;

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const { x, y } = getHexCenter(row, col);
      const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
      if (dist < minDist && dist < HEX_SIZE) {
        minDist = dist;
        closestRow = row;
        closestCol = col;
      }
    }
  }

  if (closestRow >= 0 && closestCol >= 0) {
    return { row: closestRow, col: closestCol };
  }
  return null;
}

export function HexGrid({ cells, width, height, coloringMode, onCellToggle, onCellSet }: HexGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<boolean | null>(null);
  const lastCellRef = useRef<{ row: number; col: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; x: number; y: number } | null>(null);

  const canvasWidth = HEX_WIDTH * width + HEX_WIDTH / 2 + 10;
  const canvasHeight = VERTICAL_SPACING * height + HEX_HEIGHT / 4 + 10;

  // Draw the grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate min/max values for relative coloring
    const aliveCells = cells.flat().filter(c => c.age > 0);
    const ages = aliveCells.map(c => c.age);
    const wealths = aliveCells.map(c => c.wealth);

    const minAge = ages.length > 0 ? Math.min(...ages) : 1;
    const maxAge = ages.length > 0 ? Math.max(...ages) : 1;
    const minWealth = wealths.length > 0 ? Math.min(...wealths) : 0;
    const maxWealth = wealths.length > 0 ? Math.max(...wealths) : 1;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw all hexagons
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const { x, y } = getHexCenter(row, col);
        const cell = cells[row]?.[col] ?? { age: 0, wealth: 0 };
        const isAlive = cell.age > 0;

        let color: string;
        if (coloringMode === 'age') {
          color = getAgeColor(cell.age, minAge, maxAge);
        } else if (coloringMode === 'wealth') {
          color = getWealthColor(isAlive, cell.wealth, minWealth, maxWealth);
        } else {
          const neighborCount = getNeighborCount(cells, row, col);
          color = getNeighborColor(isAlive, neighborCount);
        }

        drawHexagon(ctx, x, y, HEX_SIZE, color);
      }
    }
  }, [cells, width, height, coloringMode, canvasWidth, canvasHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const hex = pixelToHex(x, y, height, width);
    if (hex) {
      const cell = cells[hex.row]?.[hex.col];
      const isAlive = cell?.age > 0;
      setDrawMode(!isAlive);
      setIsDrawing(true);
      onCellToggle(hex.row, hex.col);
      lastCellRef.current = hex;
    }
  }, [cells, height, width, onCellToggle]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const hex = pixelToHex(x, y, height, width);

    // Update tooltip position
    if (hex) {
      setHoveredCell({ row: hex.row, col: hex.col, x: e.clientX, y: e.clientY });
    } else {
      setHoveredCell(null);
    }

    // Handle drawing
    if (isDrawing && drawMode !== null && hex && (lastCellRef.current?.row !== hex.row || lastCellRef.current?.col !== hex.col)) {
      onCellSet(hex.row, hex.col, drawMode);
      lastCellRef.current = hex;
    }
  }, [isDrawing, drawMode, height, width, onCellSet]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDrawMode(null);
    lastCellRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setDrawMode(null);
    lastCellRef.current = null;
    setHoveredCell(null);
  }, []);

  const hoveredCellData = hoveredCell ? cells[hoveredCell.row]?.[hoveredCell.col] : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '2px solid #334155',
          borderRadius: '8px',
          cursor: 'crosshair',
          maxWidth: '100%',
          height: 'auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {hoveredCell && hoveredCellData && hoveredCellData.age > 0 && (
        <div
          className="cell-tooltip"
          style={{
            position: 'fixed',
            left: hoveredCell.x + 15,
            top: hoveredCell.y + 15,
          }}
        >
          <div>Age: {hoveredCellData.age}</div>
          <div>Wealth: {hoveredCellData.wealth}</div>
        </div>
      )}
    </div>
  );
}
