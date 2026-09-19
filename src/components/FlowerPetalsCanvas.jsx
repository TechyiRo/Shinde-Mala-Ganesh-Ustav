import React, { useEffect, useRef } from 'react';

export const FlowerPetalsCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 32 flower petals & sparkle particles
    const petalColors = [
      '#f59e0b', // Marigold amber
      '#ff7722', // Saffron
      '#fbbf24', // Warm gold
      '#d97706', // Deep marigold
      '#f43f5e'  // Rose petal pinkish red
    ];

    const petals = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 9 + 6,
      speedY: Math.random() * 0.8 + 0.5,
      speedX: Math.random() * 0.6 - 0.3,
      angle: Math.random() * 360,
      spinSpeed: (Math.random() - 0.5) * 1.5,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: Math.random() * 0.45 + 0.25,
      flip: 0,
      flipSpeed: Math.random() * 0.03 + 0.01
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.angle * (Math.PI / 180)) * 0.7 + p.speedX;
        p.angle += p.spinSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.scale(Math.cos(p.flip), 1);

        ctx.beginPath();
        // Marigold petal tear shape
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.65, -p.size * 0.5, p.size * 0.65, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.65, p.size * 0.5, -p.size * 0.65, -p.size * 0.5, 0, -p.size);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};
