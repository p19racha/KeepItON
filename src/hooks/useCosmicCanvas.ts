import { useEffect, useRef } from 'react';

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

    let hue = 0;
    // Smooth transition speed across all colors
    const speed = 0.18;

    const render = () => {
      hue = (hue + speed) % 360;

      // Full-on brightness color (100% saturation, 50% lightness)
      const lightness = 50 * intensity;
      ctx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      ctx.fillRect(0, 0, width, height);

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
