
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-line bg-bg-soft/20 backdrop-blur-sm">
      <div className="px-[6vw] py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <a href="#top" className="font-serif text-2xl italic tracking-tight hover:opacity-80 transition-opacity block mb-3" data-cursor>
            Utkarsh<span className="text-accent">.</span>
          </a>
          <p className="text-[0.82rem] text-muted leading-relaxed max-w-[240px]">
            PM & Analyst building at the intersection of product, data, and delivery.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-[0.68rem] tracking-[0.22em] uppercase text-muted/60 mb-5">Navigate</p>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Work", href: "#work" },
              { label: "Experience", href: "#experience" },
              { label: "About", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[0.82rem] text-muted hover:text-accent transition-colors w-fit"
                data-cursor
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Social */}
        <div>
          <p className="text-[0.68rem] tracking-[0.22em] uppercase text-muted/60 mb-5">Connect</p>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "LinkedIn", href: "https://linkedin.com/in/utkarshkr13" },
              { label: "GitHub", href: "https://github.com/utkarshkr13" },
              { label: "Email", href: "mailto:hello@utkarsh.ind.in" },
              { label: "Resume", href: "#contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-[0.82rem] text-muted hover:text-accent transition-colors w-fit flex items-center gap-1.5"
                data-cursor
              >
                {item.label}
                {item.href.startsWith("http") && <span className="text-[0.65rem] opacity-50">↗</span>}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line px-[6vw] py-5 flex flex-wrap justify-between items-center gap-3 text-[0.72rem] text-muted/50">
        <span>© {currentYear} Utkarsh Rajput. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          Built with <span className="text-accent/70">React</span> · <span className="text-accent/70">TypeScript</span> · <span className="text-accent/70">Tailwind</span>
        </span>
      </div>
    </footer>
  );
}
