import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    const sections = NAV_ITEMS.map((item) =>
      document.querySelector(item.href)
    ).filter(Boolean) as Element[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 flex justify-between items-center px-6 md:px-14 ${
          scrolled
            ? "py-3.5 bg-bg/70 backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-line"
            : "py-6 bg-transparent border-b border-transparent"
        }`}
      >
        {/* Logo */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, "body")}
          className="font-sans font-bold text-[1.25rem] tracking-tight hover:opacity-80 active:scale-95 transition-all duration-100 ease-out"
          data-cursor
        >
          Utkarsh<span className="text-accent">.</span>
        </a>

        {/* Desktop nav */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="flex gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`text-[0.75rem] tracking-wider uppercase font-sans font-semibold transition-all duration-100 ease-out relative py-1 active:scale-[0.96] block
                      after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-accent after:transition-all after:duration-300
                      ${isActive
                        ? "text-accent after:w-full"
                        : "text-muted hover:text-fg after:w-0 hover:after:w-full"
                      }`}
                    data-cursor
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-line text-muted hover:text-accent hover:border-accent active:scale-95 transition-all duration-100 ease-out bg-bg-soft/40"
            aria-label="Toggle theme"
            data-cursor
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Desktop CTA badge */}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="hidden md:flex items-center gap-2 border border-line rounded-full px-4 py-2 text-[0.72rem] tracking-wider uppercase active:scale-[0.96] hover:border-accent hover:text-accent transition-all duration-100 ease-out"
            data-cursor
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Hire me
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 z-[60] relative"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            data-cursor
          >
            <span
              className={`block w-5 h-[1.5px] bg-fg transition-all duration-300 origin-center ${
                mobileOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-fg transition-all duration-300 ${
                mobileOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-fg transition-all duration-300 origin-center ${
                mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen drawer */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-center items-center gap-10 bg-bg transition-all duration-500 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            className={`font-sans font-extrabold tracking-tight text-[clamp(2.5rem,10vw,4.5rem)] leading-none transition-all duration-300 hover:text-accent active:scale-95 ${
              activeSection === item.href ? "text-accent" : "text-fg"
            }`}
            style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
            data-cursor
          >
            {item.label}
          </a>
        ))}
        <a
          href="mailto:hello@utkarsh.ind.in"
          className="mt-6 text-[0.72rem] tracking-widest uppercase text-muted border border-line rounded-full px-6 py-3 hover:border-accent hover:text-accent active:scale-95 transition-all duration-100 ease-out"
          data-cursor
        >
          hello@utkarsh.ind.in
        </a>
      </div>
    </>
  );
}
