import React, { useState, useEffect, useRef } from 'react';
import { useCosmicCanvas } from '../hooks/useCosmicCanvas';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Zap, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface OledCosmicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isWakeActive: boolean;
  onToggleWake: () => void;
  formattedRemaining: string;
  isIndefinite: boolean;
  elapsedSeconds: number;
}

export const OledCosmicOverlay: React.FC<OledCosmicOverlayProps> = ({
  isOpen,
  onClose,
  isWakeActive,
  onToggleWake,
  formattedRemaining,
  isIndefinite,
  elapsedSeconds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [intensity, setIntensity] = useState<number>(0.85);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Anti-burn-in continuous slow coordinate drift
  const [driftOffset, setDriftOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize canvas animation
  useCosmicCanvas(canvasRef, isOpen ? intensity : 0);

  // Time & date clock tick
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Organic slow drift calculation (Lissajous curve drift)
      const t = now.getTime() * 0.00015;
      const dx = Math.sin(t) * 35 + Math.cos(t * 0.6) * 15;
      const dy = Math.cos(t * 0.8) * 25 + Math.sin(t * 0.4) * 10;
      setDriftOffset({ x: dx, y: dy });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls after inactivity
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  useEffect(() => {
    if (!isOpen) return;
    resetHideTimer();
    const handleMove = () => resetHideTimer();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        soundEffects.playClick();
        onToggleWake();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggleWake]);

  const toggleFullscreen = async () => {
    soundEffects.playClick();
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  if (!isOpen) return null;

  // Format active elapsed time
  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const dateFormatted = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black select-none overflow-hidden cursor-default">
      {/* 60fps OLED Anti-Burn-In Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ filter: `brightness(${intensity})` }}
      />

      {/* Auto-Hiding Apple Frosted Glass Top Toolbar */}
      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full apple-glass transition-all duration-500 z-10 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-xs font-medium text-white/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OLED Anti-Burn Protection</span>
        </div>

        {/* Wake Lock Toggle */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleWake();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold apple-pressable transition-all ${
            isWakeActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
          title="Toggle Keep-Awake"
        >
          <Zap className={`w-3.5 h-3.5 ${isWakeActive ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          {isWakeActive ? 'Awake' : 'Sleeping'}
        </button>

        {/* Dimming Brightness Slider */}
        <div className="flex items-center gap-2 px-2 text-white/70 text-xs">
          <Sun className="w-3.5 h-3.5 text-white/60" />
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-20 accent-purple-500 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
            title="Cosmic Brightness / Dimmer"
          />
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full hover:bg-white/15 text-white/70 hover:text-white apple-pressable transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Close / Return Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium apple-pressable transition-all"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Floating Organically-Drifting Ambient Clock & HUD */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${driftOffset.x}px, ${driftOffset.y}px)`,
        }}
      >
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass-pill mb-6 text-sm text-white/90 shadow-2xl backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            {isWakeActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isWakeActive ? 'bg-emerald-500' : 'bg-white/40'
              }`}
            ></span>
          </span>
          <span className="font-medium tracking-wide">
            {isWakeActive ? 'Screen Kept Awake' : 'Standby Mode'}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/70 font-mono text-xs">
            {isIndefinite ? `Active: ${formatElapsed(elapsedSeconds)}` : `Left: ${formattedRemaining}`}
          </span>
        </div>

        {/* Large Apple SF Pro Display Clock */}
        <div className="flex items-baseline font-light tracking-tight text-white drop-shadow-2xl">
          <span className="text-7xl sm:text-9xl font-extralight tracking-tighter">
            {hours}:{minutes}
          </span>
          <span className="text-3xl sm:text-5xl font-thin text-white/50 ml-2 font-mono">
            {seconds}
          </span>
        </div>

        {/* Calendar Date Display */}
        <div className="mt-3 text-lg sm:text-2xl font-light text-white/75 tracking-wider uppercase">
          {dateFormatted}
        </div>

        {/* Subtle OLED anti-burn indicator hint */}
        <div
          className={`mt-10 flex items-center gap-2 text-xs text-white/40 tracking-wider transition-opacity duration-500 ${
            showControls ? 'opacity-70' : 'opacity-0'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pixel Shifter Active • Move cursor for controls</span>
        </div>
      </div>
    </div>
  );
};
