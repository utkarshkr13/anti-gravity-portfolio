import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 flex justify-between items-center px-6 md:px-14 py-6 ${
        scrolled
          ? "bg-bg/60 backdrop-blur-xl border-b border-line py-4"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <a
        href="#top"
        onClick={(e) => handleNavClick(e, "#top")}
        className="font-serif text-2xl italic tracking-tight hover:opacity-80 transition-opacity"
        data-cursor
      >
        Utkarsh<span className="text-accent">.</span>
      </a>

      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="flex gap-8">
          {[
            { label: "Work", href: "#work" },
            { label: "Experience", href: "#experience" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-[0.82rem] tracking-wider uppercase font-sans font-medium hover:text-accent transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
                data-cursor
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="md:hidden flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-[0.7rem] uppercase tracking-widest text-muted">Portfolio</span>
      </div>
    </header>
  );
}
