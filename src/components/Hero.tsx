import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Compass, RefreshCw, ArrowUpRight } from "lucide-react";
import { fetchLiveFlightData, type LiveFlight } from "@/services/flightApi";

export function Hero({ showText }: { showText: boolean }) {
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLocalTime(d.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadFlights = async () => {
    setLoadingFlights(true);
    const data = await fetchLiveFlightData();
    setFlights(data);
    if (data.length > 0) setSelectedFlight(data[0]);
    setLoadingFlights(false);
  };

  useEffect(() => {
    loadFlights();
    const interval = setInterval(loadFlights, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className={`relative min-h-screen flex flex-col justify-between select-none z-10 pt-28 pb-16 px-[6vw] transition-all duration-1000 ease-out ${
        showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Top Glassmorphic Telemetry Header */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/20 dark:border-white/15 bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl mb-12 shadow-lg font-mono text-[0.75rem] uppercase tracking-wider text-fg">
        <div className="flex flex-col border-r border-white/15 pr-4">
          <span className="opacity-60 text-[0.62rem] mb-1 font-bold">Local Deck Time</span>
          <span className="text-emerald-400 font-bold text-[0.88rem] tabular-nums">{localTime || "--:--:--"}</span>
        </div>
        <div className="flex flex-col md:border-r border-white/15 pr-4">
          <span className="opacity-60 text-[0.62rem] mb-1 font-bold">Aviation Data Stream</span>
          <span className="font-bold flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE OPENSKY FEED
          </span>
        </div>
        <div className="flex flex-col border-r border-white/15 pr-4">
          <span className="opacity-60 text-[0.62rem] mb-1 font-bold">Airborne Aircraft</span>
          <span className="font-bold tabular-nums text-[0.88rem]">
            {loadingFlights ? "SYNCING..." : `${flights.length} LIVE FLIGHTS`}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="opacity-60 text-[0.62rem] mb-1 font-bold">Status</span>
          <span className="text-amber-400 font-bold">AVAILABLE FOR PROJECTS</span>
        </div>
      </div>

      {/* Main Glassmorphic Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        {/* Left Column: Clean High-Contrast Typography */}
        <div className="lg:col-span-7 flex flex-col items-start">
          <div className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[0.72rem] tracking-widest uppercase font-bold mb-6 shadow-sm">
            Product Management &amp; Enterprise RTM
          </div>

          <h1 className="font-sans font-extrabold text-[clamp(3rem,6.8vw,5.5rem)] leading-[1.02] tracking-tight mb-6 text-fg">
            Utkarsh Kumar<br />
            <span className="text-emerald-400 italic font-serif font-medium">Rajput</span>
          </h1>

          <p className="max-w-[580px] text-[clamp(1.05rem,1.35vw,1.25rem)] text-fg/85 leading-relaxed font-normal mb-8">
            Product Manager &amp; Business Analyst driving enterprise RTM rollouts, authoring comprehensive BRDs, managing Jira delivery pipelines, and shipping scalable SaaS products.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button
              asChild
              className="rounded-full px-8 py-6 text-[0.78rem] tracking-wider uppercase font-bold bg-emerald-400 text-black border border-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all duration-150 shadow-[0_0_25px_rgba(148,235,108,0.3)] cursor-none"
              data-cursor
            >
              <a href="#work" onClick={(e) => handleNavClick(e, "#work")}>
                Explore Featured Work
                <ArrowUpRight size={16} className="ml-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-8 py-6 text-[0.78rem] tracking-wider uppercase font-bold border border-white/20 bg-white/5 hover:bg-white/15 active:scale-95 transition-all duration-150 cursor-none"
              data-cursor
            >
              <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
                Get In Touch
              </a>
            </Button>
          </div>
        </div>

        {/* Right Column: Sleek Glassmorphic Radar Scope Widget */}
        <div className="lg:col-span-5">
          <div className="p-6 border border-white/20 dark:border-white/15 bg-white/10 dark:bg-white/[0.04] backdrop-blur-2xl rounded-3xl font-mono text-[0.78rem] text-fg shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Plane size={16} className="animate-pulse" />
                LIVE FLIGHT RADAR
              </div>
              <button
                onClick={loadFlights}
                className="flex items-center gap-1.5 text-[0.68rem] text-fg/70 hover:text-emerald-400 active:scale-90 transition-all font-bold"
                title="Refresh Live Flight Data"
              >
                <RefreshCw size={12} className={loadingFlights ? "animate-spin" : ""} />
                SYNC DATA
              </button>
            </div>

            {/* Flight Selector */}
            <div className="space-y-2">
              <span className="opacity-70 text-[0.68rem] uppercase font-bold">Select Active Flight:</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {flights.map((f) => (
                  <button
                    key={f.icao}
                    onClick={() => setSelectedFlight(f)}
                    className={`px-3 py-1.5 rounded-xl border text-[0.7rem] uppercase font-bold transition-all shrink-0 ${
                      selectedFlight?.icao === f.icao
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(148,235,108,0.2)]"
                        : "border-white/15 bg-white/5 text-fg/80 hover:border-white/30"
                    }`}
                  >
                    {f.callsign}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Flight Live Telemetry Display */}
            {selectedFlight && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/15">
                  <div>
                    <span className="opacity-60 text-[0.62rem] block uppercase font-bold">Callsign / Country</span>
                    <span className="font-extrabold text-[0.95rem] text-fg">{selectedFlight.callsign}</span>
                    <span className="text-emerald-400 text-[0.68rem] block truncate font-bold">{selectedFlight.country}</span>
                  </div>
                  <div>
                    <span className="opacity-60 text-[0.62rem] block uppercase font-bold">Transponder</span>
                    <span className="text-amber-400 font-extrabold text-[0.95rem]">{selectedFlight.squawk}</span>
                    <span className="opacity-60 text-[0.68rem] block font-bold">MODE-S ADS-B</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/15">
                    <span className="opacity-60 text-[0.6rem] block uppercase font-bold">Altitude</span>
                    <span className="text-emerald-400 font-extrabold text-[0.85rem]">{selectedFlight.altitudeFt.toLocaleString()} FT</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/15">
                    <span className="opacity-60 text-[0.6rem] block uppercase font-bold">Airspeed</span>
                    <span className="font-extrabold text-[0.85rem] text-fg">{selectedFlight.speedKts} KTS</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/15">
                    <span className="opacity-60 text-[0.6rem] block uppercase font-bold">Heading</span>
                    <span className="text-amber-400 font-extrabold text-[0.85rem]">{selectedFlight.heading}°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Radar Scope */}
            <div className="relative w-full h-24 bg-black/40 border border-white/15 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 border border-white/10 rounded-full scale-75" />
              <div className="absolute inset-0 border border-white/10 rounded-full scale-50" />
              <div className="absolute w-full h-[1px] bg-white/10" />
              <div className="absolute h-full w-[1px] bg-white/10" />
              
              <div
                className="absolute w-1/2 h-1/2 origin-top-left bg-gradient-to-r from-emerald-500/30 to-transparent"
                style={{ animation: "spin 4s linear infinite" }}
              />

              <div className="relative z-10 flex items-center gap-2 text-emerald-400 text-[0.72rem] font-extrabold">
                <Compass className="animate-spin text-emerald-400" size={14} />
                <span>RADAR TARGET LOCKED // {selectedFlight?.callsign || "AIRBORNE"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
