import { useEffect, useRef, useState } from "react";

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
    <div className="flex flex-col">
      <div className="font-serif text-[clamp(3rem,8vw,6.5rem)] italic leading-none font-medium text-accent tabular-nums mb-2">
        {count}+
      </div>
      <div className="text-[0.82rem] tracking-wider uppercase opacity-50">
        {label}
      </div>
    </div>
  );
}

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());

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

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-[14vh] px-[6vw] border-t border-line relative z-10 bg-bg/20 backdrop-blur-sm"
    >
      <div
        className={`eyebrow mb-6 flex items-center gap-2.5 text-[0.72rem] tracking-[0.28em] uppercase text-accent before:content-[''] before:w-6 before:h-[1px] before:bg-accent transition-all duration-1000 transform ${
          revealedItems.has("eyebrow")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="eyebrow"
      >
        About
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-10 md:gap-14 mb-20">
        <div
          className={`transition-all duration-1000 transform ${
            revealedItems.has("lead")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          } reveal-item`}
          data-idx="lead"
        >
          <p className="text-[clamp(1.5rem,2.8vw,2.4rem)] font-light leading-[1.25] text-fg">
            I work at the intersection of <em>product, analysis &amp; delivery</em> — turning messy
            operational problems into tools teams trust.
          </p>
        </div>

        <div
          className={`space-y-6 text-[1.05rem] text-muted leading-relaxed transition-all duration-1000 transform ${
            revealedItems.has("body")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          } reveal-item`}
          data-idx="body"
        >
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

      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-10 border-t border-line pt-14 transition-all duration-1000 transform ${
          revealedItems.has("stats")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
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

      {/* Skills badges */}
      <div
        className={`mt-14 border-t border-line pt-10 transition-all duration-1000 transform ${
          revealedItems.has("skills")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        } reveal-item`}
        data-idx="skills"
      >
        <p className="text-[0.72rem] tracking-[0.24em] uppercase text-muted mb-5">Tools &amp; Stack</p>
        <div className="flex flex-wrap gap-2.5">
          {[
            "Jira", "Confluence", "SAP", "BRD / RTM", "UAT",
            "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma",
            "Python", "Power BI", "Tableau", "Google Earth Engine",
            "Azure AZ-104", "Clerk", "Firebase", "Vercel",
          ].map((skill) => (
            <span
              key={skill}
              className="text-[0.75rem] border border-line rounded-full px-3.5 py-1.5 text-muted hover:border-accent/40 hover:text-fg transition-all duration-200 font-sans tracking-wide"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
