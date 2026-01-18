import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Controls } from './Controls';

describe('Controls', () => {
  const defaultProps = {
    simulationState: 'stopped' as const,
    width: 30,
    height: 20,
    speed: 200,
    coloringMode: 'age' as const,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onClear: vi.fn(),
    onStep: vi.fn(),
    onResize: vi.fn(),
    onRandomize: vi.fn(),
    onResetWealth: vi.fn(),
    onSpeedChange: vi.fn(),
    onColoringModeChange: vi.fn(),
    onOpenProbabilities: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('play/pause button', () => {
    it('shows Play button when stopped', () => {
      render(<Controls {...defaultProps} simulationState="stopped" />);
      expect(screen.getByText(/Play/)).toBeInTheDocument();
    });

    it('shows Play button when paused', () => {
      render(<Controls {...defaultProps} simulationState="paused" />);
      expect(screen.getByText(/Play/)).toBeInTheDocument();
    });

    it('shows Pause button when playing', () => {
      render(<Controls {...defaultProps} simulationState="playing" />);
      expect(screen.getByText(/Pause/)).toBeInTheDocument();
    });

    it('calls onPlay when Play button clicked', () => {
      const onPlay = vi.fn();
      render(<Controls {...defaultProps} onPlay={onPlay} />);
      fireEvent.click(screen.getByText(/Play/));
      expect(onPlay).toHaveBeenCalledTimes(1);
    });

    it('calls onPause when Pause button clicked', () => {
      const onPause = vi.fn();
      render(<Controls {...defaultProps} simulationState="playing" onPause={onPause} />);
      fireEvent.click(screen.getByText(/Pause/));
      expect(onPause).toHaveBeenCalledTimes(1);
    });
  });

  describe('step button', () => {
    it('renders Step button', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });

    it('calls onStep when clicked', () => {
      const onStep = vi.fn();
      render(<Controls {...defaultProps} onStep={onStep} />);
      fireEvent.click(screen.getByText(/Step/));
      expect(onStep).toHaveBeenCalledTimes(1);
    });

    it('is disabled when playing', () => {
      render(<Controls {...defaultProps} simulationState="playing" />);
      const stepButton = screen.getByText(/Step/).closest('button');
      expect(stepButton).toBeDisabled();
    });

    it('is enabled when stopped', () => {
      render(<Controls {...defaultProps} simulationState="stopped" />);
      const stepButton = screen.getByText(/Step/).closest('button');
      expect(stepButton).not.toBeDisabled();
    });
  });

  describe('clear button', () => {
    it('renders Clear button', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByText(/Clear/)).toBeInTheDocument();
    });

    it('calls onClear when clicked', () => {
      const onClear = vi.fn();
      render(<Controls {...defaultProps} onClear={onClear} />);
      fireEvent.click(screen.getByText(/Clear/));
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('speed slider', () => {
    it('displays current speed', () => {
      render(<Controls {...defaultProps} speed={500} />);
      expect(screen.getByText(/500ms/)).toBeInTheDocument();
    });

    it('calls onSpeedChange when slider changes', () => {
      const onSpeedChange = vi.fn();
      render(<Controls {...defaultProps} onSpeedChange={onSpeedChange} />);
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '300' } });
      expect(onSpeedChange).toHaveBeenCalledWith(300);
    });
  });

  describe('grid size inputs', () => {
    it('displays current width', () => {
      render(<Controls {...defaultProps} width={50} />);
      const widthInput = screen.getAllByRole('spinbutton')[0];
      expect(widthInput).toHaveValue(50);
    });

    it('displays current height', () => {
      render(<Controls {...defaultProps} height={40} />);
      const heightInput = screen.getAllByRole('spinbutton')[1];
      expect(heightInput).toHaveValue(40);
    });

    it('calls onResize when width changes', () => {
      const onResize = vi.fn();
      render(<Controls {...defaultProps} width={30} height={20} onResize={onResize} />);
      const widthInput = screen.getAllByRole('spinbutton')[0];
      fireEvent.change(widthInput, { target: { value: '40' } });
      expect(onResize).toHaveBeenCalledWith(40, 20);
    });

    it('calls onResize when height changes', () => {
      const onResize = vi.fn();
      render(<Controls {...defaultProps} width={30} height={20} onResize={onResize} />);
      const heightInput = screen.getAllByRole('spinbutton')[1];
      fireEvent.change(heightInput, { target: { value: '30' } });
      expect(onResize).toHaveBeenCalledWith(30, 30);
    });
  });

  describe('coloring mode toggle', () => {
    it('renders Age, Neighbors, and Wealth buttons', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Neighbors')).toBeInTheDocument();
      expect(screen.getByText('Wealth')).toBeInTheDocument();
    });

    it('highlights Age button when coloringMode is age', () => {
      render(<Controls {...defaultProps} coloringMode="age" />);
      const ageButton = screen.getByText('Age').closest('button');
      expect(ageButton?.className).toContain('btn-primary');
    });

    it('highlights Neighbors button when coloringMode is neighbors', () => {
      render(<Controls {...defaultProps} coloringMode="neighbors" />);
      const neighborsButton = screen.getByText('Neighbors').closest('button');
      expect(neighborsButton?.className).toContain('btn-primary');
    });

    it('highlights Wealth button when coloringMode is wealth', () => {
      render(<Controls {...defaultProps} coloringMode="wealth" />);
      const wealthButton = screen.getByText('Wealth').closest('button');
      expect(wealthButton?.className).toContain('btn-primary');
    });

    it('calls onColoringModeChange with age when Age clicked', () => {
      const onColoringModeChange = vi.fn();
      render(<Controls {...defaultProps} coloringMode="neighbors" onColoringModeChange={onColoringModeChange} />);
      fireEvent.click(screen.getByText('Age'));
      expect(onColoringModeChange).toHaveBeenCalledWith('age');
    });

    it('calls onColoringModeChange with neighbors when Neighbors clicked', () => {
      const onColoringModeChange = vi.fn();
      render(<Controls {...defaultProps} coloringMode="age" onColoringModeChange={onColoringModeChange} />);
      fireEvent.click(screen.getByText('Neighbors'));
      expect(onColoringModeChange).toHaveBeenCalledWith('neighbors');
    });

    it('calls onColoringModeChange with wealth when Wealth clicked', () => {
      const onColoringModeChange = vi.fn();
      render(<Controls {...defaultProps} coloringMode="age" onColoringModeChange={onColoringModeChange} />);
      fireEvent.click(screen.getByText('Wealth'));
      expect(onColoringModeChange).toHaveBeenCalledWith('wealth');
    });
  });

  describe('action buttons', () => {
    it('renders Random button', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByText(/Random/)).toBeInTheDocument();
    });

    it('calls onRandomize when Random clicked', () => {
      const onRandomize = vi.fn();
      render(<Controls {...defaultProps} onRandomize={onRandomize} />);
      fireEvent.click(screen.getByText(/Random/));
      expect(onRandomize).toHaveBeenCalledTimes(1);
    });

    it('renders Rules button', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByText(/Rules/)).toBeInTheDocument();
    });

    it('calls onOpenProbabilities when Rules clicked', () => {
      const onOpenProbabilities = vi.fn();
      render(<Controls {...defaultProps} onOpenProbabilities={onOpenProbabilities} />);
      fireEvent.click(screen.getByText(/Rules/));
      expect(onOpenProbabilities).toHaveBeenCalledTimes(1);
    });

    it('renders Reset Wealth button', () => {
      render(<Controls {...defaultProps} />);
      expect(screen.getByText(/Reset Wealth/)).toBeInTheDocument();
    });

    it('calls onResetWealth when Reset Wealth clicked', () => {
      const onResetWealth = vi.fn();
      render(<Controls {...defaultProps} onResetWealth={onResetWealth} />);
      fireEvent.click(screen.getByText(/Reset Wealth/));
      expect(onResetWealth).toHaveBeenCalledTimes(1);
    });
  });
});
