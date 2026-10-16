import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
}

interface NebulaCenter {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hueOffset: number;
  pulsePhase: number;
}

export function useCosmicCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, intensity: number = 1.0) {
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 5 wandering celestial focal points distributed harmonically across the spectrum
    const nebulae: NebulaCenter[] = [
      { x: width * 0.25, y: height * 0.35, radius: Math.min(width, height) * 0.45, vx: 0.25, vy: 0.18, hueOffset: 0, pulsePhase: 0 },
      { x: width * 0.75, y: height * 0.65, radius: Math.min(width, height) * 0.48, vx: -0.22, vy: 0.22, hueOffset: 72, pulsePhase: Math.PI * 0.4 },
      { x: width * 0.5, y: height * 0.2, radius: Math.min(width, height) * 0.42, vx: 0.18, vy: -0.2, hueOffset: 144, pulsePhase: Math.PI * 0.8 },
      { x: width * 0.2, y: height * 0.8, radius: Math.min(width, height) * 0.4, vx: -0.2, vy: -0.16, hueOffset: 216, pulsePhase: Math.PI * 1.2 },
      { x: width * 0.8, y: height * 0.3, radius: Math.min(width, height) * 0.44, vx: 0.15, vy: 0.24, hueOffset: 288, pulsePhase: Math.PI * 1.6 },
    ];

    // Drifting stardust particles with continuous color transmutation
    const particleCount = Math.floor(Math.min(width, height) * 0.09);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        hue: Math.random() * 360,
        alpha: Math.random() * 0.65 + 0.25,
        pulseSpeed: Math.random() * 0.015 + 0.006,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let baseHue = 0;

    const render = () => {
      // Buttery smooth continuous spectrum cycle across literally all colors
      baseHue = (baseHue + 0.06) % 360;

      // 1. OLED Pure Black Background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 2. Continuous Full-Spectrum Color Transmutation (additive screen blending)
      ctx.globalCompositeOperation = 'screen';

      for (const n of nebulae) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < width * 0.08 || n.x > width * 0.92) n.vx *= -1;
        if (n.y < height * 0.08 || n.y > height * 0.92) n.vy *= -1;

        n.pulsePhase += 0.01;
        const currentRadius = n.radius * (0.88 + Math.sin(n.pulsePhase) * 0.12);
        const currentHue = (baseHue + n.hueOffset) % 360;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, currentRadius);
        const alpha = 0.26 * intensity;

        // Smooth multi-stop transition across neighboring spectral hues
        grad.addColorStop(0, `hsla(${currentHue}, 90%, 55%, ${alpha})`);
        grad.addColorStop(0.35, `hsla(${(currentHue + 40) % 360}, 85%, 45%, ${alpha * 0.68})`);
        grad.addColorStop(0.7, `hsla(${(currentHue + 80) % 360}, 80%, 35%, ${alpha * 0.25})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Stardust particles smoothly cycling through all colors
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.hue = (p.hue + 0.12) % 360;
        p.phase += p.pulseSpeed;
        const currentAlpha = (Math.sin(p.phase) * 0.3 + 0.7) * p.alpha * intensity;

        ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [canvasRef, intensity]);
}
