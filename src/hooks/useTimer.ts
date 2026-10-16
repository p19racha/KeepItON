import { useState, useEffect, useRef, useCallback } from 'react';
import { soundEffects } from '../utils/appleChime';

export type TimerPreset = 'indefinite' | '15m' | '30m' | '45m' | '1h' | '2h' | 'custom';

export const PRESET_SECONDS: Record<Exclude<TimerPreset, 'custom'>, number> = {
  indefinite: 0,
  '15m': 15 * 60,
  '30m': 30 * 60,
  '45m': 45 * 60,
  '1h': 60 * 60,
  '2h': 120 * 60,
};

export interface UseTimerOptions {
  onExpire?: () => void;
  playChimeOnExpire?: boolean;
}

export interface UseTimerReturn {
  preset: TimerPreset;
  customMinutes: number;
  totalDurationSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  progressPercent: number;
  formattedRemaining: string;
  setPreset: (preset: TimerPreset) => void;
  setCustomMinutes: (mins: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

export function useTimer(isActive: boolean, options: UseTimerOptions = {}): UseTimerReturn {
  const { onExpire, playChimeOnExpire = true } = options;

  const [preset, setPresetState] = useState<TimerPreset>('indefinite');
  const [customMinutes, setCustomMinutesState] = useState<number>(25);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const playChimeRef = useRef(playChimeOnExpire);
  playChimeRef.current = playChimeOnExpire;

  // Calculate duration from preset
  const getDurationForPreset = useCallback((p: TimerPreset, customM: number): number => {
    if (p === 'custom') {
      return Math.max(1, customM) * 60;
    }
    return PRESET_SECONDS[p];
  }, []);

  // Update preset
  const setPreset = useCallback((newPreset: TimerPreset) => {
    setPresetState(newPreset);
    const duration = getDurationForPreset(newPreset, customMinutes);
    setTotalDurationSeconds(duration);
    setRemainingSeconds(duration);
    setIsPaused(false);
  }, [customMinutes, getDurationForPreset]);

  // Update custom minutes
  const setCustomMinutes = useCallback((mins: number) => {
    const valid = Math.max(1, Math.min(1440, mins));
    setCustomMinutesState(valid);
    if (preset === 'custom') {
      const duration = valid * 60;
      setTotalDurationSeconds(duration);
      setRemainingSeconds(duration);
    }
  }, [preset]);

  // Reset timer to current preset initial duration
  const resetTimer = useCallback(() => {
    const duration = getDurationForPreset(preset, customMinutes);
    setTotalDurationSeconds(duration);
    setRemainingSeconds(duration);
    setIsPaused(false);
  }, [customMinutes, getDurationForPreset, preset]);

  // Start timer from initial duration
  const startTimer = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  // When active changes from false -> true, initialize remaining seconds if non-indefinite
  useEffect(() => {
    if (isActive) {
      const duration = getDurationForPreset(preset, customMinutes);
      setTotalDurationSeconds(duration);
      setRemainingSeconds(duration);
      setIsPaused(false);
    }
  }, [isActive, preset, customMinutes, getDurationForPreset]);

  // Tick timer
  useEffect(() => {
    if (!isActive || isPaused || preset === 'indefinite' || totalDurationSeconds === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (playChimeRef.current) {
            soundEffects.playCompletionChime();
          }
          if (onExpireRef.current) {
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused, preset, totalDurationSeconds]);

  // Formatted remaining string (HH:MM:SS or MM:SS)
  const formatTime = (seconds: number): string => {
    if (preset === 'indefinite') return 'Always ON';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const progressPercent = totalDurationSeconds > 0 && preset !== 'indefinite'
    ? Math.max(0, Math.min(100, ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
    : 0;

  return {
    preset,
    customMinutes,
    totalDurationSeconds,
    remainingSeconds,
    isPaused,
    progressPercent,
    formattedRemaining: formatTime(remainingSeconds),
    setPreset,
    setCustomMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
}
