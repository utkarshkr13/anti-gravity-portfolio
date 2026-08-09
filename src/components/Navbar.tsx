import { useEffect, useState } from "react";
import { Sun, Moon, Home, Briefcase, User, Folder, Mail } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "body", icon: Home },
  { label: "Work", href: "#work", icon: Folder },
  { label: "Experience", href: "#experience", icon: Briefcase },
  { label: "About", href: "#about", icon: User },
  { label: "Contact", href: "#contact", icon: Mail },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  // Sync theme to root classList
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll-spy: observe each section
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => {
      if (item.href === "body") return document.body;
      return document.querySelector(item.href);
    }).filter(Boolean) as Element[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === document.body) {
              setActiveSection("body");
            } else {
              setActiveSection(`#${entry.target.id}`);
            }
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "body") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-2 bg-bg-soft/75 backdrop-blur-[20px] backdrop-saturate-[180%] border border-line rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.18)] max-w-lg w-[calc(100%-2.5rem)] md:w-auto">
      {/* Navigation Icons Dock */}
      <nav className="flex items-center gap-1 w-full justify-around md:justify-start">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.href || (item.href === "body" && activeSection === "body");
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href === "body" ? "#top" : item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 active:scale-90 group/item cursor-none
                ${isActive ? "bg-accent/15 text-accent border border-accent/25" : "text-muted hover:text-fg hover:bg-bg-soft/40"}
              `}
              data-cursor
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Apple-style floating label tooltip */}
              <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[0.62rem] uppercase font-semibold font-sans tracking-widest bg-primary text-primary-foreground border border-line rounded-md opacity-0 group-hover/item:opacity-100 scale-95 group-hover/item:scale-100 pointer-events-none transition-all duration-150 shadow-md">
                {item.label}
              </span>
            </a>
          );
        })}

        {/* Separator line */}
        <div className="w-[1px] h-6 bg-line mx-1 hidden md:block" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-11 h-11 rounded-full text-muted hover:text-accent hover:bg-bg-soft/40 active:scale-90 transition-all duration-200 group/theme cursor-none"
          aria-label="Toggle theme"
          data-cursor
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[0.62rem] uppercase font-semibold font-sans tracking-widest bg-primary text-primary-foreground border border-line rounded-md opacity-0 group-hover/theme:opacity-100 scale-95 group-hover/theme:scale-100 pointer-events-none transition-all duration-150 shadow-md">
            Theme
          </span>
        </button>
      </nav>
    </header>
  );
}
