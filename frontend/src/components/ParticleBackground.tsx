import React, { useEffect, useRef } from "react";

/**
 * LoginPage-style interactive particles + ambient blobs.
 *
 * Notes:
 * - Fixed positioning + pointer-events: none so it never blocks UI.
 * - Cancels RAF and removes listeners for React StrictMode/dev double-mounts.
 */
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;

    // Explicit non-null types (keeps TS/IDE analyzers happy across closures)
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxEl;

    let rafId: number | null = null;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const mouse: { x: number | undefined; y: number | undefined; radius: number } = {
      x: undefined,
      y: undefined,
      radius: 150,
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();

    type Particle = {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;
    };

    const particlesArray: Particle[] = [];
    let numberOfParticles = (window.innerWidth * window.innerHeight) / 9000;

    const drawParticle = (p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      ctx.fillStyle = p.color;
      ctx.fill();
    };

    const updateParticle = (p: Particle) => {
      if (p.x > canvas.width || p.x < 0) p.directionX = -p.directionX;
      if (p.y > canvas.height || p.y < 0) p.directionY = -p.directionY;

      const dx = (mouse.x ?? 0) - p.x;
      const dy = (mouse.y ?? 0) - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (mouse.x !== undefined && mouse.y !== undefined && distance < mouse.radius + p.size) {
        if (mouse.x < p.x && p.x < canvas.width - p.size * 10) p.x += 3;
        if (mouse.x > p.x && p.x > p.size * 10) p.x -= 3;
        if (mouse.y < p.y && p.y < canvas.height - p.size * 10) p.y += 3;
        if (mouse.y > p.y && p.y > p.size * 10) p.y -= 3;
      }

      p.x += p.directionX;
      p.y += p.directionY;
      drawParticle(p);
    };

    const createParticle = (): Particle => {
      const size = Math.random() * 2 + 0.5;
      return {
        x: Math.random() * (window.innerWidth - size * 4) + size * 2,
        y: Math.random() * (window.innerHeight - size * 4) + size * 2,
        directionX: Math.random() - 0.5,
        directionY: Math.random() - 0.5,
        size,
        color: "#3572ef",
      };
    };

    function init() {
      particlesArray.length = 0;
      numberOfParticles = (window.innerWidth * window.innerHeight) / 9000;
      for (let i = 0; i < numberOfParticles; i++) particlesArray.push(createParticle());
    }

    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance =
            (particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x) +
            (particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y);

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - distance / 20000;
            ctx.strokeStyle = `rgba(53, 114, 239,${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      rafId = window.requestAnimationFrame(animate);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 0; i < particlesArray.length; i++) updateParticle(particlesArray[i]);
      connect();
    }

    init();
    animate();

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div className="background-blobs" aria-hidden>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
    </>
  );
}
