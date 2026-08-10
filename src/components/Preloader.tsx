import { useEffect, useState } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 1 : 1400;
    const startTime = performance.now();

    let frameId: number;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      setCount(Math.floor(progress * 100));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            onComplete();
          }, 600);
        }, reduceMotion ? 0 : 200);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-bg flex items-end justify-between p-[6vw] transition-all duration-[600ms] ${
        isDone ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"
      }`}
    >
      <div className="font-serif text-[clamp(2rem,7vw,5rem)] italic overflow-hidden text-fg">
        <span
          className="inline-block animate-[rise_0.9s_var(--ease-custom)_forwards]"
          style={{
            transform: "translateY(110%)",
          }}
        >
          Utkarsh Rajput
        </span>
      </div>
      <div className="text-[clamp(2rem,7vw,5rem)] font-medium tabular-nums">
        {count}
      </div>

      <style>{`
        @keyframes rise {
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
