export interface LiveFlight {
  icao: string;
  callsign: string;
  country: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  speedKts: number;
  heading: number;
  verticalRateFpm: number;
  squawk: string;
}

const FALLBACK_FLIGHTS: LiveFlight[] = [
  { icao: "400a2b", callsign: "BAW257", country: "United Kingdom", latitude: 51.47, longitude: -0.45, altitudeFt: 34000, speedKts: 465, heading: 92, verticalRateFpm: 0, squawk: "7712" },
  { icao: "8002df", callsign: "AIC101", country: "India", latitude: 19.08, longitude: 72.87, altitudeFt: 38000, speedKts: 490, heading: 285, verticalRateFpm: 120, squawk: "4421" },
  { icao: "8961a4", callsign: "UAE502", country: "United Arab Emirates", latitude: 25.25, longitude: 55.36, altitudeFt: 36000, speedKts: 480, heading: 145, verticalRateFpm: 0, squawk: "3310" },
  { icao: "3c65a1", callsign: "DLH400", country: "Germany", latitude: 50.03, longitude: 8.57, altitudeFt: 32000, speedKts: 450, heading: 270, verticalRateFpm: -200, squawk: "1000" },
  { icao: "8400bc", callsign: "JAL005", country: "Japan", latitude: 35.76, longitude: 140.38, altitudeFt: 40000, speedKts: 510, heading: 60, verticalRateFpm: 0, squawk: "2204" },
  { icao: "4b1822", callsign: "SWR104", country: "Switzerland", latitude: 47.45, longitude: 8.54, altitudeFt: 35000, speedKts: 472, heading: 180, verticalRateFpm: 50, squawk: "5531" },
];

export async function fetchLiveFlightData(): Promise<LiveFlight[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Fetch live flights over Europe/Asia region box
    const endpoint = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "/api/opensky/states/all?lamin=10&lomin=60&lamax=55&lomax=120"
      : "https://opensky-network.org/api/states/all?lamin=10&lomin=60&lamax=55&lomax=120";

    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (data && Array.isArray(data.states) && data.states.length > 0) {
      const parsed: LiveFlight[] = data.states
        .slice(0, 15)
        .map((s: any) => ({
          icao: String(s[0] || "N/A"),
          callsign: String(s[1] || "FLIGHT").trim() || "LIVE-AC",
          country: String(s[2] || "International"),
          longitude: Number(s[5] || 0),
          latitude: Number(s[6] || 0),
          altitudeFt: Math.round(Number(s[7] || 10000) * 3.28084), // meters to feet
          speedKts: Math.round(Number(s[9] || 200) * 1.94384), // m/s to knots
          heading: Math.round(Number(s[10] || 0)),
          verticalRateFpm: Math.round(Number(s[11] || 0) * 196.85),
          squawk: String(s[14] || "2000"),
        }))
        .filter((f: LiveFlight) => f.callsign !== "LIVE-AC" && f.altitudeFt > 1000);

      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("OpenSky API fetch using fallback flight telemetry stream:", err);
  }

  return FALLBACK_FLIGHTS;
}
