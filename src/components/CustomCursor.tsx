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
  const [isVisible, setIsVisible] = useState(false);

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
    const colors = ["#94eb6c", "#60a5fa", "#f59e0b", "#eeeae4"];

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Calculate speed vector for particle generation
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 1) {
        const count = Math.min(Math.floor(speed / 3), 4);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: mouseX + (Math.random() - 0.5) * 8,
            y: mouseY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5 - dx * 0.1,
            vy: (Math.random() - 0.5) * 1.5 - dy * 0.1,
            size: Math.random() * 3.5 + 1.5,
            alpha: 0.85,
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
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Smooth ring lerping (Lusion elastic easing)
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${
          isMouseDown ? 0.75 : isHovered ? 1.6 : 1
        })`;
      }

      // Draw particle ribbon trail
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
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
  }, [isVisible, isHovered, isMouseDown]);

  if (!isVisible) return null;

  return (
    <>
      {/* Canvas for fluid Lusion particle trail */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {/* Center dot pointer */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-emerald-400 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#94eb6c]"
        style={{ willChange: "transform" }}
      />

      {/* Outer elastic ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-10 h-10 -ml-5 -mt-5 rounded-full pointer-events-none z-[9999] border transition-[border-color,background-color] duration-200 ${
          isHovered
            ? "border-emerald-400/80 bg-emerald-400/10 backdrop-blur-[2px]"
            : "border-white/40 bg-transparent"
        }`}
        style={{ willChange: "transform" }}
      />
    </>
  );
}
