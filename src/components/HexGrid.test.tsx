import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { HexGrid } from './HexGrid';
import { CellData } from '../types';

describe('HexGrid', () => {
  const createCell = (age: number, wealth: number): CellData => ({ age, wealth });

  const defaultProps = {
    cells: [
      [createCell(0, 0), createCell(0, 0), createCell(0, 0)],
      [createCell(0, 0), createCell(1, 10), createCell(0, 0)],
      [createCell(0, 0), createCell(0, 0), createCell(0, 0)],
    ],
    width: 3,
    height: 3,
    coloringMode: 'age' as const,
    onCellToggle: vi.fn(),
    onCellSet: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a canvas element', () => {
    const { container } = render(<HexGrid {...defaultProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('canvas has correct dimensions based on grid size', () => {
    const { container } = render(<HexGrid {...defaultProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.width).toBeGreaterThan(0);
    expect(canvas?.height).toBeGreaterThan(0);
  });

  it('canvas has crosshair cursor style', () => {
    const { container } = render(<HexGrid {...defaultProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.style.cursor).toBe('crosshair');
  });

  it('handles mouse down event', () => {
    const onCellToggle = vi.fn();
    const { container } = render(
      <HexGrid {...defaultProps} onCellToggle={onCellToggle} />
    );
    const canvas = container.querySelector('canvas');

    if (canvas) {
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        right: canvas.width,
        bottom: canvas.height,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      fireEvent.mouseDown(canvas, { clientX: 20, clientY: 20 });
    }

    expect(canvas).toBeInTheDocument();
  });

  it('handles mouse up event', () => {
    const { container } = render(<HexGrid {...defaultProps} />);
    const canvas = container.querySelector('canvas');

    if (canvas) {
      fireEvent.mouseUp(canvas);
    }

    expect(canvas).toBeInTheDocument();
  });

  it('handles mouse leave event', () => {
    const { container } = render(<HexGrid {...defaultProps} />);
    const canvas = container.querySelector('canvas');

    if (canvas) {
      fireEvent.mouseLeave(canvas);
    }

    expect(canvas).toBeInTheDocument();
  });

  it('handles mouse move event when not drawing', () => {
    const onCellSet = vi.fn();
    const { container } = render(
      <HexGrid {...defaultProps} onCellSet={onCellSet} />
    );
    const canvas = container.querySelector('canvas');

    if (canvas) {
      fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    }

    expect(onCellSet).not.toHaveBeenCalled();
  });

  it('adjusts canvas size when grid dimensions change', () => {
    const { container, rerender } = render(<HexGrid {...defaultProps} />);
    const canvas1 = container.querySelector('canvas');
    const initialWidth = canvas1?.width ?? 0;

    const largerCells = Array(10).fill(null).map(() =>
      Array(10).fill(null).map(() => createCell(0, 0))
    );

    rerender(<HexGrid {...defaultProps} cells={largerCells} width={10} height={10} />);
    const canvas2 = container.querySelector('canvas');

    expect(canvas2?.width).toBeGreaterThan(initialWidth);
  });

  it('renders with empty grid', () => {
    const emptyProps = {
      ...defaultProps,
      cells: [
        [createCell(0, 0), createCell(0, 0)],
        [createCell(0, 0), createCell(0, 0)],
      ],
      width: 2,
      height: 2,
    };

    const { container } = render(<HexGrid {...emptyProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with all cells alive', () => {
    const fullProps = {
      ...defaultProps,
      cells: [
        [createCell(1, 10), createCell(1, 10)],
        [createCell(1, 10), createCell(1, 10)],
      ],
      width: 2,
      height: 2,
    };

    const { container } = render(<HexGrid {...fullProps} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with neighbor coloring mode', () => {
    const { container } = render(<HexGrid {...defaultProps} coloringMode="neighbors" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with wealth coloring mode', () => {
    const wealthyCells = [
      [createCell(1, 50), createCell(1, 100)],
      [createCell(1, 10), createCell(1, 5)],
    ];
    const { container } = render(
      <HexGrid {...defaultProps} cells={wealthyCells} width={2} height={2} coloringMode="wealth" />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
