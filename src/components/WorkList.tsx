import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Kanban, CheckCircle, Clock, RotateCcw } from "lucide-react";

interface Project {
  idx: string;
  name: string;
  desc: string;
  tags: string[];
  href: string;
  year: string;
  status: "backlog" | "progress" | "done";
}

const initialProjects: Project[] = [
  {
    idx: "01",
    name: "SAP Integration Tracker",
    desc: "Centralized testing & sign-off tracker for Coca-Cola Beverages South Africa's van-sales SAP go-live. Replaced fragmented spreadsheets — 40+ daily users, ~15 hrs/wk saved.",
    tags: ["Vanilla JS", "Clerk", "Firebase"],
    href: "https://sap-tracker-mocha.vercel.app",
    year: "2025",
    status: "done",
  },
  {
    idx: "02",
    name: "L2 Escalation Portal",
    desc: "Real-time ticket triage SaaS that syncs with Gmail, auto-routes escalations, and tracks SLAs. Cut average L2 triage time by 40% across 3 client regions.",
    tags: ["Next.js 14", "Postgres", "Prisma"],
    href: "https://client-inbox-tracker.vercel.app",
    year: "2025",
    status: "progress",
  },
  {
    idx: "03",
    name: "Satellite Crop Classification",
    desc: "VIT capstone fusing Sentinel-1 SAR + Sentinel-2 optical imagery on Google Earth Engine, training ML models for low-cost regional crop mapping.",
    tags: ["Earth Engine", "Python", "ML"],
    href: "#work",
    year: "2024",
    status: "backlog",
  },
  {
    idx: "04",
    name: "CityFlo BI Dashboards",
    desc: "Geospatial heatmaps and pricing analytics built from automated scraping pipelines — powering route optimization and price-elasticity decisions.",
    tags: ["Tableau", "Python", "PostgreSQL"],
    href: "#work",
    year: "2023",
    status: "backlog",
  },
];

export function WorkList() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
  const [boardProjects, setBoardProjects] = useState<Project[]>(initialProjects);

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

  const moveProject = (idx: string, direction: "left" | "right") => {
    setBoardProjects((prev) =>
      prev.map((p) => {
        if (p.idx !== idx) return p;
        let newStatus: "backlog" | "progress" | "done" = p.status;
        if (p.status === "backlog" && direction === "right") newStatus = "progress";
        else if (p.status === "progress" && direction === "left") newStatus = "backlog";
        else if (p.status === "progress" && direction === "right") newStatus = "done";
        else if (p.status === "done" && direction === "left") newStatus = "progress";
        return { ...p, status: newStatus };
      })
    );
  };

  const resetBoard = () => {
    setBoardProjects(initialProjects);
  };

  const getColProjects = (col: "backlog" | "progress" | "done") => {
    return boardProjects.filter((p) => p.status === col);
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="py-[14vh] px-[6vw] border-t border-line relative z-10 bg-bg/20 backdrop-blur-sm"
    >
      <div
        className={`eyebrow mb-6 flex items-center gap-2.5 text-[0.75rem] tracking-[0.24em] uppercase text-[#D4AF37] font-mono font-bold transition-all duration-1000 transform ${
          revealedItems.has("eyebrow")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="eyebrow"
      >
        Fleet Specification &amp; Sprint Deck
      </div>

      <div
        className={`sec-head flex justify-between items-baseline mb-12 flex-wrap gap-5 transition-all duration-1000 transform ${
          revealedItems.has("header")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="header"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-sans font-extrabold text-[clamp(2.2rem,5.5vw,4.5rem)] tracking-tight leading-none text-white">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#94EB6C]">Fleet &amp; Kanban Board</span>
          </h2>
          <button
            onClick={resetBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/40 text-[0.72rem] tracking-wider uppercase text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-black active:scale-95 transition-all duration-150 cursor-none font-bold"
            data-cursor
            title="Reset Sprint Board"
          >
            <RotateCcw size={12} />
            Reset Board
          </button>
        </div>
        <span className="text-[0.8rem] text-gray-300 font-mono font-bold uppercase tracking-widest flex items-center gap-2">
          <Kanban size={14} className="text-[#94EB6C]" />
          SLA TRACKING ACTIVE
        </span>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Backlog */}
        <div className="flex flex-col bg-black/60 border border-white/20 rounded-3xl p-5 backdrop-blur-xl min-h-[450px] shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-4">
            <span className="text-[0.78rem] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Clock size={14} />
              1. Backlog / BRD
            </span>
            <span className="bg-white/15 px-2 py-0.5 rounded-md text-[0.72rem] font-mono text-white font-extrabold">
              {getColProjects("backlog").length}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            {getColProjects("backlog").map((p) => (
              <div
                key={p.idx}
                className="bg-bg-soft/60 border border-line rounded-2xl p-5 flex flex-col justify-between hover:border-accent/40 transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[0.62rem] font-mono text-muted uppercase font-bold">TASK-{p.idx}</span>
                    <span className="text-[0.65rem] font-mono text-muted">{p.year}</span>
                  </div>
                  <h4 className="font-sans font-bold text-[0.95rem] tracking-tight text-fg mb-2">{p.name}</h4>
                  <p className="text-[0.78rem] text-muted leading-relaxed font-sans mb-4">{p.desc}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[0.6rem] bg-accent/[0.04] border border-accent/15 rounded px-2 py-0.5 text-accent font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-line/60">
                    <span className="text-[0.68rem] text-fg/70 uppercase font-bold">Move State</span>
                    <button
                      onClick={() => moveProject(p.idx, "right")}
                      aria-label={`Move ${p.name} to In Progress`}
                      className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center hover:bg-accent hover:text-[#031502] active:scale-90 transition-all duration-150 cursor-none"
                      data-cursor
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col bg-bg-soft/25 border border-line rounded-3xl p-5 backdrop-blur-md min-h-[450px]">
          <div className="flex items-center justify-between pb-4 border-b border-line/60 mb-4">
            <span className="text-[0.75rem] font-bold uppercase tracking-wider text-fg/80 flex items-center gap-2">
              <Clock size={13} className="text-blue-400 animate-pulse" />
              2. In Progress / QA
            </span>
            <span className="bg-line px-2 py-0.5 rounded text-[0.68rem] font-mono text-fg font-bold">
              {getColProjects("progress").length}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            {getColProjects("progress").map((p) => (
              <div
                key={p.idx}
                className="bg-bg-soft/60 border border-line rounded-2xl p-5 flex flex-col justify-between hover:border-accent/40 transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[0.68rem] font-mono text-accent uppercase font-bold">TASK-{p.idx}</span>
                    <span className="text-[0.68rem] font-mono text-fg/80 font-bold">{p.year}</span>
                  </div>
                  <h4 className="font-sans font-extrabold text-[1rem] tracking-tight text-fg mb-2">{p.name}</h4>
                  <p className="text-[0.82rem] text-fg/85 leading-relaxed font-sans mb-4 font-normal">{p.desc}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[0.6rem] bg-accent/[0.04] border border-accent/15 rounded px-2 py-0.5 text-accent font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-line/60">
                    <button
                      onClick={() => moveProject(p.idx, "left")}
                      aria-label={`Move ${p.name} back to Backlog`}
                      className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center hover:bg-accent hover:text-[#031502] active:scale-90 transition-all duration-150 cursor-none"
                      data-cursor
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <span className="text-[0.68rem] text-fg/70 uppercase font-bold">Move State</span>
                    <button
                      onClick={() => moveProject(p.idx, "right")}
                      aria-label={`Move ${p.name} to Go-Live Production`}
                      className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center hover:bg-accent hover:text-[#031502] active:scale-90 transition-all duration-150 cursor-none"
                      data-cursor
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Go-Live */}
        <div className="flex flex-col bg-bg-soft/25 border border-line rounded-3xl p-5 backdrop-blur-md min-h-[450px]">
          <div className="flex items-center justify-between pb-4 border-b border-line/60 mb-4">
            <span className="text-[0.75rem] font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <CheckCircle size={13} className="text-emerald-500" />
              3. Go-Live Production
            </span>
            <span className="bg-line px-2 py-0.5 rounded text-[0.68rem] font-mono text-fg font-bold">
              {getColProjects("done").length}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            {getColProjects("done").map((p) => (
              <div
                key={p.idx}
                className="bg-bg-soft/60 border border-line rounded-2xl p-5 flex flex-col justify-between hover:border-accent/40 transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[0.62rem] font-mono text-muted uppercase font-bold font-semibold text-accent flex items-center gap-1">
                      <CheckCircle size={10} />
                      LIVE
                    </span>
                    <span className="text-[0.65rem] font-mono text-muted">{p.year}</span>
                  </div>
                  <h4 className="font-sans font-bold text-[0.95rem] tracking-tight text-fg mb-2">{p.name}</h4>
                  <p className="text-[0.78rem] text-muted leading-relaxed font-sans mb-4">{p.desc}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[0.6rem] bg-accent/[0.04] border border-accent/15 rounded px-2 py-0.5 text-accent font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-line/60">
                    <button
                      onClick={() => moveProject(p.idx, "left")}
                      className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center hover:bg-accent hover:text-[#031502] active:scale-90 transition-all duration-150 cursor-none"
                      data-cursor
                    >
                      <ArrowLeft size={13} />
                    </button>

                    {p.href !== "#work" ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[0.68rem] tracking-wider uppercase font-bold text-accent hover:underline cursor-none"
                        data-cursor
                      >
                        Launch
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-[0.68rem] text-muted uppercase font-bold">Docs Ready</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trailing GitHub CTA */}
      <div
        className={`mt-12 flex justify-center transition-all duration-1000 transform ${
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
          className="inline-flex items-center gap-2 border border-line rounded-full px-6 py-3 text-[0.72rem] tracking-widest uppercase text-muted hover:border-accent hover:text-accent active:scale-95 transition-all duration-100 ease-out cursor-none"
          data-cursor
        >
          View all on GitHub ↗
        </a>
      </div>
    </section>
  );
}
