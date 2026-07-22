import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHot, setIsHot] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let fx = mx;
    let fy = my;
    let reqId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mx = e.clientX;
      my = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      }
    };

    const tick = () => {
      fx += (mx - fx) * 0.15;
      fy += (my - fy) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${fx}px, ${fy}px)`;
      }
      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);
    window.addEventListener("mousemove", handleMouseMove);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [data-cursor]");
      if (clickable) {
        setIsHot(true);
      } else {
        setIsHot(false);
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
        style={{
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference border border-white/60 -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color] duration-300 ${
          isHot
            ? "w-[58px] h-[58px] bg-white/12 border-transparent"
            : "w-[38px] h-[38px]"
        }`}
        style={{
          willChange: "transform",
        }}
      />
    </>
  );
}
