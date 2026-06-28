import { useEffect, useState } from "react";

/**
 * Thin "site is alive" activity bar: gently ticking fake-but-plausible stats,
 * plus quiet teasers for the hidden leaderboard / quiz. Pure vibes, client-side.
 */
export default function LiveTicker() {
  const [buried, setBuried] = useState(1944);
  const [roasted, setRoasted] = useState(453);
  const [venting, setVenting] = useState(19);

  useEffect(() => {
    const t = setInterval(() => {
      setBuried((n) => n + (Math.random() < 0.45 ? 1 : 0));
      setRoasted((n) => n + (Math.random() < 0.6 ? 1 : 0));
      setVenting((n) => Math.max(3, Math.min(99, n + (Math.random() < 0.5 ? 1 : -1))));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="border-b border-gray-900 bg-black/40">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2 overflow-x-auto no-scrollbar text-[11px] font-mono-tech text-gray-400 whitespace-nowrap">
        <span className="flex items-center gap-1.5 text-emerald-300/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {fmt(buried)} mourners through the gate
        </span>
        <span className="text-gray-700">•</span>
        <span className="text-cyan-400/80">{fmt(roasted)} roasted today</span>
        <span className="text-gray-700">•</span>
        <span className="text-red-400/80">{venting} souls venting now</span>
        <span className="text-gray-700">•</span>
        <span className="text-amber-400/80">🏆 1 has escaped the hunt</span>
        <span className="text-gray-700">•</span>
        <span className="text-fuchsia-400/70">🗺️ a clue adventure is hidden somewhere…</span>
      </div>
    </div>
  );
}
