import { useState, useEffect, useCallback } from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { useTimer, type TimerPreset } from './hooks/useTimer';
import { useBattery } from './hooks/useBattery';
import { useAmbientAudio } from './hooks/useAmbientAudio';
import { AppleHeader } from './components/AppleHeader';
import { PowerCenter } from './components/PowerCenter';
import { SegmentedTimer } from './components/SegmentedTimer';
import { BatteryCard } from './components/BatteryCard';
import { AmbientAudioCard } from './components/AmbientAudioCard';
import { OledCosmicOverlay } from './components/OledCosmicOverlay';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Sparkles, Info, ShieldCheck } from 'lucide-react';
import { soundEffects } from './utils/appleChime';

export default function App() {
  const [isOledOpen, setIsOledOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Core Wake Lock Hook
  const {
    isActive,
    mode: engineMode,
    error: wakeError,
    elapsedSeconds,
    toggle: toggleWake,
    release: releaseWake,
  } = useWakeLock();

  // Timer Hook with auto-release callback
  const handleTimerExpire = useCallback(() => {
    releaseWake();
  }, [releaseWake]);

  const {
    preset,
    customMinutes,
    formattedRemaining,
    progressPercent,
    isPaused,
    setPreset,
    setCustomMinutes,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useTimer(isActive, {
    onExpire: handleTimerExpire,
    playChimeOnExpire: true,
  });

  // Battery Hook with guard auto-release callback
  const handleLowBattery = useCallback(() => {
    if (isActive) {
      releaseWake();
    }
  }, [isActive, releaseWake]);

  const {
    isSupported: isBatterySupported,
    level: batteryLevel,
    charging: isCharging,
    guardEnabled: isBatteryGuardEnabled,
    threshold: batteryThreshold,
    setGuardEnabled: setBatteryGuardEnabled,
    setThreshold: setBatteryThreshold,
  } = useBattery(handleLowBattery);

  // Ambient Audio Hook
  const {
    currentSound,
    volume: audioVolume,
    setSound: setAudioSound,
    setVolume: setAudioVolume,
    togglePlay: toggleAudioPlay,
  } = useAmbientAudio();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        soundEffects.playClick();
        toggleWake();
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        soundEffects.playClick();
        setIsOledOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        soundEffects.playClick();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        soundEffects.playClick();
        toggleAudioPlay();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const presetsMap: Record<string, TimerPreset> = {
          '1': 'indefinite',
          '2': '15m',
          '3': '30m',
          '4': '45m',
          '5': '1h',
          '6': '2h',
        };
        const p = presetsMap[e.key];
        if (p) {
          soundEffects.playClick();
          setPreset(p);
        }
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsOledOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleWake, toggleAudioPlay, setPreset]);

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col justify-between selection:bg-purple-500/30">
      {/* Background Ambient Cosmic Spotlights */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-900/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-900/15 rounded-full blur-3xl" />
      </div>

      {/* Main Content Wrap */}
      <div>
        {/* Apple Navigation Header */}
        <AppleHeader
          isWakeActive={isActive}
          engineMode={engineMode}
          onOpenOled={() => setIsOledOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Error notification banner if wake lock failed */}
        {wakeError && (
          <div className="max-w-md mx-auto mb-4 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{wakeError}</span>
          </div>
        )}

        <main className="max-w-4xl mx-auto px-4 pb-12">
          {/* Hero Tactile Power Button Center */}
          <PowerCenter
            isActive={isActive}
            onToggle={toggleWake}
            elapsedSeconds={elapsedSeconds}
          />

          {/* Quick Action Banner for OLED Cosmic Mode */}
          <div className="my-6">
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsOledOpen(true);
              }}
              className="w-full apple-glass-card hover:bg-neutral-800/40 border border-purple-500/25 hover:border-purple-400/50 rounded-3xl p-4 flex items-center justify-between group apple-pressable transition-all shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-purple-400/30 text-purple-300">
                  <Sparkles className="w-5 h-5 text-purple-300 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      OLED Cosmic Anti-Burn Engine
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Zero Burn-In
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Continuous 60fps cosmic nebulas with deep true blacks and drifting clock to protect OLED screens
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-white/80 group-hover:bg-white/20 transition-colors">
                <span>Launch</span>
                <span className="text-[10px] text-white/50 font-mono">O</span>
              </div>
            </button>
          </div>

          {/* Functional Cards Grid */}
          <div className="space-y-6">
            {/* Session Timer & Presets */}
            <SegmentedTimer
              preset={preset}
              customMinutes={customMinutes}
              formattedRemaining={formattedRemaining}
              progressPercent={progressPercent}
              isPaused={isPaused}
              isActive={isActive}
              onSetPreset={setPreset}
              onSetCustomMinutes={setCustomMinutes}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onReset={resetTimer}
            />

            {/* Twin Secondary Cards: Battery Guard & Ambient Audio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BatteryCard
                isSupported={isBatterySupported}
                level={batteryLevel}
                charging={isCharging}
                guardEnabled={isBatteryGuardEnabled}
                threshold={batteryThreshold}
                onToggleGuard={setBatteryGuardEnabled}
                onSetThreshold={setBatteryThreshold}
              />

              <AmbientAudioCard
                currentSound={currentSound}
                volume={audioVolume}
                onSelectSound={setAudioSound}
                onVolumeChange={setAudioVolume}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Apple-Style Minimalist Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-8 border-t border-white/5 text-center text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>KeepItON • 100% Client-Side Privacy • Static GitHub Pages</span>
        </div>

        <div className="flex items-center gap-4 text-white/50">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="hover:text-white transition-colors"
          >
            Hotkeys
          </button>
          <span>•</span>
          <button
            onClick={() => setIsOledOpen(true)}
            className="hover:text-white transition-colors"
          >
            OLED View
          </button>
          <span>•</span>
          <a
            href="https://github.com/p19racha/KeepItON"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>

      {/* OLED Cosmic ScreenSaver Fullscreen Overlay */}
      <OledCosmicOverlay
        isOpen={isOledOpen}
        onClose={() => setIsOledOpen(false)}
        isWakeActive={isActive}
        onToggleWake={toggleWake}
        formattedRemaining={formattedRemaining}
        isIndefinite={preset === 'indefinite'}
        elapsedSeconds={elapsedSeconds}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
