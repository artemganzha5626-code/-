'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion, useIsDesktop } from '@/lib/hooks';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

/**
 * Дуже делікатний ефект за курсором: мʼяке кавове свічення + рідкі
 * дрібні «кавові» частинки. Лише на десктопі з мишею; вимикається
 * за prefers-reduced-motion, щоб не заважати й не навантажувати пристрій.
 */
export function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const enabled = isDesktop && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas || !glow) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    const pointer = { x: -100, y: -100, gx: -100, gy: -100 };
    let last = { x: -100, y: -100 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const dx = pointer.x - last.x;
      const dy = pointer.y - last.y;
      const speed = Math.hypot(dx, dy);
      // Емітуємо частинку лише за помітного руху — ефект залишається ненавʼязливим.
      if (speed > 6 && particles.length < 40) {
        particles.push({
          x: pointer.x,
          y: pointer.y,
          vx: -dx * 0.03 + (Math.random() - 0.5) * 0.3,
          vy: -dy * 0.03 + (Math.random() - 0.5) * 0.3 - 0.15,
          life: 1,
          size: 1.5 + Math.random() * 2,
        });
      }
      last = { x: pointer.x, y: pointer.y };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      // Мʼяке свічення тягнеться за курсором із інерцією.
      pointer.gx += (pointer.x - pointer.gx) * 0.12;
      pointer.gy += (pointer.y - pointer.gy) * 0.12;
      glow.style.transform = `translate3d(${pointer.gx - 160}px, ${pointer.gy - 160}px, 0)`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        const radius = Math.max(0, p.size * p.life);
        if (radius <= 0) continue;
        ctx.beginPath();
        ctx.fillStyle = `rgba(111, 88, 68, ${Math.max(0, p.life * 0.35)})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[320px] w-[320px] rounded-full opacity-70 blur-3xl will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(181,97,63,0.16) 0%, rgba(111,88,68,0.10) 40%, rgba(111,88,68,0) 70%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
