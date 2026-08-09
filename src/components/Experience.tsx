import { useEffect, useRef, useState } from "react";
import { Briefcase, Calendar, MapPin, CheckCircle } from "lucide-react";

interface ExperienceItem {
  id: string;
  role: string;
  co: string;
  location: string;
  when: string;
  type: string;
  points: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: "exp-1",
    role: "Product Manager & Business Analyst",
    co: "SalesCode.ai",
    location: "Gurgaon, India",
    when: "Apr 2025 — Present",
    type: "Full-time Mission",
    points: [
      "Owned the Jira delivery pipeline across 600+ RTM issues for India, KSA & Nepal go-lives.",
      "Authored BRDs for van sales, inventory, return logic & merchandising across multi-region rollouts.",
      "Built internal platforms (SAP Testing Tracker, Escalation Portal) to accelerate QA sign-offs.",
    ],
  },
  {
    id: "exp-2",
    role: "BI & Marketing Analyst",
    co: "CityFlo",
    location: "Mumbai, India",
    when: "Sep 2023 — Nov 2023",
    type: "Analyst Deployment",
    points: [
      "Delivered geospatial dashboards in Python + PostgreSQL supporting pricing & route optimization.",
      "Automated scraping workflows, eliminating manual weekly reporting overhead.",
    ],
  },
  {
    id: "exp-3",
    role: "Research & Data Analytics Head",
    co: "Medide · VIT",
    location: "Vellore, India",
    when: "Jun 2023 — Oct 2023",
    type: "Student Lead",
    points: [
      "Built a blood-bank availability tracking model within a 15km radius for critical healthcare access.",
      "Structured the product workflow for a clinic booking & appointment system.",
    ],
  },
];

export function Experience() {
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
      id="experience"
      ref={sectionRef}
      className="py-[14vh] px-[6vw] border-t border-white/15 relative z-10 bg-black/40 backdrop-blur-md"
    >
      <div
        className={`eyebrow mb-6 flex items-center gap-2.5 text-[0.75rem] tracking-[0.24em] uppercase text-emerald-400 font-mono font-bold transition-all duration-1000 transform ${
          revealedItems.has("eyebrow")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="eyebrow"
      >
        Track Record &amp; Deployments
      </div>

      <div
        className={`sec-head flex justify-between items-baseline mb-14 flex-wrap gap-5 transition-all duration-1000 transform ${
          revealedItems.has("header")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="header"
      >
        <h2 className="font-sans font-extrabold text-[clamp(2.2rem,5.5vw,4.5rem)] tracking-tight leading-none text-white">
          Mission Log &amp; <span className="text-emerald-400 italic font-medium font-serif">Enterprise Impact</span>
        </h2>
        <span className="text-[0.8rem] text-gray-400 font-mono uppercase tracking-widest font-bold flex items-center gap-2">
          <Briefcase size={14} className="text-emerald-400" />
          RTM Delivery History
        </span>
      </div>

      {/* Experience Cards Grid */}
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className={`p-8 border border-white/20 bg-white/5 backdrop-blur-xl rounded-3xl transition-all duration-300 hover:border-emerald-400/50 shadow-2xl transform ${
              revealedItems.has(exp.id)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            } reveal-item`}
            data-idx={exp.id}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/15">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[0.68rem] uppercase font-bold tracking-wider mb-2">
                  {exp.type}
                </span>
                <h3 className="font-sans font-extrabold text-[1.4rem] text-white tracking-tight">
                  {exp.role} <span className="text-emerald-400">@ {exp.co}</span>
                </h3>
              </div>
              <div className="flex flex-col md:items-end font-mono text-[0.75rem] text-gray-300 gap-1">
                <span className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Calendar size={13} />
                  {exp.when}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <MapPin size={13} />
                  {exp.location}
                </span>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {exp.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-3 text-[0.92rem] text-gray-200 leading-relaxed font-sans font-medium">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-1" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
