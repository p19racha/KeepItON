import { useState, useEffect, useRef, useCallback } from 'react';

export type WakeLockMode = 'native' | 'fallback' | 'none';

export interface UseWakeLockReturn {
  isActive: boolean;
  mode: WakeLockMode;
  isSupported: boolean;
  error: string | null;
  elapsedSeconds: number;
  toggle: () => Promise<void>;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<WakeLockMode>('none');
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const videoFallbackRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wantsActiveRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  // Cleanup fallback video & stream
  const cleanupFallback = useCallback(() => {
    if (videoFallbackRef.current) {
      videoFallbackRef.current.pause();
      videoFallbackRef.current.srcObject = null;
      videoFallbackRef.current.remove();
      videoFallbackRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request fallback keep-awake via looping video stream
  const requestFallback = useCallback((): boolean => {
    try {
      cleanupFallback();

      const canvas = document.createElement('canvas');
      canvas.width = 4;
      canvas.height = 4;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 4, 4);
      }

      if ('captureStream' in canvas) {
        // @ts-expect-error captureStream is supported in HTMLCanvasElement
        const stream = canvas.captureStream(1) as MediaStream;
        streamRef.current = stream;

        const video = document.createElement('video');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.muted = true;
        video.loop = true;
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.01';
        video.style.pointerEvents = 'none';

        video.srcObject = stream;
        document.body.appendChild(video);
        videoFallbackRef.current = video;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[KeepItON] Fallback video play was prevented:', err);
          });
        }
      }
      return true;
    } catch (err) {
      console.warn('[KeepItON] Fallback initialization error:', err);
      return false;
    }
  }, [cleanupFallback]);

  // Request Native Wake Lock
  const request = useCallback(async (): Promise<boolean> => {
    wantsActiveRef.current = true;
    setError(null);

    if (isSupported) {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        sentinelRef.current = sentinel;

        sentinel.addEventListener('release', () => {
          sentinelRef.current = null;
          // If the lock was released by OS / tab switch rather than explicit user release
          if (!wantsActiveRef.current) {
            setIsActive(false);
            setMode('none');
          }
        });

        setIsActive(true);
        setMode('native');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Wake Lock request failed';
        console.warn('[KeepItON] Native Wake Lock failed, switching to fallback:', message);
        // Fallback to video loop
        const fallbackOk = requestFallback();
        if (fallbackOk) {
          setIsActive(true);
          setMode('fallback');
          setError(null);
          return true;
        } else {
          setError(message);
          setIsActive(false);
          setMode('none');
          return false;
        }
      }
    } else {
      // Direct fallback for unsupported browsers (e.g. older iOS Safari)
      const fallbackOk = requestFallback();
      if (fallbackOk) {
        setIsActive(true);
        setMode('fallback');
        return true;
      } else {
        setError('Screen Wake Lock is not supported on this browser.');
        setIsActive(false);
        setMode('none');
        return false;
      }
    }
  }, [isSupported, requestFallback]);

  // Release Wake Lock
  const release = useCallback(async (): Promise<void> => {
    wantsActiveRef.current = false;

    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch (err) {
        console.warn('[KeepItON] Error releasing wake lock sentinel:', err);
      }
      sentinelRef.current = null;
    }

    cleanupFallback();
    setIsActive(false);
    setMode('none');
  }, [cleanupFallback]);

  // Toggle
  const toggle = useCallback(async () => {
    if (isActive) {
      await release();
    } else {
      await request();
    }
  }, [isActive, release, request]);

  // Automatic re-acquisition when tab regains focus/visibility
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wantsActiveRef.current) {
        // Re-request if currently not active
        if (!sentinelRef.current) {
          await request();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [request]);

  // Session elapsed time ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
      }
      cleanupFallback();
    };
  }, [cleanupFallback]);

  return {
    isActive,
    mode,
    isSupported,
    error,
    elapsedSeconds,
    toggle,
    request,
    release,
  };
}
