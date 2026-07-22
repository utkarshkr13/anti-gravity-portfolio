import { useEffect, useRef, useState } from "react";

interface Project {
  idx: string;
  name: string;
  desc: string;
  tags: string[];
  href: string;
  year: string;
}

const projects: Project[] = [
  {
    idx: "01",
    name: "SAP Integration Tracker",
    desc: "Centralized testing & sign-off tracker for Coca-Cola Beverages South Africa's van-sales SAP go-live. Replaced fragmented spreadsheets — 40+ daily users, ~15 hrs/wk saved.",
    tags: ["Vanilla JS", "Clerk", "Firebase"],
    href: "https://sap-tracker-mocha.vercel.app",
    year: "2025",
  },
  {
    idx: "02",
    name: "L2 Escalation Portal",
    desc: "Real-time ticket triage SaaS that syncs with Gmail, auto-routes escalations, and tracks SLAs. Cut average L2 triage time by 40% across 3 client regions.",
    tags: ["Next.js 14", "Postgres", "Prisma"],
    href: "https://client-inbox-tracker.vercel.app",
    year: "2025",
  },
  {
    idx: "03",
    name: "Satellite Crop Classification",
    desc: "VIT capstone fusing Sentinel-1 SAR + Sentinel-2 optical imagery on Google Earth Engine, training ML models for low-cost regional crop mapping.",
    tags: ["Earth Engine", "Python", "ML"],
    href: "#work",
    year: "2024",
  },
  {
    idx: "04",
    name: "CityFlo BI Dashboards",
    desc: "Geospatial heatmaps and pricing analytics built from automated scraping pipelines — powering route optimization and price-elasticity decisions.",
    tags: ["Tableau", "Python", "PostgreSQL"],
    href: "#work",
    year: "2023",
  },
];

export function WorkList() {
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
      id="work"
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
        Selected Work
      </div>

      <div
        className={`sec-head flex justify-between items-baseline mb-14 flex-wrap gap-5 transition-all duration-1000 transform ${
          revealedItems.has("header")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="header"
      >
        <h2 className="font-serif text-[clamp(2rem,5.5vw,4.5rem)] italic leading-none font-medium text-fg">
          Things I've <em>built &amp; shipped</em>
        </h2>
        <span className="text-[0.82rem] opacity-50 uppercase tracking-wider">
          04 projects
        </span>
      </div>

      <div className="flex flex-col">
        {projects.map((project) => {
          const isRevealed = revealedItems.has(project.idx);
          return (
            <a
              key={project.idx}
              href={project.href}
              target={project.href.startsWith("http") ? "_blank" : undefined}
              rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`group/work work-item relative grid grid-cols-1 md:grid-cols-[72px_auto_1fr_auto] items-center gap-4 py-9 border-b border-line transition-all duration-700 transform hover:bg-bg-soft/50 hover:px-4 hover:rounded-xl ${
                isRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              } reveal-item`}
              data-idx={project.idx}
              data-cursor
            >
              {/* Index + year */}
              <div className="flex flex-col z-10">
                <span className="text-[0.75rem] font-mono opacity-35 group-hover/work:opacity-70 transition-opacity">{project.idx}</span>
                <span className="text-[0.7rem] font-mono text-accent/50 group-hover/work:text-accent/80 transition-colors mt-0.5">{project.year}</span>
              </div>

              {/* Title */}
              <div className="text-[clamp(1.1rem,2vw,1.75rem)] font-medium tracking-tight text-fg font-sans z-10 group-hover/work:text-accent transition-colors duration-300 py-2 md:py-0 md:mr-6">
                {project.name}
              </div>

              {/* Description */}
              <p className="text-[0.86rem] text-muted leading-relaxed font-sans z-10 group-hover/work:text-fg/80 transition-colors py-2 md:py-0 hidden md:block">
                {project.desc}
              </p>

              {/* Tags + arrow */}
              <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 z-10">
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.68rem] bg-accent/[0.06] border border-accent/15 rounded-full px-2.5 py-1 text-accent/60 font-sans tracking-wide group-hover/work:border-accent/30 group-hover/work:text-accent/90 transition-all"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-lg opacity-25 group-hover/work:opacity-100 group-hover/work:text-accent transition-all duration-300 group-hover/work:translate-x-0.5 group-hover/work:-translate-y-0.5 transform font-light shrink-0">
                  ↗
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div
        className={`mt-10 flex justify-center transition-all duration-1000 transform ${
          revealedItems.has("cta")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="cta"
      >
        <a
          href="https://github.com/utkarshkr13"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-line rounded-full px-6 py-3 text-[0.75rem] tracking-widest uppercase text-muted hover:border-accent hover:text-accent transition-all duration-300"
          data-cursor
        >
          View all on GitHub ↗
        </a>
      </div>
    </section>
  );
}
