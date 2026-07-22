import { useEffect, useRef, useState } from "react";

interface Project {
  idx: string;
  name: string;
  desc: string;
  tags: string[];
  href: string;
}

const projects: Project[] = [
  {
    idx: "01",
    name: "SAP Integration Tracker",
    desc: "Centralized testing & sign-off tracker for Coca-Cola Beverages South Africa's van-sales SAP go-live. Replaced fragmented spreadsheets — 40+ daily users, ~15 hrs/wk saved.",
    tags: ["Vanilla JS", "Clerk", "Firebase"],
    href: "https://sap-tracker-mocha.vercel.app",
  },
  {
    idx: "02",
    name: "L2 Escalation Portal",
    desc: "Real-time ticket triage SaaS that syncs with Gmail, auto-routes escalations, and tracks SLAs. Cut average L2 triage time by 40% across 3 client regions.",
    tags: ["Next.js 14", "Postgres", "Prisma"],
    href: "https://client-inbox-tracker.vercel.app",
  },
  {
    idx: "03",
    name: "Satellite Crop Classification",
    desc: "VIT capstone fusing Sentinel-1 SAR + Sentinel-2 optical imagery on Google Earth Engine, training ML models for low-cost regional crop mapping.",
    tags: ["Earth Engine", "Python", "ML"],
    href: "#work",
  },
  {
    idx: "04",
    name: "CityFlo BI Dashboards",
    desc: "Geospatial heatmaps and pricing analytics built from automated scraping pipelines — powering route optimization and price-elasticity decisions.",
    tags: ["Tableau", "Python", "PostgreSQL"],
    href: "#work",
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
              className={`group/work work-item relative grid grid-cols-1 md:grid-cols-[80px_1fr_1.6fr_1fr] items-center py-10 border-b border-line transition-all duration-1000 transform hover:pl-5 ${
                isRevealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              } reveal-item`}
              data-idx={project.idx}
              data-cursor
            >
              <div className="absolute inset-0 bg-bg-soft/75 border border-white/5 opacity-0 group-hover/work:opacity-100 transition-opacity duration-300 scale-y-0 group-hover/work:scale-y-100 transform origin-bottom group-hover/work:origin-top transition-transform duration-300 z-0 pointer-events-none rounded-lg" />

              <span className="text-[0.82rem] opacity-40 font-sans z-10 group-hover/work:opacity-60 transition-opacity">
                {project.idx}
              </span>

              <div className="text-[clamp(1.2rem,2.2vw,2rem)] font-medium tracking-tight text-fg font-sans z-10 group-hover/work:text-accent transition-colors py-2 md:py-0">
                {project.name}
              </div>

              <p className="text-[0.88rem] text-muted max-w-[560px] leading-relaxed pr-8 font-sans z-10 group-hover/work:text-fg transition-colors py-2 md:py-0">
                {project.desc}
              </p>

              <div className="flex justify-between items-center gap-4 z-10 w-full col-span-1 md:col-auto">
                <div className="flex gap-2 flex-wrap">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.74rem] bg-line/80 rounded-full px-2.5 py-1 text-muted-foreground border border-white/5 font-sans"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-2xl opacity-35 group-hover/work:opacity-100 group-hover/work:text-accent transition-all duration-300 transform group-hover/work:translate-x-1 group-hover/work:-translate-y-1 font-light pr-2">
                  ↗
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
