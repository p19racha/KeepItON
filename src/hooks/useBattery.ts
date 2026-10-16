import { useState, useEffect, useCallback, useRef } from 'react';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

export interface UseBatteryReturn {
  isSupported: boolean;
  level: number; // 0 to 100
  charging: boolean;
  guardEnabled: boolean;
  threshold: number; // e.g. 20%
  setGuardEnabled: (enabled: boolean) => void;
  setThreshold: (threshold: number) => void;
}

export function useBattery(onLowBattery?: () => void): UseBatteryReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(100);
  const [charging, setCharging] = useState<boolean>(true);
  const [guardEnabled, setGuardEnabled] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(20);

  const onLowBatteryRef = useRef(onLowBattery);
  onLowBatteryRef.current = onLowBattery;

  const checkThreshold = useCallback((currentLevel: number, isCharging: boolean, guard: boolean, thresh: number) => {
    if (guard && !isCharging && currentLevel <= thresh) {
      if (onLowBatteryRef.current) {
        onLowBatteryRef.current();
      }
    }
  }, []);

  useEffect(() => {
    let batteryInstance: BatteryManager | null = null;

    interface NavigatorWithBattery extends Navigator {
      getBattery?: () => Promise<BatteryManager>;
    }

    const nav = navigator as NavigatorWithBattery;

    if (typeof nav !== 'undefined' && typeof nav.getBattery === 'function') {
      nav.getBattery().then((battery) => {
        batteryInstance = battery;
        setIsSupported(true);

        const updateBatteryInfo = () => {
          const lvl = Math.round(battery.level * 100);
          setLevel(lvl);
          setCharging(battery.charging);
          checkThreshold(lvl, battery.charging, guardEnabled, threshold);
        };

        updateBatteryInfo();

        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
      }).catch((err) => {
        console.warn('[KeepItON] Battery API access denied or failed:', err);
        setIsSupported(false);
      });
    } else {
      setIsSupported(false);
    }

    return () => {
      if (batteryInstance) {
        // Event listeners cleaned up automatically with object reference
      }
    };
  }, [checkThreshold, guardEnabled, threshold]);

  return {
    isSupported,
    level,
    charging,
    guardEnabled,
    threshold,
    setGuardEnabled,
    setThreshold,
  };
}
