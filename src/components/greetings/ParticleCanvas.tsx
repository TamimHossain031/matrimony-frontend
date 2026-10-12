'use client';

import React, { useEffect, useRef } from 'react';

export type ParticleKind = 'confetti' | 'rose_petals' | 'golden_stars' | 'floating_hearts' | 'sparkles' | 'none';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'petal' | 'star' | 'heart';
  life: number;
  maxLife: number;
}

interface ParticleCanvasProps {
  type?: ParticleKind;
  burstTrigger?: number; // Increment this to trigger a burst
  ambient?: boolean;
  className?: string;
}

export function ParticleCanvas({
  type = 'golden_stars',
  burstTrigger = 0,
  ambient = true,
  className = '',
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (type === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const getPalette = () => {
      switch (type) {
        case 'rose_petals':
          return ['#e89dae', '#d9658b', '#9c4d62', '#c75c76', '#f2b6c6'];
        case 'confetti':
          return ['#f25c54', '#f27059', '#f79d65', '#f7b267', '#62b6cb', '#bee3db', '#d99a2b', '#2f5d50'];
        case 'floating_hearts':
          return ['#ff597b', '#ff8e9e', '#f94892', '#e14d68', '#f8bbd0'];
        case 'sparkles':
        case 'golden_stars':
        default:
          return ['#ffd700', '#f3ca65', '#e5c06e', '#fff2b2', '#c29b38', '#ffffff'];
      }
    };

    const palette = getPalette();

    const spawnParticle = (isBurst = false): Particle => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const color = palette[Math.floor(Math.random() * palette.length)];

      let shape: Particle['shape'] = 'circle';
      if (type === 'confetti') shape = Math.random() > 0.4 ? 'rect' : 'circle';
      if (type === 'rose_petals') shape = 'petal';
      if (type === 'golden_stars' || type === 'sparkles') shape = Math.random() > 0.3 ? 'star' : 'circle';
      if (type === 'floating_hearts') shape = 'heart';

      if (isBurst) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        return {
          x: w / 2 + (Math.random() - 0.5) * 40,
          y: h / 2 + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 12 + 6,
          color,
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          opacity: 1,
          shape,
          life: 0,
          maxLife: Math.random() * 140 + 90,
        };
      }

      // Ambient spawn
      const isBottomToTop = type === 'floating_hearts';
      return {
        x: Math.random() * w,
        y: isBottomToTop ? h + 10 : Math.random() * -30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: isBottomToTop ? -(Math.random() * 1.5 + 0.8) : Math.random() * 1.8 + 0.6,
        size: Math.random() * 8 + 4,
        color,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 4,
        opacity: Math.random() * 0.7 + 0.3,
        shape,
        life: 0,
        maxLife: Math.random() * 300 + 150,
      };
    };

    // If burst requested
    if (burstTrigger > 0) {
      for (let i = 0; i < 70; i++) {
        particlesRef.current.push(spawnParticle(true));
      }
    }

    let lastAmbientSpawn = 0;

    const render = (time: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (ambient && time - lastAmbientSpawn > 180 && particlesRef.current.length < 55) {
        particlesRef.current.push(spawnParticle(false));
        lastAmbientSpawn = time;
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Apply slight gravity for confetti/petals
        if (p.shape === 'rect' || p.shape === 'petal') {
          p.vy += 0.05;
          p.vx *= 0.99;
        }

        // Fade out near end of life
        const progress = p.life / p.maxLife;
        const currentOpacity = Math.max(0, p.opacity * (1 - progress * 0.9));

        if (progress >= 1 || p.y > h + 40 || p.y < -50) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = currentOpacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 4, p.size, p.size / 2);
        } else if (p.shape === 'heart') {
          drawHeart(ctx, 0, 0, p.size);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [type, burstTrigger, ambient]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
      aria-hidden="true"
    />
  );
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size * 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y + s / 4);
  ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
  ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.75, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.75, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
  ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
  ctx.closePath();
  ctx.fill();
}
