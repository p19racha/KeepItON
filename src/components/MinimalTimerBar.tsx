import React, { useState } from 'react';
import type { TimerPreset } from '../hooks/useTimer';
import { soundEffects } from '../utils/appleChime';

interface MinimalTimerBarProps {
  preset: TimerPreset;
  customMinutes: number;
  onSetPreset: (preset: TimerPreset) => void;
  onSetCustomMinutes: (mins: number) => void;
}

export const MinimalTimerBar: React.FC<MinimalTimerBarProps> = ({
  preset,
  customMinutes,
  onSetPreset,
  onSetCustomMinutes,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState(customMinutes.toString());

  const presets: { id: TimerPreset; label: string }[] = [
    { id: 'indefinite', label: '∞' },
    { id: '15m', label: '15M' },
    { id: '30m', label: '30M' },
    { id: '45m', label: '45M' },
    { id: '1h', label: '1H' },
    { id: '2h', label: '2H' },
    { id: 'custom', label: preset === 'custom' ? `${customMinutes}M` : 'CUSTOM' },
  ];

  const handleSelect = (p: TimerPreset) => {
    soundEffects.playClick();
    if (p === 'custom') {
      setShowCustomModal(true);
    }
    onSetPreset(p);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0) {
      onSetCustomMinutes(val);
      onSetPreset('custom');
      setShowCustomModal(false);
      soundEffects.playClick();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 my-4">
      {/* Sleek Segmented Pill Container */}
      <div className="p-1 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-between gap-1">
        {presets.map((item) => {
          const isSelected = preset === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex-1 py-2 px-2 rounded-full text-xs sm:text-sm font-black tracking-wider transition-all duration-150 apple-pressable text-center ${
                isSelected
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Minimal Custom Duration Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-neutral-950 border border-white/20 rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl">
            <h3 className="text-sm font-black tracking-wider uppercase text-white mb-4">
              CUSTOM DURATION
            </h3>

            <form onSubmit={handleSaveCustom}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-24 bg-black border-2 border-white/30 focus:border-white rounded-xl py-2 text-center text-white font-mono font-black text-2xl focus:outline-none"
                  autoFocus
                />
                <span className="text-xs font-bold font-mono text-white/60 uppercase">MIN</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white apple-pressable"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-white hover:bg-neutral-200 text-black apple-pressable"
                >
                  SET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
