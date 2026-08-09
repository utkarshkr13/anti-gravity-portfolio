import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Compass, Radio, RefreshCw } from "lucide-react";
import { fetchLiveFlightData, type LiveFlight } from "@/services/flightApi";

export function Hero({ showText }: { showText: boolean }) {
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [localTime, setLocalTime] = useState("");

  // Live Local Time
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLocalTime(d.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live OpenSky Aviation Data
  const loadFlights = async () => {
    setLoadingFlights(true);
    const data = await fetchLiveFlightData();
    setFlights(data);
    if (data.length > 0) setSelectedFlight(data[0]);
    setLoadingFlights(false);
  };

  useEffect(() => {
    loadFlights();
    const interval = setInterval(loadFlights, 30000); // 30s auto-refresh
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
      {/* Top Telemetry Header Bar */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/20 bg-black/40 backdrop-blur-xl rounded-2xl mb-10 font-mono text-[0.75rem] tracking-wider uppercase text-white shadow-2xl">
        <div className="flex flex-col border-r border-white/15 pr-4">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">Local Deck Time</span>
          <span className="text-emerald-400 font-bold text-[0.88rem] tabular-nums">{localTime || "--:--:--"}</span>
        </div>
        <div className="flex flex-col md:border-r border-white/15 pr-4">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">OpenSky Network Uplink</span>
          <span className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE ADS-B FEED
          </span>
        </div>
        <div className="flex flex-col border-r border-white/15 pr-4">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">Airborne Trackers</span>
          <span className="text-white font-bold tabular-nums text-[0.88rem]">
            {loadingFlights ? "FETCHING..." : `${flights.length} ACTIVE FLIGHTS`}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-[0.62rem] mb-1 font-bold">Deck Telemetry</span>
          <span className="text-amber-400 font-bold tabular-nums">JESKO AIR COCKPIT v4.2</span>
        </div>
      </div>

      {/* Main Kinetic Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">
        {/* Left Column: Bold Kinetic Typography */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[0.72rem] tracking-widest uppercase font-bold mb-6 w-fit">
            <Radio size={14} className="animate-pulse" />
            Product Management &amp; RTM Architecture
          </div>

          <h1 className="font-sans font-extrabold text-[clamp(2.8rem,6.8vw,5.5rem)] leading-[1.02] tracking-tight mb-6 text-white">
            Utkarsh Kumar<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-white">
              Rajput
            </span>
          </h1>

          <p className="max-w-[600px] text-[clamp(1rem,1.4vw,1.2rem)] text-gray-200 leading-relaxed font-normal mb-8">
            Specialized in leading cross-border RTM deployments, writing high-coverage BRDs, executing enterprise UAT sign-offs, and shipping high-impact SaaS platforms.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button
              asChild
              className="rounded-full px-8 py-6 text-[0.78rem] tracking-wider uppercase font-bold bg-emerald-400 text-black border border-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all duration-150 shadow-[0_0_25px_rgba(148,235,108,0.4)] cursor-none"
              data-cursor
            >
              <a href="#work" onClick={(e) => handleNavClick(e, "#work")}>
                Initialize Project Sprint →
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-8 py-6 text-[0.78rem] tracking-wider uppercase font-bold border border-white/25 text-white bg-white/5 hover:bg-white/15 active:scale-95 transition-all duration-150 cursor-none"
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
          <div className="p-6 border border-white/20 bg-black/60 backdrop-blur-2xl rounded-3xl font-mono text-[0.78rem] text-white shadow-2xl space-y-5">
            {/* Header & Flight Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Plane size={16} className="animate-pulse" />
                LIVE FLIGHT RADAR
              </div>
              <button
                onClick={loadFlights}
                className="flex items-center gap-1.5 text-[0.68rem] text-gray-400 hover:text-emerald-400 active:scale-90 transition-all"
                title="Refresh Live Data"
              >
                <RefreshCw size={12} className={loadingFlights ? "animate-spin" : ""} />
                SYNC
              </button>
            </div>

            {/* Flight Selector */}
            <div className="space-y-2">
              <span className="text-gray-400 text-[0.68rem] uppercase font-bold">Select Active Aircraft:</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {flights.map((f) => (
                  <button
                    key={f.icao}
                    onClick={() => setSelectedFlight(f)}
                    className={`px-3 py-1.5 rounded-lg border text-[0.7rem] uppercase font-bold transition-all shrink-0 ${
                      selectedFlight?.icao === f.icao
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(148,235,108,0.3)]"
                        : "border-white/15 bg-white/5 text-gray-300 hover:border-white/40"
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
                <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <span className="text-gray-400 text-[0.62rem] block uppercase">Callsign / Origin</span>
                    <span className="text-white font-bold text-[0.9rem]">{selectedFlight.callsign}</span>
                    <span className="text-emerald-400 text-[0.65rem] block truncate">{selectedFlight.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[0.62rem] block uppercase">Squawk Code</span>
                    <span className="text-amber-400 font-bold text-[0.9rem]">{selectedFlight.squawk}</span>
                    <span className="text-gray-400 text-[0.65rem] block">MODE-S ADS-B</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-gray-400 text-[0.6rem] block uppercase">Altitude</span>
                    <span className="text-emerald-400 font-bold text-[0.82rem]">{selectedFlight.altitudeFt.toLocaleString()} FT</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-gray-400 text-[0.6rem] block uppercase">Speed</span>
                    <span className="text-white font-bold text-[0.82rem]">{selectedFlight.speedKts} KTS</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-gray-400 text-[0.6rem] block uppercase">Heading</span>
                    <span className="text-amber-300 font-bold text-[0.82rem]">{selectedFlight.heading}°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Radar Sweep Canvas Visualizer */}
            <div className="relative w-full h-24 bg-emerald-950/20 border border-emerald-500/20 rounded-xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-75" />
              <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-50" />
              <div className="absolute w-full h-[1px] bg-emerald-500/20" />
              <div className="absolute h-full w-[1px] bg-emerald-500/20" />
              
              {/* Radar Sweep Line */}
              <div
                className="absolute w-1/2 h-1/2 origin-top-left bg-gradient-to-r from-emerald-500/40 to-transparent"
                style={{ animation: "spin 4s linear infinite" }}
              />

              <div className="relative z-10 flex items-center gap-1.5 text-emerald-400 text-[0.68rem] font-bold">
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
