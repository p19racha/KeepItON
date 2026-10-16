import { useState, useEffect, useCallback } from 'react';
import { useWakeLock } from './hooks/useWakeLock';
import { useTimer, type TimerPreset } from './hooks/useTimer';
import { useBattery } from './hooks/useBattery';
import { useAmbientAudio, type AmbientSoundType } from './hooks/useAmbientAudio';
import { MinimalHeader } from './components/MinimalHeader';
import { MinimalHero } from './components/MinimalHero';
import { MinimalTimerBar } from './components/MinimalTimerBar';
import { MinimalBottomBar } from './components/MinimalBottomBar';
import { OledCosmicOverlay } from './components/OledCosmicOverlay';
import { soundEffects } from './utils/appleChime';

export default function App() {
  const [isOledOpen, setIsOledOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Core Wake Lock Hook
  const {
    isActive,
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
    setPreset,
    setCustomMinutes,
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
  } = useBattery(handleLowBattery);

  // Ambient Audio Hook
  const {
    currentSound,
    isPlaying: isAudioPlaying,
    setSound: setAudioSound,
    togglePlay: toggleAudioPlay,
  } = useAmbientAudio();

  // Cycle sound options on click
  const handleCycleSound = () => {
    const cycleMap: Record<AmbientSoundType, AmbientSoundType> = {
      none: 'brown',
      brown: 'rain',
      rain: 'white',
      white: 'none',
    };
    setAudioSound(cycleMap[currentSound]);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        handleToggleFullscreen();
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
        setIsOledOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleWake, toggleAudioPlay, setPreset]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <MinimalHeader
        isWakeActive={isActive}
        batteryLevel={batteryLevel}
        isCharging={isCharging}
        isBatterySupported={isBatterySupported}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudioPlay}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Hero & Duration Selector */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Massive Bold Centerpiece */}
        <MinimalHero
          isActive={isActive}
          onToggle={toggleWake}
          isTimed={preset !== 'indefinite'}
          formattedRemaining={formattedRemaining}
          elapsedSeconds={elapsedSeconds}
        />

        {/* Minimal Duration Selector */}
        <MinimalTimerBar
          preset={preset}
          customMinutes={customMinutes}
          onSetPreset={setPreset}
          onSetCustomMinutes={setCustomMinutes}
        />

        {/* Bottom Action Controls */}
        <MinimalBottomBar
          onOpenOled={() => setIsOledOpen(true)}
          currentSound={currentSound}
          onCycleSound={handleCycleSound}
          isBatteryGuardEnabled={isBatteryGuardEnabled}
          onToggleBatteryGuard={() => setBatteryGuardEnabled(!isBatteryGuardEnabled)}
          batteryThreshold={batteryThreshold}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 text-center text-[11px] font-bold tracking-widest text-white/20 uppercase">
        <span>SPACE TO TOGGLE • O FOR OLED • F FOR FULLSCREEN</span>
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
    </div>
  );
}
