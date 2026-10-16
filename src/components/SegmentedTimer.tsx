import React, { useState } from 'react';
import type { TimerPreset } from '../hooks/useTimer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Sliders 
} from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface SegmentedTimerProps {
  preset: TimerPreset;
  customMinutes: number;
  formattedRemaining: string;
  progressPercent: number;
  isPaused: boolean;
  isActive: boolean;
  onSetPreset: (preset: TimerPreset) => void;
  onSetCustomMinutes: (mins: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const SegmentedTimer: React.FC<SegmentedTimerProps> = ({
  preset,
  customMinutes,
  formattedRemaining,
  progressPercent,
  isPaused,
  isActive,
  onSetPreset,
  onSetCustomMinutes,
  onPause,
  onResume,
  onReset,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState(customMinutes.toString());

  const presets: { id: TimerPreset; label: string }[] = [
    { id: 'indefinite', label: 'Always ON' },
    { id: '15m', label: '15m' },
    { id: '30m', label: '30m' },
    { id: '45m', label: '45m' },
    { id: '1h', label: '1h' },
    { id: '2h', label: '2h' },
    { id: 'custom', label: preset === 'custom' ? `${customMinutes}m` : 'Custom' },
  ];

  const handleSelectPreset = (p: TimerPreset) => {
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

  const isTimed = preset !== 'indefinite';

  // SVG circular gauge calculation
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="apple-glass-card rounded-3xl p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white/90">Sleep Timer</h3>
            <p className="text-xs text-white/50">Automatically releases wake lock when time ends</p>
          </div>
        </div>

        {preset === 'custom' && (
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 apple-pressable"
          >
            <Sliders className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Cupertino Sliding Segmented Control Bar */}
      <div className="p-1 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {presets.map((item) => {
          const isSelected = preset === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectPreset(item.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 apple-pressable ${
                isSelected
                  ? 'bg-neutral-800 text-white shadow-md border border-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Timed Session Circular Progress & Controls */}
      {isTimed && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
          {/* Circular Countdown Ring */}
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90 transform">
              {/* Background Ring */}
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="7"
                className="text-white/10"
                fill="transparent"
              />
              {/* Progress Ring */}
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-amber-400 transition-all duration-500 ease-linear"
                fill="transparent"
              />
            </svg>

            {/* Inner Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono tracking-tight text-white">
                {formattedRemaining}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/50">
                {isPaused ? 'Paused' : isActive ? 'Remaining' : 'Preset'}
              </span>
            </div>
          </div>

          {/* Details & Controls */}
          <div className="flex-1 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
            <h4 className="text-sm font-medium text-white/90">
              {isActive ? (isPaused ? 'Timer Paused' : 'Keep-Awake Active with Timer') : 'Timer Armed'}
            </h4>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              When the countdown reaches zero, the screen lock will release with an Apple chime.
            </p>

            {/* Controls */}
            {isActive && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    if (isPaused) {
                      onResume();
                    } else {
                      onPause();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold apple-pressable"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    onReset();
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white apple-pressable"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Duration Popover / Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="apple-glass-card rounded-3xl p-6 w-full max-w-sm border border-white/20 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Custom Duration</h3>
            <p className="text-xs text-white/60 mt-1">
              Enter how many minutes you want your screen to remain awake:
            </p>

            <form onSubmit={handleSaveCustom} className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-base focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <span className="text-sm text-white/70 font-medium">Minutes</span>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10 apple-pressable"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black apple-pressable shadow-lg shadow-amber-500/20"
                >
                  Set Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
