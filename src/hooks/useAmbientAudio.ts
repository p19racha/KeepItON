import { useState, useRef, useCallback, useEffect } from 'react';

export type AmbientSoundType = 'none' | 'brown' | 'rain' | 'white';

export interface UseAmbientAudioReturn {
  currentSound: AmbientSoundType;
  volume: number;
  isPlaying: boolean;
  setSound: (sound: AmbientSoundType) => void;
  setVolume: (vol: number) => void;
  togglePlay: () => void;
}

export function useAmbientAudio(): UseAmbientAudioReturn {
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolumeState] = useState<number>(0.35);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const rainFilterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const stopCurrentSound = useCallback(() => {
    if (rainFilterIntervalRef.current) {
      clearInterval(rainFilterIntervalRef.current);
      rainFilterIntervalRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        if ('stop' in sourceNodeRef.current && typeof sourceNodeRef.current.stop === 'function') {
          sourceNodeRef.current.stop();
        }
        sourceNodeRef.current.disconnect();
      } catch (err) {
        console.warn('Error disconnecting audio node:', err);
      }
      sourceNodeRef.current = null;
    }
  }, []);

  const startSound = useCallback((type: AmbientSoundType, targetVol: number) => {
    stopCurrentSound();

    if (type === 'none') {
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    // Create / ensure gain node
    if (!gainNodeRef.current) {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(targetVol, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
    } else {
      gainNodeRef.current.gain.setValueAtTime(targetVol, ctx.currentTime);
    }

    // 5-second procedural audio buffer
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'brown') {
      // Brown noise integration
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    } else if (type === 'rain') {
      // Soft gentle rain simulation
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.05 * white) / 1.05;
        // occasional raindrop transient
        const drop = Math.random() > 0.9995 ? (Math.random() - 0.5) * 1.5 : 0;
        data[i] = lastOut * 2.2 + drop;
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter node for warmth
    const filter = ctx.createBiquadFilter();
    if (type === 'brown') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);
    } else if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      // Subtle atmospheric modulation
      rainFilterIntervalRef.current = setInterval(() => {
        if (ctx && filter) {
          const modFreq = 900 + Math.random() * 600;
          filter.frequency.setTargetAtTime(modFreq, ctx.currentTime, 0.5);
        }
      }, 700);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4500, ctx.currentTime);
    }

    noiseSource.connect(filter);
    filter.connect(gainNodeRef.current);
    noiseSource.start();
    sourceNodeRef.current = noiseSource;
  }, [stopCurrentSound]);

  const setSound = useCallback((sound: AmbientSoundType) => {
    setCurrentSound(sound);
    startSound(sound, volume);
  }, [startSound, volume]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (currentSound === 'none') {
      setSound('brown');
    } else {
      setSound('none');
    }
  }, [currentSound, setSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopCurrentSound]);

  return {
    currentSound,
    volume,
    isPlaying: currentSound !== 'none',
    setSound,
    setVolume,
    togglePlay,
  };
}
