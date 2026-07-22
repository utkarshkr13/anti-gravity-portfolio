import { Button } from "@/components/ui/button";

interface HeroProps {
  showText: boolean;
}

const MARQUEE_ITEMS = [
  "Product Management",
  "Business Analysis",
  "RTM Delivery",
  "BRD Writing",
  "UAT & QA",
  "Go-Live Ops",
  "Next.js",
  "TypeScript",
  "PostgreSQL",
  "Node.js",
  "Azure AZ-104",
  "Jira",
  "SAP",
  "Python",
  "Power BI",
];

export function Hero({ showText }: HeroProps) {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center select-none z-10 overflow-hidden pt-24 pb-0">
      {/* Main content */}
      <div className="px-[6vw] pb-12">
        <div className="text-[0.82rem] uppercase tracking-[0.18em] mb-3 opacity-55 flex items-center gap-3">
          <span className="w-4 h-[1px] bg-current" />
          Hello — I'm a
        </div>

        <h1 className="font-serif italic leading-[0.88] text-[clamp(3.5rem,9.5vw,8.5rem)] mb-8 tracking-tighter">
          {["Product", "Manager &", "Analyst"].map((line, index) => (
            <span key={line} className="block overflow-hidden py-1">
              <span
                className={`inline-block transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
                  showText ? "translate-y-0" : "translate-y-[110%]"
                }`}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                {line === "Manager &" ? (
                  <>
                    Manager <span className="font-sans not-italic font-light opacity-40">&amp;</span>
                  </>
                ) : (
                  line
                )}
              </span>
            </span>
          ))}
        </h1>

        <p className="max-w-[560px] text-[clamp(1rem,1.4vw,1.2rem)] text-muted mb-10 leading-relaxed">
          I turn operational problems into products teams actually use —{" "}
          <strong className="text-fg font-semibold">BRDs, UAT, and cross-border go-lives</strong>,
          plus the internal tools that make them work.
        </p>

        <div className="flex gap-3 flex-wrap mb-10">
          <span className="bg-bg-soft border border-line rounded-full px-4 py-2 text-[0.75rem] tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Open to Senior PM roles
          </span>
          <span className="bg-bg-soft border border-line rounded-full px-4 py-2 text-[0.75rem] tracking-wide">
            📍 Mumbai, India
          </span>
          <span className="bg-bg-soft border border-line rounded-full px-4 py-2 text-[0.75rem] tracking-wide">
            Azure AZ-104 Certified
          </span>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button
            asChild
            className="rounded-full px-8 py-6 text-[0.78rem] tracking-widest uppercase font-medium bg-accent text-[#04150a] border border-accent hover:bg-fg hover:text-black hover:border-fg transition-all duration-300 shadow-[0_0_28px_rgba(157,255,107,0.20)] cursor-none"
            data-cursor
          >
            <a href="#work" onClick={(e) => handleNavClick(e, "#work")}>
              View Selected Work
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full px-8 py-6 text-[0.78rem] tracking-widest uppercase font-medium border-line text-fg hover:bg-fg hover:text-black hover:border-fg transition-all duration-300 cursor-none"
            data-cursor
          >
            <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
              Get in touch →
            </a>
          </Button>
        </div>
      </div>

      {/* Marquee ticker strip */}
      <div className="relative w-full mt-12 border-t border-b border-line py-3.5 overflow-hidden bg-bg-soft/30 backdrop-blur-sm">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-[0.72rem] tracking-[0.22em] uppercase text-muted flex items-center gap-12">
              {item}
              <span className="text-accent/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-[calc(3.5rem+1px)] left-[6vw] flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.16em] opacity-40">
        Scroll
        <div
          className="w-10 h-[1px] bg-current origin-left"
          style={{ animation: "pulseBar 2s infinite ease-in-out" }}
        />
      </div>
    </section>
  );
}
