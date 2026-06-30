import { useEffect, useState } from "react";

/**
 * Thin "site is alive" activity bar.
 *
 * Visitors + requests are REAL numbers from Cloudflare's GraphQL Analytics API
 * (via /api/stats, cached server-side). Until that's configured — or if the
 * call fails — it falls back to gently ticking fake-but-plausible figures so
 * the bar never looks dead. Roasted/venting remain cosmetic vibes.
 */
export default function LiveTicker() {
  // Cosmetic fallback for the visitor count: a randomised boost so it never
  // sits at a flat number before (or without) real Cloudflare data.
  const [buried, setBuried] = useState(() => 1944 + Math.floor(250 + Math.random() * 750));
  const [roasted, setRoasted] = useState(453);
  const [venting, setVenting] = useState(19);

  // Real figures from Cloudflare (null until loaded / if unavailable).
  const [realVisitors, setRealVisitors] = useState<number | null>(null);
  const [realRequests, setRealRequests] = useState<number | null>(null);
  const [windowDays, setWindowDays] = useState<number | null>(null);
  // How many have actually finished the hunt (real leaderboard entries).
  const [escaped, setEscaped] = useState<number | null>(null);

  // Pull real stats on mount, then refresh every 5 min (matches server cache).
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = (await res.json()) as {
            configured?: boolean;
            uniques?: number;
            requests?: number;
            windowDays?: number;
          };
          if (alive && data?.configured) {
            if (typeof data.uniques === "number") {
              setRealVisitors(data.uniques);
              setBuried(data.uniques); // keep the cosmetic drift in sync with reality
            }
            if (typeof data.requests === "number") setRealRequests(data.requests);
            if (typeof data.windowDays === "number") setWindowDays(data.windowDays);
          }
        }
      } catch {
        /* leave the cosmetic fallback in place */
      }
      try {
        const lb = await fetch("/api/leaderboard");
        if (lb.ok) {
          const arr = await lb.json();
          if (alive && Array.isArray(arr)) setEscaped(arr.length);
        }
      } catch {
        /* keep the baseline count */
      }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // Gentle live drift. The visitor count only drifts while we're on the
  // cosmetic fallback; once real data is in, it stays accurate between refreshes.
  useEffect(() => {
    const t = setInterval(() => {
      if (realVisitors === null) {
        setBuried((n) => n + (Math.random() < 0.45 ? 1 : 0));
      }
      setRoasted((n) => n + (Math.random() < 0.6 ? 1 : 0));
      setVenting((n) => Math.max(3, Math.min(99, n + (Math.random() < 0.5 ? 1 : -1))));
    }, 3500);
    return () => clearInterval(t);
  }, [realVisitors]);

  const fmt = (n: number): string => n.toLocaleString();
  const windowLabel =
    windowDays === null ? "" : windowDays >= 365 ? "all-time" : `${windowDays}d`;
  // Real count of hunt finishers, with a floor of 1 so the legend always reads
  // like at least one soul got out.
  const escapedN = Math.max(1, escaped ?? 1);

  const tickerContent = (
    <>
      <span className="flex items-center gap-1.5 text-emerald-400 font-mono-tech tracking-wider led-glow-emerald">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {fmt(buried)} MOURNERS THROUGH THE GATE
      </span>
      <span className="text-gray-800 font-mono-tech select-none">•</span>
      {realRequests !== null && (
        <>
          <span className="text-sky-400 font-mono-tech tracking-wider led-glow-sky">
            {fmt(realRequests)} REQUESTS SERVED{windowLabel && ` (${windowLabel})`}
          </span>
          <span className="text-gray-800 font-mono-tech select-none">•</span>
        </>
      )}
      <span className="text-cyan-400 font-mono-tech tracking-wider led-glow-cyan">
        {fmt(roasted)} ROASTED TODAY
      </span>
      <span className="text-gray-800 font-mono-tech select-none">•</span>
      <span className="text-red-400 font-mono-tech tracking-wider led-glow-red">
        {venting} SOULS VENTING NOW
      </span>
      <span className="text-gray-800 font-mono-tech select-none">•</span>
      <span className="text-amber-400 font-mono-tech tracking-wider led-glow-amber">
        🏆 {escapedN} {escapedN === 1 ? "HAS" : "HAVE"} ESCAPED THE HUNT
      </span>
      <span className="text-gray-800 font-mono-tech select-none">•</span>
      <span className="text-fuchsia-400 font-mono-tech tracking-wider led-glow-fuchsia">
        🗺️ A CLUE ADVENTURE IS HIDDEN SOMEWHERE…
      </span>
      <span className="text-gray-800 font-mono-tech select-none">•</span>
      <span className="text-teal-400 font-mono-tech tracking-wider led-glow-teal">
        🛠️ BUILT & UPDATED OBSESSIVELY — PEEK THE YARD NOTES
      </span>
    </>
  );

  return (
    <div className="relative border-y border-gray-950 bg-black/90 py-2.5 overflow-hidden select-none group w-full animate-subtle-flicker">
      {/* LED dot matrix subpixel overlay */}
      <div className="absolute inset-0 led-matrix-overlay pointer-events-none z-10 opacity-40" />
      
      {/* LED gloss reflection effect */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10 pointer-events-none z-15" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/5 pointer-events-none z-15" />

      {/* Marquee tracks */}
      <div className="flex w-full overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex shrink-0 items-center gap-16 min-w-full pr-16 text-[11px] uppercase group-hover:[animation-play-state:paused] transition-all duration-300">
          {tickerContent}
          <span className="text-gray-800 font-mono-tech select-none">•</span>
        </div>
        <div className="animate-marquee flex shrink-0 items-center gap-16 min-w-full pr-16 text-[11px] uppercase group-hover:[animation-play-state:paused] transition-all duration-300" aria-hidden="true">
          {tickerContent}
          <span className="text-gray-800 font-mono-tech select-none">•</span>
        </div>
      </div>
    </div>
  );
}
