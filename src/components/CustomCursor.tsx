import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;

    const particles: Particle[] = [];
    const colors = ["#94eb6c", "#60a5fa", "#f59e0b", "#ffffff"];

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Speed vector for particle trail
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.8) {
        const count = Math.min(Math.floor(speed / 2.5), 5);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: mouseX + (Math.random() - 0.5) * 10,
            y: mouseY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5 - dx * 0.08,
            vy: (Math.random() - 0.5) * 1.5 - dy * 0.08,
            size: Math.random() * 4 + 2,
            alpha: 0.9,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [data-cursor], input, textarea, [role='button']");
      setIsHovered(!!clickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth elastic ring tracking
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${
          isMouseDown ? 0.7 : isHovered ? 1.7 : 1
        })`;
      }

      // Render Lusion fluid particle trail
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;
        p.size *= 0.95;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isHovered, isMouseDown]);

  return (
    <>
      {/* Canvas for fluid Lusion particle trail */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {/* Center glowing pointer dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-3 h-3 -ml-1.5 -mt-1.5 bg-emerald-400 rounded-full pointer-events-none z-[9999] shadow-[0_0_15px_#94eb6c]"
        style={{ willChange: "transform" }}
      />

      {/* Outer elastic spring ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-12 h-12 -ml-6 -mt-6 rounded-full pointer-events-none z-[9999] border transition-[border-color,background-color] duration-200 ${
          isHovered
            ? "border-emerald-400 bg-emerald-400/20 backdrop-blur-[2px] shadow-[0_0_20px_rgba(148,235,108,0.4)]"
            : "border-white/70 bg-transparent"
        }`}
        style={{ willChange: "transform" }}
      />
    </>
  );
}
