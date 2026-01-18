import { useState } from 'react';
import { WealthRules } from '../types';
import { defaultWealthRules } from '../gameLogic';

interface WealthRulesPopupProps {
  wealthRules: WealthRules;
  onSave: (wealthRules: WealthRules) => void;
  onClose: () => void;
}

export function WealthRulesPopup({ wealthRules, onSave, onClose }: WealthRulesPopupProps) {
  const [localRules, setLocalRules] = useState<WealthRules>([...wealthRules]);

  const handleChange = (index: number, value: number) => {
    setLocalRules(prev => {
      const newRules = [...prev];
      newRules[index] = value;
      return newRules;
    });
  };

  const handleSave = () => {
    onSave(localRules);
    onClose();
  };

  const handleReset = () => {
    setLocalRules([...defaultWealthRules]);
  };

  const presets = {
    classic: {
      name: 'Classic',
      rules: [-5, -3, 3, 5, -2, -4, -5],
      description: 'Survives best with 2-3 neighbors',
    },
    stable: {
      name: 'Stable',
      rules: [-2, 0, 2, 2, 0, -1, -2],
      description: 'Slow, stable growth',
    },
    volatile: {
      name: 'Volatile',
      rules: [-10, -5, 5, 10, -3, -6, -10],
      description: 'High risk, high reward',
    },
    social: {
      name: 'Social',
      rules: [-5, -2, 1, 2, 3, 1, -1],
      description: 'Benefits from more neighbors',
    },
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={e => e.stopPropagation()}>
        <h2>Wealth Rules</h2>
        <p className="popup-info">
          Each cell has a wealth value. Based on its neighbor count, wealth increases (profit)
          or decreases (cost) each generation. If wealth drops to 0 or below, the cell dies.
          New cells are born in positions where profit would be positive.
        </p>

        <div className="presets">
          <label>Presets:</label>
          <div className="preset-buttons">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                className="btn btn-small"
                onClick={() => setLocalRules([...preset.rules])}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="prob-table single">
          <h3>Profit/Cost per Neighbor Count</h3>
          <p className="table-info">Positive = profit, Negative = cost</p>
          <table>
            <thead>
              <tr>
                <th>Neighbors</th>
                <th>Wealth Change</th>
              </tr>
            </thead>
            <tbody>
              {localRules.map((rule, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={rule}
                      onChange={e => handleChange(i, Number(e.target.value))}
                    />
                    <span
                      className="prob-value"
                      style={{ color: rule > 0 ? '#4ade80' : rule < 0 ? '#ef4444' : '#94a3b8' }}
                    >
                      {rule > 0 ? `+${rule}` : rule}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="popup-actions">
          <button onClick={handleReset} className="btn btn-secondary">
            Reset to Default
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
