import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  color: string;
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
  hue: number;
  hueSpeed: number;
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

    // Cosmic Nebulae Centers - continuously wandering focal points
    const nebulae: NebulaCenter[] = [
      { x: width * 0.3, y: height * 0.4, radius: Math.min(width, height) * 0.45, vx: 0.35, vy: 0.25, hue: 270, hueSpeed: 0.04, pulsePhase: 0 },
      { x: width * 0.7, y: height * 0.6, radius: Math.min(width, height) * 0.5, vx: -0.28, vy: 0.3, hue: 200, hueSpeed: 0.05, pulsePhase: Math.PI * 0.5 },
      { x: width * 0.5, y: height * 0.25, radius: Math.min(width, height) * 0.4, vx: 0.2, vy: -0.22, hue: 310, hueSpeed: 0.03, pulsePhase: Math.PI },
      { x: width * 0.2, y: height * 0.75, radius: Math.min(width, height) * 0.38, vx: -0.25, vy: -0.2, hue: 170, hueSpeed: 0.06, pulsePhase: Math.PI * 1.5 },
    ];

    // Cosmic stardust particles
    const particleCount = Math.floor(Math.min(width, height) * 0.09);
    const starColors = ['#a78bfa', '#38bdf8', '#f472b6', '#818cf8', '#67e8f9', '#c084fc', '#e879f9'];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.012;

      // 1. OLED Pure Black Background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Nebulae Gradient Glows (additive screen blending)
      ctx.globalCompositeOperation = 'screen';

      for (const n of nebulae) {
        // Update positions with boundary bounce
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < width * 0.1 || n.x > width * 0.9) n.vx *= -1;
        if (n.y < height * 0.1 || n.y > height * 0.9) n.vy *= -1;

        n.hue = (n.hue + n.hueSpeed) % 360;
        n.pulsePhase += 0.015;

        // Dynamic pulsing radius
        const currentRadius = n.radius * (0.85 + Math.sin(n.pulsePhase) * 0.15);

        // Multi-stop radial gradient for ethereal nebula clouds
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, currentRadius);
        const alpha = 0.28 * intensity;

        grad.addColorStop(0, `hsla(${n.hue}, 85%, 60%, ${alpha})`);
        grad.addColorStop(0.35, `hsla(${(n.hue + 35) % 360}, 90%, 48%, ${alpha * 0.65})`);
        grad.addColorStop(0.7, `hsla(${(n.hue + 70) % 360}, 80%, 35%, ${alpha * 0.25})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Drifting Celestial Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges for perpetual drift
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.phase += p.pulseSpeed;
        const currentAlpha = (Math.sin(p.phase) * 0.35 + 0.65) * p.alpha * intensity;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
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
