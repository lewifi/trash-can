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

  return (
    <div className="border-b border-gray-900 bg-black/40">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2 overflow-x-auto no-scrollbar text-[11px] font-mono-tech text-gray-400 whitespace-nowrap">
        <span className="flex items-center gap-1.5 text-emerald-300/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {fmt(buried)} mourners through the gate
        </span>
        {realRequests !== null && (
          <>
            <span className="text-gray-700">•</span>
            <span className="text-sky-400/80">
              {fmt(realRequests)} requests served{windowLabel && ` (${windowLabel})`}
        