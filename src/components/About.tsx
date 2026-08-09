import { useEffect, useRef, useState } from "react";
import { Plane, Music, Coffee, Play, Pause, Compass, Volume2 } from "lucide-react";

interface StatItemProps {
  target: number;
  label: string;
  isRevealed: boolean;
}

function StatCounter({ target, label, isRevealed }: StatItemProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isRevealed) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setCount(target);
      return;
    }

    const duration = 1400;
    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / duration);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [target, isRevealed]);

  return (
    <div className="flex flex-col bg-bg-soft/40 border border-line rounded-2xl p-5 backdrop-blur-md">
      <div className="font-sans font-extrabold text-[clamp(2.5rem,5vw,4.5rem)] leading-none text-accent tracking-tighter mb-2">
        {count}+
      </div>
      <div className="text-[0.72rem] tracking-wider uppercase font-semibold text-muted">
        {label}
      </div>
    </div>
  );
}

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());

  // Interactive states for widgets
  const [isPlaying, setIsPlaying] = useState(true);
  const [altitude, setAltitude] = useState(32000);
  const [heading, setHeading] = useState(285);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute("data-idx");
            if (idx) {
              setRevealedItems((prev) => {
                const next = new Set(prev);
                next.add(idx);
                return next;
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const items = sectionRef.current?.querySelectorAll(".reveal-item");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  // Simulate Flight Telemetry Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10; // -10 to +10 ft
        const next = prev + delta;
        return next > 33000 ? 33000 : next < 31000 ? 31000 : next;
      });
      setHeading((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1 to +1 deg
        return (prev + delta + 360) % 360;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-[14vh] px-[6vw] border-t border-line relative z-10 bg-bg/20 backdrop-blur-sm"
    >
      <div
        className={`eyebrow mb-6 flex items-center gap-2.5 text-[0.72rem] tracking-[0.24em] uppercase text-accent font-semibold before:content-[''] before:w-6 before:h-[1.5px] before:bg-accent transition-all duration-1000 transform ${
          revealedItems.has("eyebrow")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="eyebrow"
      >
        About &amp; Passions
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Bio (Col span 2) */}
        <div
          className={`lg:col-span-2 bg-bg-soft/45 border border-line rounded-3xl p-8 md:p-10 backdrop-blur-md flex flex-col justify-between transition-all duration-1000 transform ${
            revealedItems.has("bio") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          } reveal-item`}
          data-idx="bio"
        >
          <div>
            <h3 className="text-[clamp(1.5rem,2.8vw,2.2rem)] font-extrabold leading-[1.15] text-fg tracking-tight mb-6">
              I work at the intersection of <span className="text-accent font-medium italic font-serif">product, analysis &amp; delivery</span> — turning messy operational problems into tools teams trust.
            </h3>
            <div className="space-y-4 text-[0.98rem] text-muted leading-relaxed font-normal">
              <p>
                My focus is shaping requirements, mapping user flows, writing BRDs, reviewing test coverage,
                and supporting UAT and go-live across enterprise RTM programs.
              </p>
              <p>
                I also build lightweight tools where process gaps create friction — using{" "}
                <strong className="text-fg font-semibold">Next.js, TypeScript, Node.js, PostgreSQL, Prisma</strong>{" "}
                and AI-assisted workflows.
              </p>
              <p>
                B.Tech in Electronics &amp; Communication from VIT — a background that keeps me grounded in
                both business context and technical execution.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Espresso Extraction Lab (Coffee) */}
        <div
          className={`bg-bg-soft/45 border border-line rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between hover:border-accent/30 transition-all duration-300 active:scale-[0.99] transform ${
            revealedItems.has("coffee") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          } reveal-item`}
          data-idx="coffee"
          data-cursor
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-[0.72rem] tracking-wider uppercase font-semibold text-muted flex items-center gap-2">
                <Coffee size={14} className="text-accent" />
                Espresso Brew Log
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-4 font-mono text-[0.82rem]">
              <div className="border-b border-line/60 pb-2">
                <span className="text-muted block text-[0.68rem] uppercase tracking-wider mb-0.5">Origin</span>
                <span className="text-fg font-semibold">Ethiopia Yirgacheffe</span>
              </div>
              <div className="border-b border-line/60 pb-2">
                <span className="text-muted block text-[0.68rem] uppercase tracking-wider mb-0.5">Ratio</span>
                <span className="text-fg font-semibold">18.5g In → 37g Out (1:2)</span>
              </div>
              <div className="border-b border-line/60 pb-2">
                <span className="text-muted block text-[0.68rem] uppercase tracking-wider mb-0.5">Pressure</span>
                <span className="text-fg font-semibold">9.2 Bar Extraction</span>
              </div>
              <div>
                <span className="text-muted block text-[0.68rem] uppercase tracking-wider mb-0.5">Temp / Time</span>
                <span className="text-fg font-semibold">93.5°C @ 27 seconds</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line/60 flex justify-between items-center text-[0.7rem] uppercase tracking-wider font-semibold text-accent">
            <span>Flow Profile: Classic Spring</span>
            <span>☕ Extracting</span>
          </div>
        </div>

        {/* Card 3: Flight Deck Status (Aviation) */}
        <div
          className={`bg-bg-soft/45 border border-line rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between hover:border-accent/30 transition-all duration-300 active:scale-[0.99] transform ${
            revealedItems.has("aviation") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          } reveal-item`}
          data-idx="aviation"
          data-cursor
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-[0.72rem] tracking-wider uppercase font-semibold text-muted flex items-center gap-2">
                <Plane size={14} className="rotate-45 text-accent" />
                Flight Deck Status
              </div>
              <div className="text-[0.65rem] bg-accent/10 border border-accent/20 rounded px-2 py-0.5 text-accent font-semibold tracking-wider">
                CRUISING
              </div>
            </div>

            <div className="space-y-4 font-mono text-[0.82rem]">
              <div className="flex justify-between border-b border-line/60 pb-2.5">
                <span className="text-muted uppercase tracking-wider">Altitude</span>
                <span className="text-fg font-bold tabular-nums">{altitude.toLocaleString()} FT</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2.5">
                <span className="text-muted uppercase tracking-wider">Heading</span>
                <span className="text-fg font-bold tabular-nums">{heading}° WNW</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2.5">
                <span className="text-muted uppercase tracking-wider">Speed</span>
                <span className="text-fg font-bold">Mach 0.78 (450 KTAS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted uppercase tracking-wider">Coordinates</span>
                <span className="text-fg font-bold text-[0.78rem]">19.076° N, 72.878° E</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line/60 flex items-center gap-2 text-[0.7rem] uppercase tracking-wider font-semibold text-muted">
            <Compass size={12} className="animate-spin text-accent" style={{ animationDuration: "8s" }} />
            <span>ATC Connection: Stable</span>
          </div>
        </div>

        {/* Card 4: Music Cabin Mini-Player (Music) */}
        <div
          className={`bg-bg-soft/45 border border-line rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between hover:border-accent/30 transition-all duration-300 active:scale-[0.99] transform ${
            revealedItems.has("music") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          } reveal-item`}
          data-idx="music"
          data-cursor
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-[0.72rem] tracking-wider uppercase font-semibold text-muted flex items-center gap-2">
                <Music size={14} className="text-accent" />
                Music Cabin
              </div>
              <div className="flex items-center gap-1">
                <Volume2 size={12} className="text-muted" />
                <span className="text-[0.7rem] font-mono opacity-50 font-bold">45%</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {/* Spinning vinyl-inspired shape */}
              <div className={`w-14 h-14 rounded-full border border-line/80 flex items-center justify-center relative bg-bg-soft/60 shadow-inner ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }}>
                <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/40" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-[0.95rem] tracking-tight text-fg">Resonance (Lofi Cover)</h4>
                <p className="text-[0.78rem] text-muted mt-0.5">Home · Synthwave Cabin</p>
              </div>
            </div>

            {/* Simulated sound waves visualizer */}
            <div className="h-6 flex items-end gap-[3px] px-1 mb-2">
              {[8, 14, 20, 10, 16, 24, 18, 12, 6, 15, 22, 10, 16, 8, 14, 22, 18, 12, 6, 12].map((height, i) => (
                <div
                  key={i}
                  className="flex-grow bg-accent/60 rounded-t transition-all duration-300"
                  style={{
                    height: isPlaying ? `${height}px` : "2px",
                    animation: isPlaying ? `pulseBar ${0.8 + (i % 5) * 0.2}s infinite ease-in-out alternate` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line/60">
            <span className="text-[0.68rem] font-mono text-muted uppercase font-bold">{isPlaying ? "Playing" : "Paused"}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-fg text-bg flex items-center justify-center hover:opacity-95 active:scale-90 transition-all duration-100 ease-out cursor-none"
              data-cursor
            >
              {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Card 5: Stats Counters */}
        <div
          className={`lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 transition-all duration-1000 transform ${
            revealedItems.has("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          } reveal-item`}
          data-idx="stats"
        >
          <StatCounter
            target={600}
            label="Jira issues owned"
            isRevealed={revealedItems.has("stats")}
          />
          <StatCounter
            target={15}
            label="Hrs saved / week"
            isRevealed={revealedItems.has("stats")}
          />
          <StatCounter
            target={40}
            label="Daily active users"
            isRevealed={revealedItems.has("stats")}
          />
        </div>
      </div>

      {/* Skills badges */}
      <div
        className={`mt-10 border-t border-line pt-10 transition-all duration-1000 transform ${
          revealedItems.has("skills")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        } reveal-item`}
        data-idx="skills"
      >
        <p className="text-[0.72rem] tracking-[0.24em] uppercase text-muted mb-5 font-semibold">Tools &amp; Stack</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Jira", "Confluence", "SAP", "BRD / RTM", "UAT",
            "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma",
            "Python", "Power BI", "Tableau", "Google Earth Engine",
            "Azure AZ-104", "Clerk", "Firebase", "Vercel",
          ].map((skill) => (
            <span
              key={skill}
              className="text-[0.72rem] border border-line rounded-full px-3.5 py-1.5 text-muted hover:border-accent/40 hover:text-fg active:scale-95 transition-all duration-100 ease-out font-sans font-medium tracking-wide"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
