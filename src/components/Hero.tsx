import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Compass, RefreshCw, Zap } from "lucide-react";
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
      className={`relative min-h-screen flex flex-col justify-between select-none z-10 pt-28 pb-16 px-[6vw] transition-all duration-[1200ms] ease-out ${
        showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Top Jesko Telemetry Header Bar */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-[#D4AF37]/30 bg-black/70 backdrop-blur-2xl rounded-2xl mb-10 font-mono text-[0.75rem] tracking-wider uppercase text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col border-r border-white/15 pr-4">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">Local Deck Time</span>
          <span className="text-[#94EB6C] font-bold text-[0.88rem] tabular-nums">{localTime || "--:--:--"}</span>
        </div>
        <div className="flex flex-col md:border-r border-white/15 pr-4">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">OpenSky Network Uplink</span>
          <span className="text-[#D4AF37] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#94EB6C] animate-ping" />
            LIVE ADS-B FEED
          </span>
        </div>
        <div className="flex flex-col border-r border-white/15 pr-4">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">Airborne Trackers</span>
          <span className="text-white font-bold tabular-nums text-[0.88rem]">
            {loadingFlights ? "SYNCING..." : `${flights.length} LIVE AIRCRAFT`}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">Showroom Config</span>
          <span className="text-[#D4AF37] font-bold tabular-nums">JESKO LUXURY DECK v5.0</span>
        </div>
      </div>

      {/* Main Kinetic Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
        {/* Left Column: Jesko Bold Luxury Headline */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] font-mono text-[0.72rem] tracking-widest uppercase font-bold mb-6 w-fit shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Zap size={14} className="text-[#94EB6C]" />
            Senior Product Architect &amp; RTM Delivery
          </div>

          <h1 className="font-sans font-extrabold text-[clamp(3rem,7.2vw,6rem)] leading-[0.98] tracking-tight mb-6 text-white">
            Utkarsh Kumar<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#94EB6C]">
              Rajput
            </span>
          </h1>

          <p className="max-w-[620px] text-[clamp(1.05rem,1.4vw,1.25rem)] text-gray-200 leading-relaxed font-normal mb-8">
            Specialized in driving cross-border RTM deployments, authoring high-coverage BRDs, executing enterprise UAT sign-offs, and shipping mission-critical SaaS platforms.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button
              asChild
              className="rounded-full px-8 py-6 text-[0.78rem] tracking-wider uppercase font-bold bg-[#D4AF37] text-black border border-[#D4AF37] hover:bg-[#b89428] active:scale-95 transition-all duration-150 shadow-[0_0_30px_rgba(212,175,55,0.4)] cursor-none"
              data-cursor
            >
              <a href="#work" onClick={(e) => handleNavClick(e, "#work")}>
                Initialize Project Sprint →
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-8 py-6 text-[0.78rem] tracking-wider uppercase font-bold border border-white/30 text-white bg-white/5 hover:bg-white/15 active:scale-95 transition-all duration-150 cursor-none"
              data-cursor
            >
              <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
                Establish Uplink
              </a>
            </Button>
          </div>
        </div>

        {/* Right Column: Live OpenSky Radar & Aircraft HUD */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-6 border border-[#D4AF37]/40 bg-black/80 backdrop-blur-2xl rounded-3xl font-mono text-[0.78rem] text-white shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-5">
            {/* Header & Flight Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2 font-bold text-[#D4AF37]">
                <Plane size={16} className="text-[#94EB6C] animate-pulse" />
                LIVE OPENSPACE RADAR
              </div>
              <button
                onClick={loadFlights}
                className="flex items-center gap-1.5 text-[0.68rem] text-gray-300 hover:text-[#94EB6C] active:scale-90 transition-all font-bold"
                title="Refresh Live Data"
              >
                <RefreshCw size={12} className={loadingFlights ? "animate-spin" : ""} />
                SYNC DATA
              </button>
            </div>

            {/* Flight Selector Pills */}
            <div className="space-y-2">
              <span className="text-gray-300 text-[0.68rem] uppercase font-bold">Select Active Flight:</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {flights.map((f) => (
                  <button
                    key={f.icao}
                    onClick={() => setSelectedFlight(f)}
                    className={`px-3 py-1.5 rounded-lg border text-[0.7rem] uppercase font-bold transition-all shrink-0 ${
                      selectedFlight?.icao === f.icao
                        ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
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
                <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/15">
                  <div>
                    <span className="text-gray-400 text-[0.62rem] block uppercase font-bold">Callsign / Country</span>
                    <span className="text-white font-extrabold text-[0.95rem]">{selectedFlight.callsign}</span>
                    <span className="text-[#94EB6C] text-[0.68rem] block truncate font-bold">{selectedFlight.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[0.62rem] block uppercase font-bold">Squawk Transponder</span>
                    <span className="text-[#D4AF37] font-extrabold text-[0.95rem]">{selectedFlight.squawk}</span>
                    <span className="text-gray-300 text-[0.68rem] block font-bold">MODE-S ADS-B</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/15">
                    <span className="text-gray-400 text-[0.6rem] block uppercase font-bold">Altitude</span>
                    <span className="text-[#94EB6C] font-extrabold text-[0.85rem]">{selectedFlight.altitudeFt.toLocaleString()} FT</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/15">
                    <span className="text-gray-400 text-[0.6rem] block uppercase font-bold">Airspeed</span>
                    <span className="text-white font-extrabold text-[0.85rem]">{selectedFlight.speedKts} KTS</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/15">
                    <span className="text-gray-400 text-[0.6rem] block uppercase font-bold">Heading</span>
                    <span className="text-[#D4AF37] font-extrabold text-[0.85rem]">{selectedFlight.heading}°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Radar Scope Visualizer */}
            <div className="relative w-full h-24 bg-black/80 border border-[#D4AF37]/30 rounded-xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 border border-white/10 rounded-full scale-75" />
              <div className="absolute inset-0 border border-white/10 rounded-full scale-50" />
              <div className="absolute w-full h-[1px] bg-white/15" />
              <div className="absolute h-full w-[1px] bg-white/15" />
              
              <div
                className="absolute w-1/2 h-1/2 origin-top-left bg-gradient-to-r from-[#94EB6C]/40 to-transparent"
                style={{ animation: "spin 4s linear infinite" }}
              />

              <div className="relative z-10 flex items-center gap-2 text-[#94EB6C] text-[0.72rem] font-extrabold">
                <Compass className="animate-spin text-[#94EB6C]" size={14} />
                <span>RADAR TARGET LOCKED // {selectedFlight?.callsign || "AIRBORNE"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
