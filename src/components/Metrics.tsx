import { CellData } from '../types';

interface MetricsProps {
  cells: CellData[][];
  generation: number;
}

export function Metrics({ cells, generation }: MetricsProps) {
  const aliveCells = cells.flat().filter(c => c.age > 0);
  const totalCells = aliveCells.length;
  const totalWealth = aliveCells.reduce((sum, c) => sum + c.wealth, 0);
  const avgWealth = totalCells > 0 ? totalWealth / totalCells : 0;

  return (
    <div className="metrics">
      <div className="metric">
        <span className="metric-label">Generation:</span>
        <span className="metric-value">{generation}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Cells:</span>
        <span className="metric-value">{totalCells}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Total Wealth:</span>
        <span className="metric-value">{totalWealth}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Avg Wealth:</span>
        <span className="metric-value">{avgWealth.toFixed(1)}</span>
      </div>
    </div>
  );
}
