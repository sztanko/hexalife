import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Metrics } from './Metrics';
import { CellData } from '../types';

describe('Metrics', () => {
  const createCell = (age: number, wealth: number): CellData => ({ age, wealth });

  const defaultProps = {
    cells: [[createCell(0, 0)]],
    generation: 0,
  };

  it('displays generation number', () => {
    render(<Metrics {...defaultProps} generation={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays total cells count', () => {
    const cells = [
      [createCell(1, 10), createCell(0, 0), createCell(2, 20)],
      [createCell(0, 0), createCell(1, 15), createCell(0, 0)],
    ];
    render(<Metrics {...defaultProps} cells={cells} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays total wealth', () => {
    const cells = [
      [createCell(1, 10), createCell(0, 0)],
      [createCell(1, 20), createCell(1, 30)],
    ];
    render(<Metrics {...defaultProps} cells={cells} />);
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('displays average wealth per cell', () => {
    const cells = [
      [createCell(1, 10), createCell(0, 0)],
      [createCell(1, 20), createCell(1, 30)],
    ];
    render(<Metrics {...defaultProps} cells={cells} />);
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('displays zero cells when grid is empty', () => {
    const cells = [
      [createCell(0, 0), createCell(0, 0)],
      [createCell(0, 0), createCell(0, 0)],
    ];
    render(<Metrics {...defaultProps} cells={cells} />);
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });

  it('displays 0.0 average when no cells alive', () => {
    const cells = [
      [createCell(0, 0), createCell(0, 0)],
    ];
    render(<Metrics {...defaultProps} cells={cells} />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('renders all metric labels', () => {
    const cells = [[createCell(1, 10)]];
    render(<Metrics {...defaultProps} cells={cells} />);
    expect(screen.getByText('Generation:')).toBeInTheDocument();
    expect(screen.getByText('Cells:')).toBeInTheDocument();
    expect(screen.getByText('Total Wealth:')).toBeInTheDocument();
    expect(screen.getByText('Avg Wealth:')).toBeInTheDocument();
  });

  it('calculates correctly with single cell', () => {
    const cells = [[createCell(1, 25)]];
    render(<Metrics {...defaultProps} cells={cells} generation={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('25.0')).toBeInTheDocument();
  });

  it('only counts alive cells (age > 0)', () => {
    const cells = [
      [createCell(0, 100), createCell(1, 10)],
      [createCell(0, 50), createCell(2, 20)],
    ];
    render(<Metrics {...defaultProps} cells={cells} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('15.0')).toBeInTheDocument();
  });

  it('handles large grids', () => {
    const cells = Array(10).fill(null).map(() =>
      Array(10).fill(null).map(() => createCell(1, 5))
    );
    render(<Metrics {...defaultProps} cells={cells} generation={1000} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });
});
