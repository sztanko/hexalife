import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WealthRulesPopup } from './WealthRulesPopup';
import { defaultWealthRules } from '../gameLogic';

describe('WealthRulesPopup', () => {
  const defaultProps = {
    wealthRules: [-3, -2, 2, 3, -1, -2, -3],
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the popup with title', () => {
    render(<WealthRulesPopup {...defaultProps} />);
    expect(screen.getByText('Wealth Rules')).toBeInTheDocument();
  });

  it('renders all 7 neighbor count rows (0-6)', () => {
    render(<WealthRulesPopup {...defaultProps} />);
    for (let i = 0; i <= 6; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it('renders sliders for each neighbor count', () => {
    render(<WealthRulesPopup {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(7);
  });

  it('displays current wealth rule values', () => {
    render(<WealthRulesPopup {...defaultProps} wealthRules={[-5, -3, 3, 5, -2, -4, -6]} />);
    expect(screen.getByText('-6')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('calls onSave with updated rules when Save clicked', () => {
    const onSave = vi.fn();
    render(<WealthRulesPopup {...defaultProps} onSave={onSave} />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[2], { target: { value: '5' } });

    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith([-3, -2, 5, 3, -1, -2, -3]);
  });

  it('calls onClose when Save clicked', () => {
    const onClose = vi.fn();
    render(<WealthRulesPopup {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Save'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn();
    render(<WealthRulesPopup {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onSave when Cancel clicked', () => {
    const onSave = vi.fn();
    render(<WealthRulesPopup {...defaultProps} onSave={onSave} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(<WealthRulesPopup {...defaultProps} onClose={onClose} />);

    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when popup content clicked', () => {
    const onClose = vi.fn();
    render(<WealthRulesPopup {...defaultProps} onClose={onClose} />);

    const popup = document.querySelector('.popup');
    if (popup) {
      fireEvent.click(popup);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets to default rules when Reset clicked', () => {
    const onSave = vi.fn();
    render(<WealthRulesPopup {...defaultProps} wealthRules={[1, 1, 1, 1, 1, 1, 1]} onSave={onSave} />);

    fireEvent.click(screen.getByText('Reset to Default'));
    fireEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith(defaultWealthRules);
  });

  describe('presets', () => {
    it('renders preset buttons', () => {
      render(<WealthRulesPopup {...defaultProps} />);
      expect(screen.getByText('Classic')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
      expect(screen.getByText('Volatile')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
    });

    it('applies Classic preset when clicked', () => {
      const onSave = vi.fn();
      render(<WealthRulesPopup {...defaultProps} onSave={onSave} />);

      fireEvent.click(screen.getByText('Classic'));
      fireEvent.click(screen.getByText('Save'));

      expect(onSave).toHaveBeenCalledWith([-5, -3, 3, 5, -2, -4, -5]);
    });

    it('applies Stable preset when clicked', () => {
      const onSave = vi.fn();
      render(<WealthRulesPopup {...defaultProps} onSave={onSave} />);

      fireEvent.click(screen.getByText('Stable'));
      fireEvent.click(screen.getByText('Save'));

      expect(onSave).toHaveBeenCalledWith([-2, 0, 2, 2, 0, -1, -2]);
    });

    it('applies Volatile preset when clicked', () => {
      const onSave = vi.fn();
      render(<WealthRulesPopup {...defaultProps} onSave={onSave} />);

      fireEvent.click(screen.getByText('Volatile'));
      fireEvent.click(screen.getByText('Save'));

      expect(onSave).toHaveBeenCalledWith([-10, -5, 5, 10, -3, -6, -10]);
    });

    it('applies Social preset when clicked', () => {
      const onSave = vi.fn();
      render(<WealthRulesPopup {...defaultProps} onSave={onSave} />);

      fireEvent.click(screen.getByText('Social'));
      fireEvent.click(screen.getByText('Save'));

      expect(onSave).toHaveBeenCalledWith([-5, -2, 1, 2, 3, 1, -1]);
    });
  });

  describe('value display formatting', () => {
    it('displays positive values with plus sign', () => {
      render(<WealthRulesPopup {...defaultProps} wealthRules={[0, 0, 5, 0, 0, 0, 0]} />);
      expect(screen.getByText('+5')).toBeInTheDocument();
    });

    it('displays negative values with minus sign', () => {
      render(<WealthRulesPopup {...defaultProps} wealthRules={[-5, 0, 0, 0, 0, 0, 0]} />);
      expect(screen.getByText('-5')).toBeInTheDocument();
    });

    it('displays zero without sign', () => {
      render(<WealthRulesPopup {...defaultProps} wealthRules={[0, 0, 0, 0, 0, 0, 0]} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });
});
