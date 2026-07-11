'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

interface Bean {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  spin: number;
}

/**
 * Розсипані кавові зерна на canvas + м’яке «прожекторне» світло (spotlight),
 * що йде за курсором. Зерна відштовхуються від вказівника і плавно
 * повертаються на місце. Вимикає взаємодію за prefers-reduced-motion.
 */
export function CoffeeBeansSpotlight() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const spot = spotRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let beans: Bean[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.max(48, Math.min(120, Math.floor((w * h) / 10000)));
      beans = Array.from({ length: density }).map(() => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          ox: x,
          oy: y,
          x,
          y,
          vx: 0,
          vy: 0,
          r: 6 + Math.random() * 7,
          angle: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.003,
        };
      });
    };

    const drawBean = (b: Bean) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      const grad = ctx.createLinearGradient(-b.r, -b.r, b.r, b.r);
      grad.addColorStop(0, '#8a5632');
      grad.addColorStop(1, '#43281699');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.r, b.r * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(28,16,8,0.65)';
      ctx.lineWidth = Math.max(1, b.r * 0.16);
      ctx.beginPath();
      ctx.moveTo(0, -b.r * 1.25);
      ctx.quadraticCurveTo(b.r * 0.55, 0, 0, b.r * 1.25);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (const b of beans) {
        b.angle += b.spin;
        if (pointer.active && !reduced) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          const R = 140;
          if (dist < R && dist > 0.01) {
            const force = (1 - dist / R) * 3.4;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
            b.angle += 0.03;
          }
        }
        b.vx += (b.ox - b.x) * 0.012;
        b.vy += (b.oy - b.y) * 0.012;
        b.vx *= 0.85;
        b.vy *= 0.85;
        b.x += b.vx;
        b.y += b.vy;
        drawBean(b);
      }
      raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;
      pointer.active = x >= 0 && x <= w && y >= 0 && y <= h;
      if (spot) {
        spot.style.opacity = pointer.active ? '1' : '0';
        spot.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
      }
    };

    build();
    window.addEventListener('resize', build);
    window.addEventListener('pointermove', onMove, { passive: true });

    if (reduced) {
      ctx.clearRect(0, 0, w, h);
      for (const b of beans) drawBean(b);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={spotRef}
        className="pointer-events-none absolute left-0 top-0 h-[520px] w-[520px] rounded-full opacity-0 blur-2xl transition-opacity duration-500 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(243,217,166,0.30) 0%, rgba(221,164,91,0.15) 40%, rgba(0,0,0,0) 70%)',
        }}
      />
    </div>
  );
}
