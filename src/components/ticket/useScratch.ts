import { useEffect, useRef } from 'react';
import { Project } from '../../content/types';
import { drawFoil } from './foil';

interface UseScratchOptions {
  project: Project;
  isRevealed: boolean;
  isLocked: boolean;
  onReveal: (id: string) => void;
}

export function useScratch({
  project,
  isRevealed,
  isLocked,
  onReveal,
}: UseScratchOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastSampleTimeRef = useRef(0);
  const isFadingRef = useRef(false);

  useEffect(() => {
    // If already revealed or locked, no active canvas scratch needed
    if (isRevealed || isLocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const initFoil = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      drawFoil(ctx, canvas.width, canvas.height, project, dpr);
    };

    initFoil();

    // Redraw on resize if unrevealed
    const resizeObserver = new ResizeObserver(() => {
      if (!isFadingRef.current) {
        initFoil();
      }
    });

    resizeObserver.observe(canvas);

    const checkProgress = () => {
      if (isFadingRef.current) return;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const step = Math.max(1, Math.round(8 * dpr));
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      let transparentSamples = 0;
      let totalSamples = 0;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const alphaIndex = (y * w + x) * 4 + 3;
          if (data[alphaIndex] < 128) {
            transparentSamples++;
          }
          totalSamples++;
        }
      }

      const ratio = totalSamples > 0 ? transparentSamples / totalSamples : 0;

      if (ratio >= 0.55) {
        isFadingRef.current = true;
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        if (prefersReducedMotion) {
          onReveal(project.id);
        } else {
          canvas.style.transition = 'opacity 250ms ease-out';
          canvas.style.opacity = '0';
          setTimeout(() => {
            onReveal(project.id);
          }, 250);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isFadingRef.current || e.button !== 0) return;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture safeguard
      }
      isScratchingRef.current = true;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;

      lastPointRef.current = { x, y };

      // Initial dot
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 11 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      lastSampleTimeRef.current = performance.now();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isScratchingRef.current || isFadingRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;

      const prev = lastPointRef.current || { x, y };

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 22 * dpr;

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();

      lastPointRef.current = { x, y };

      const now = performance.now();
      if (now - lastSampleTimeRef.current >= 120) {
        lastSampleTimeRef.current = now;
        checkProgress();
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isScratchingRef.current) return;
      isScratchingRef.current = false;
      lastPointRef.current = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture release safeguard
      }
      checkProgress();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [project, isRevealed, isLocked, onReveal]);

  return canvasRef;
}

