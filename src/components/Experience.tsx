import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ExperienceItem {
  id: string;
  role: string;
  co: string;
  when: string;
  points: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: "exp-1",
    role: "Product Manager & Business Analyst",
    co: "SalesCode.ai",
    when: "Apr 2025 — Present · Gurgaon",
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
    when: "Sep 2023 — Nov 2023 · Mumbai",
    points: [
      "Delivered geospatial dashboards in Python + PostgreSQL supporting pricing & route optimization.",
      "Automated scraping workflows, eliminating manual weekly reporting overhead.",
    ],
  },
  {
    id: "exp-3",
    role: "Research & Data Analytics Head",
    co: "Medide · VIT",
    when: "Jun 2023 — Oct 2023 · Vellore",
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
      className="py-[14vh] px-[6vw] border-t border-line relative z-10 bg-bg/10 backdrop-blur-sm"
    >
      <div
        className={`eyebrow mb-6 flex items-center gap-2.5 text-[0.72rem] tracking-[0.28em] uppercase text-accent before:content-[''] before:w-6 before:h-[1px] before:bg-accent transition-all duration-1000 transform ${
          revealedItems.has("eyebrow")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="eyebrow"
      >
        Experience
      </div>

      <div
        className={`sec-head flex justify-between items-baseline mb-14 transition-all duration-1000 transform ${
          revealedItems.has("header")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        } reveal-item`}
        data-idx="header"
      >
        <h2 className="font-serif text-[clamp(2rem,5.5vw,4.5rem)] italic leading-none font-medium text-fg">
          Where I've made <em>impact</em>
        </h2>
      </div>

      <div
        className={`max-w-4xl mx-auto border-l border-line pl-6 md:pl-10 relative transition-all duration-1000 transform ${
          revealedItems.has("list")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        } reveal-item`}
        data-idx="list"
      >
        <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-accent/25 z-0" />

        <Accordion
          type="single"
          collapsible
          defaultValue="exp-1"
          className="w-full space-y-6 z-10 relative"
        >
          {experiences.map((exp) => (
            <AccordionItem
              key={exp.id}
              value={exp.id}
              className="border border-line rounded-lg px-6 py-4 bg-bg-soft/45 backdrop-blur-md relative hover:border-accent/40 transition-all duration-300 group"
            >
              <span className="absolute -left-[31px] md:-left-[47px] top-[26px] w-[9px] h-[9px] rounded-full bg-[#181a20] border-2 border-line group-hover:border-accent transition-colors z-20" />

              <AccordionTrigger className="w-full text-left py-2 hover:no-underline font-sans cursor-none" data-cursor>
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between w-full gap-2 pr-4">
                  <div>
                    <h3 className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-medium text-fg tracking-tight group-hover:text-accent transition-colors">
                      {exp.role}
                    </h3>
                    <span className="text-[0.92rem] font-semibold text-accent/85 mt-1 block">
                      {exp.co}
                    </span>
                  </div>
                  <span className="text-[0.78rem] text-muted opacity-80 whitespace-nowrap font-mono mt-1 md:mt-0">
                    {exp.when}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 border-t border-line mt-4">
                <ul className="list-disc pl-5 space-y-3 text-[0.92rem] text-muted-foreground leading-relaxed font-sans">
                  {exp.points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
