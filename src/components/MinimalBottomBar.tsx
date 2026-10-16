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
      {/* Bold Monochrome OLED Anti-Burn Pill */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onOpenOled();
        }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white text-xs font-black tracking-wider uppercase apple-pressable transition-colors"
        title="Launch OLED Anti-Burn Engine (O)"
      >
        <Sparkles className="w-4 h-4 text-white" />
        <span>OLED ANTI-BURN</span>
      </button>

      {/* Monochrome Sound Cycle Pill */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onCycleSound();
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black tracking-wider uppercase apple-pressable transition-all ${
          currentSound !== 'none'
            ? 'bg-white text-black border-white'
            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/60 hover:text-white'
        }`}
        title="Cycle Ambient Sound (M)"
      >
        <Waves className="w-4 h-4" />
        <span>NOISE: {soundLabelMap[currentSound]}</span>
      </button>

      {/* Monochrome Battery Guard Toggle */}
      <button
        onClick={() => {
          soundEffects.playClick();
          onToggleBatteryGuard();
        }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black tracking-wider uppercase apple-pressable transition-all ${
          isBatteryGuardEnabled
            ? 'bg-white/15 border-white/30 text-white'
            : 'bg-white/5 border-white/10 hover:border-white/20 text-white/40 hover:text-white'
        }`}
        title="Toggle Low Battery Auto-Off Guard"
      >
        {isBatteryGuardEnabled ? (
          <ShieldCheck className="w-4 h-4 text-white" />
        ) : (
          <ShieldOff className="w-4 h-4 text-white/40" />
        )}
        <span>GUARD: {isBatteryGuardEnabled ? `${batteryThreshold}%` : 'OFF'}</span>
      </button>
    </div>
  );
};
