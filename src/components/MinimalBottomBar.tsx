import React from 'react';
import { Sparkles, Waves, ShieldCheck, ShieldOff } from 'lucide-react';
import type { AmbientSoundType } from '../hooks/useAmbientAudio';
import { soundEffects } from '../utils/appleChime';

interface MinimalBottomBarProps {
  onOpenOled: () => void;
  currentSound: AmbientSoundType;
  onCycleSound: () => void;
  isBatteryGuardEnabled: boolean;
  onToggleBatteryGuard: () => void;
  batteryThreshold: number;
}

export const MinimalBottomBar: React.FC<MinimalBottomBarProps> = ({
  onOpenOled,
  currentSound,
  onCycleSound,
  isBatteryGuardEnabled,
  onToggleBatteryGuard,
  batteryThreshold,
}) => {
  const soundLabelMap: Record<AmbientSoundType, string> = {
    none: 'OFF',
    brown: 'BROWN',
    rain: 'RAIN',
    white: 'WHITE',
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-3">
      {/* Bold OLED ScreenSaver Pill */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onOpenOled();
        }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-black tracking-wider uppercase apple-pressable shadow-lg shadow-purple-950/40"
        title="Launch OLED Cosmic Anti-Burn Engine (O)"
      >
        <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
        <span>OLED ANTI-BURN</span>
      </button>

      {/* Quick Sound Cycle Pill */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onCycleSound();
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black tracking-wider uppercase apple-pressable transition-all ${
          currentSound !== 'none'
            ? 'bg-indigo-950/60 border-indigo-400/50 text-indigo-300'
            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/60 hover:text-white'
        }`}
        title="Cycle Ambient Sound (M)"
      >
        <Waves className="w-4 h-4" />
        <span>NOISE: {soundLabelMap[currentSound]}</span>
      </button>

      {/* Battery Guard Quick Toggle */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onToggleBatteryGuard();
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black tracking-wider uppercase apple-pressable transition-all ${
          isBatteryGuardEnabled
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/40 hover:text-white'
        }`}
        title="Toggle Low Battery Auto-Off Guard"
      >
        {isBatteryGuardEnabled ? (
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        ) : (
          <ShieldOff className="w-4 h-4 text-white/40" />
        )}
        <span>GUARD: {isBatteryGuardEnabled ? `${batteryThreshold}%` : 'OFF'}</span>
      </button>
    </div>
  );
};
