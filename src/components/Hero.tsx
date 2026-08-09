import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Radio, Terminal } from "lucide-react";

export function Hero({ showText }: { showText: boolean }) {
  const [time, setTime] = useState("");
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(12);

  // Live Local Clock
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate Telemetry Fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setFps((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const next = prev + delta;
        return next > 60 ? 60 : next < 57 ? 57 : next;
      });
      setLatency((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next > 18 ? 18 : next < 8 ? 8 : next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={`relative min-h-screen flex flex-col justify-center select-none z-10 pt-28 pb-12 px-[6vw] transition-all duration-[1200ms] ease-out ${showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Top HUD Telemetry strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-line bg-bg-soft/40 backdrop-blur-md rounded-2xl mb-12 font-mono text-[0.72rem] tracking-wider uppercase">
        <div className="flex flex-col border-r border-line/60 pr-4">
          <span className="text-muted block text-[0.62rem] mb-1">System Time</span>
          <span className="text-accent font-bold text-[0.8rem] tabular-nums">{time || "--:--:--"}</span>
        </div>
        <div className="flex flex-col md:border-r border-line/60 pr-4">
          <span className="text-muted block text-[0.62rem] mb-1">Connection State</span>
          <span className="text-fg font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Active / SSL
          </span>
        </div>
        <div className="flex flex-col border-r border-line/60 pr-4">
          <span className="text-muted block text-[0.62rem] mb-1">Render Load</span>
          <span className="text-fg font-bold tabular-nums">{fps} FPS / 0.08ms</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted block text-[0.62rem] mb-1">Telemetry Latency</span>
          <span className="text-fg font-bold tabular-nums">{latency}ms RTT</span>
        </div>
      </div>

      {/* Main Console HUD Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-[720px]">
          <div className="text-[0.76rem] font-mono uppercase tracking-[0.24em] mb-4 text-accent font-bold flex items-center gap-2.5">
            <Radio size={14} className="animate-pulse text-accent" />
            Terminal Initialization // System: Online
          </div>

          <h1 className="font-sans font-extrabold text-[clamp(2.8rem,7.5vw,6rem)] leading-[1.05] tracking-[-0.03em] mb-6 text-fg">
            Utkarsh Kumar Rajput
            <span className="block text-[clamp(1.5rem,4vw,3.2rem)] font-light text-muted tracking-tight mt-2">
              Senior Product Architect &amp; RTM
            </span>
          </h1>

          <p className="max-w-[580px] text-[clamp(0.98rem,1.3vw,1.15rem)] text-muted leading-relaxed font-normal mb-8">
            Specialized in driving cross-border RTM deployments, writing high-coverage BRDs, executing UAT sign-offs, and building robust internal SaaS tools for enterprise systems.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button
              asChild
              className="rounded-full px-8 py-6 text-[0.72rem] tracking-wider uppercase font-semibold bg-primary text-primary-foreground border border-primary hover:opacity-90 active:scale-95 transition-all duration-100 ease-out shadow-lg cursor-none"
              data-cursor
            >
              <a href="#work" onClick={(e) => handleNavClick(e, "#work")}>
                Initialize Project Sprint
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-8 py-6 text-[0.72rem] tracking-wider uppercase font-semibold border border-line text-fg hover:bg-bg-soft/40 active:scale-95 transition-all duration-100 ease-out cursor-none"
              data-cursor
            >
              <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
                Establish Uplink
              </a>
            </Button>
          </div>
        </div>

        {/* Right side: High-tech System Status box */}
        <div className="w-full lg:w-[320px] p-6 border border-line bg-bg-soft/30 backdrop-blur-md rounded-2xl font-mono text-[0.72rem] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line/60">
            <span className="font-bold flex items-center gap-2">
              <Shield size={14} className="text-accent" />
              COCKPIT SECURITY
            </span>
            <span className="text-accent font-bold">SECURE</span>
          </div>

          <div className="space-y-2 text-muted">
            <div className="flex justify-between">
              <span>Main Core Temp:</span>
              <span className="text-fg font-semibold">38.4°C</span>
            </div>
            <div className="flex justify-between">
              <span>Espresso Saturation:</span>
              <span className="text-fg font-semibold">82%</span>
            </div>
            <div className="flex justify-between">
              <span>Aircraft Deck Config:</span>
              <span className="text-fg font-semibold">Cruise v4</span>
            </div>
            <div className="flex justify-between">
              <span>Active Transponder:</span>
              <span className="text-fg font-semibold">SSR-8821</span>
            </div>
          </div>

          <div className="pt-3 border-t border-line/60 flex justify-between items-center text-[0.65rem] text-accent font-bold">
            <span className="flex items-center gap-1">
              <Terminal size={12} />
              SYSTEM DIAGNOSTICS:
            </span>
            <span>PASS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
