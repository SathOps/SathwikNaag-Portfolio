'use client';
import { useEffect, useRef } from 'react';

/** Slow-drifting nodes joined by faint lines, like a neural network. Canvas, pauses when hidden. */
function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0;
    type N = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: N[] = [];
    const resize = () => {
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (W * H) / 16000));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.6,
      }));
    };
    let mx = -9999, my = -9999;
    const mv = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const LINK = 150;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of nodes) {
        if (!reduce) { p.x += p.vx; p.y += p.vy; }
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(96,165,250,${(1 - d / LINK) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mx, a.y - my);
        const near = md < 180 ? 1 - md / 180 : 0;
        if (near > 0) {
          ctx.strokeStyle = `rgba(124,196,255,${near * 0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
        }
        ctx.fillStyle = `rgba(147,197,253,${0.35 + near * 0.6})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r + near * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = () => { if (!document.hidden) draw(); raf = requestAnimationFrame(loop); };
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', mv, { passive: true });
    if (reduce) draw(); else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', mv); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 [mask-image:radial-gradient(ellipse_90%_80%_at_50%_40%,#000_35%,transparent_90%)]" />;
}

/** Fixed, animated backdrop for the Tech world: drifting light orbs, a neural-network constellation, grain and a cursor spotlight. */
export default function TechBackground() {
  const spot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = innerWidth / 2,
      y = innerHeight / 3,
      cx = x,
      cy = y,
      raf = 0;
    const mv = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const loop = () => {
      cx += (x - cx) * 0.08;
      cy += (y - cy) * 0.08;
      if (spot.current) spot.current.style.background = `radial-gradient(600px circle at ${cx}px ${cy}px, rgba(59,130,246,.10), transparent 60%)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', mv, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener('pointermove', mv);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden bg-[#04050a]">
      {/* aurora orbs */}
      <div className="tech-orb absolute -left-[10%] -top-[15%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,.38),transparent)]" style={{ animationDuration: '26s' }} />
      <div className="tech-orb absolute -right-[15%] top-[20%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,.26),transparent)]" style={{ animationDuration: '32s', animationDelay: '-8s' }} />
      <div className="tech-orb absolute -bottom-[25%] left-[20%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(14,165,233,.20),transparent)]" style={{ animationDuration: '38s', animationDelay: '-15s' }} />
      {/* drifting neural-network constellation */}
      <Constellation />
      {/* cursor spotlight */}
      <div ref={spot} className="absolute inset-0" />
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.25] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* overall dimmer: keeps the colours but 20% darker */}
      <div className="absolute inset-0 bg-black/20" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.55))]" />
    </div>
  );
}
