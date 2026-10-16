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

    // Wandering focal points for monochrome nebulae
    const nebulae: NebulaCenter[] = [
      { x: width * 0.3, y: height * 0.4, radius: Math.min(width, height) * 0.45, vx: 0.3, vy: 0.2, pulsePhase: 0 },
      { x: width * 0.7, y: height * 0.6, radius: Math.min(width, height) * 0.5, vx: -0.25, vy: 0.25, pulsePhase: Math.PI * 0.5 },
      { x: width * 0.5, y: height * 0.25, radius: Math.min(width, height) * 0.4, vx: 0.18, vy: -0.2, pulsePhase: Math.PI },
      { x: width * 0.2, y: height * 0.75, radius: Math.min(width, height) * 0.38, vx: -0.22, vy: -0.18, pulsePhase: Math.PI * 1.5 },
    ];

    // Monochrome celestial stardust
    const particleCount = Math.floor(Math.min(width, height) * 0.08);
    const starColors = ['#ffffff', '#f5f5f7', '#e5e5ea', '#d1d1d6', '#c7c7cc'];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.0 + 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      // 1. OLED Pure Black Background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 2. Monochrome Ethereal Glows
      ctx.globalCompositeOperation = 'screen';

      for (const n of nebulae) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < width * 0.1 || n.x > width * 0.9) n.vx *= -1;
        if (n.y < height * 0.1 || n.y > height * 0.9) n.vy *= -1;

        n.pulsePhase += 0.012;
        const currentRadius = n.radius * (0.88 + Math.sin(n.pulsePhase) * 0.12);

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, currentRadius);
        const alpha = 0.2 * intensity;

        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.35, `rgba(210, 210, 215, ${alpha * 0.6})`);
        grad.addColorStop(0.7, `rgba(130, 130, 135, ${alpha * 0.2})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Monochrome Drifting Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.phase += p.pulseSpeed;
        const currentAlpha = (Math.sin(p.phase) * 0.3 + 0.7) * p.alpha * intensity;

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
