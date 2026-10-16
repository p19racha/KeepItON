import React from 'react';
import { 
  BatteryCharging, 
  Battery as BatteryIcon, 
  ShieldAlert 
} from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface BatteryCardProps {
  isSupported: boolean;
  level: number;
  charging: boolean;
  guardEnabled: boolean;
  threshold: number;
  onToggleGuard: (enabled: boolean) => void;
  onSetThreshold: (thresh: number) => void;
}

export const BatteryCard: React.FC<BatteryCardProps> = ({
  isSupported,
  level,
  charging,
  guardEnabled,
  threshold,
  onToggleGuard,
  onSetThreshold,
}) => {
  const getBatteryColor = (lvl: number, isCharge: boolean) => {
    if (isCharge) return 'text-emerald-400 bg-emerald-500';
    if (lvl <= 20) return 'text-rose-400 bg-rose-500';
    if (lvl <= 40) return 'text-amber-400 bg-amber-500';
    return 'text-emerald-400 bg-emerald-500';
  };

  const colorClass = getBatteryColor(level, charging);

  return (
    <div className="apple-glass-card rounded-3xl p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-500/15 text-emerald-400">
            {charging ? (
              <BatteryCharging className="w-5 h-5 text-emerald-400" />
            ) : (
              <BatteryIcon className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white/90">Battery Guard</h3>
            <p className="text-xs text-white/50">
              {isSupported ? (charging ? 'Connected to Power' : 'Running on Battery') : 'Battery stats simulated / desktop'}
            </p>
          </div>
        </div>

        {/* Battery Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
          <span className="font-mono text-xs font-bold text-white">{level}%</span>
          {charging && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">AC</span>}
        </div>
      </div>

      {/* Battery Level Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass.split(' ')[1]}`}
          style={{ width: `${Math.max(5, level)}%` }}
        />
      </div>

      {/* iOS-Style Switch Row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-white/40" />
          <span className="text-xs text-white/80 font-medium">Auto-Off Below {threshold}%</span>
        </div>

        {/* Apple Toggle Switch */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleGuard(!guardEnabled);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            guardEnabled ? 'bg-emerald-500' : 'bg-neutral-700'
          }`}
          role="switch"
          aria-checked={guardEnabled}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              guardEnabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Threshold selector if guard enabled */}
      {guardEnabled && (
        <div className="flex items-center justify-between mt-3 text-[11px] text-white/50">
          <span>Threshold:</span>
          <div className="flex gap-1.5">
            {[10, 15, 20, 25].map((t) => (
              <button
                key={t}
                onClick={() => {
                  soundEffects.playClick();
                  onSetThreshold(t);
                }}
                className={`px-2 py-0.5 rounded-md font-mono ${
                  threshold === t
                    ? 'bg-white/20 text-white font-bold'
                    : 'hover:bg-white/10 text-white/50'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
