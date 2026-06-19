import { useEffect, useState } from "react";
import { Flame, Coins, Skull, Download, Link2, ArrowRight } from "lucide-react";

interface Roast {
  id: string;
  name: string;
  category: string;
  score: number;
  appraisal: string;
  postMortem: string;
  recyclingPlan: string;
}

/**
 * Standalone share page for a single AI roast (/roast/:id).
 * Pulls the saved roast by id and shows it as a shareable card with a CTA
 * back to the Roast Machine. These never live in the public landfill.
 */
export default function RoastPage() {
  const id = window.location.pathname.replace(/\/+$/, "").split("/").pop() || "";
  const [roast, setRoast] = useState<Roast | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/roasts/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setRoast(d);
        setStatus("ok");
      })
      .catch(() => setStatus("missing"));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-gray-200 scanlines flex flex-col items-center px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-fuchsia-950/15 via-cyan-950/5 to-transparent pointer-events-none" />

      {/* Brand bar */}
      <a href="/" className="relative flex items-center gap-2 mb-8 group">
        <div className="relative p-2 bg-gray-900 rounded-lg border border-gray-700/80">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 opacity-30 group-hover:opacity-100 transition-opacity blur" />
          <Flame className="w-6 h-6 text-fuchsia-400 relative z-10" />
        </div>
        <span className="font-mono-tech text-sm tracking-[0.3em] text-cyan-400 uppercase">The Roast Machine</span>
      </a>

      {status === "loading" && (
        <p className="text-gray-500 font-mono-tech text-sm animate-pulse mt-10">Reheating the roast…</p>
      )}

      {status === "missing" && (
        <div className="relative text-center mt-10 max-w-md">
          <Skull className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <h1 className="font-monument text-xl text-gray-300 mb-2">This roast has gone cold</h1>
          <p className="text-gray-500 text-sm mb-6">
            The link is broken or the roast expired. Fire up a fresh one instead.
          </p>
          <a
            href="/oracle"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white text-xs font-mono-tech font-bold uppercase py-2.5 px-5 rounded-lg transition"
          >
            Roast something <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {status === "ok" && roast && (
        <div className="relative w-full max-w-2xl animate-fade-in">
          <div className="bg-[#0b0f19] border border-cyan-400/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_45px_rgba(6,182,212,0.18)] ring-1 ring-cyan-400/20">
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-[0.3em]">
                {roast.category}
              </span>
              <span className="text-sm font-bold font-mono-tech text-red-400">{roast.score}/100</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-monument text-white leading-tight mb-5">
              {roast.name}
            </h1>

            <blockquote className="border-l-2 border-cyan-400/60 pl-4 mb-6">
              <p className="italic text-lg text-gray-100 leading-relaxed">“{roast.appraisal}”</p>
            </blockquote>

            {roast.postMortem && (
              <div className="mb-5">
                <span className="text-[10px] font-mono-tech text-red-400 uppercase tracking-widest block mb-1">
                  Autopsy Report
                </span>
                <p className="text-sm text-gray-400 leading-relaxed">{roast.postMortem}</p>
              </div>
            )}

            {roast.recyclingPlan && (
              <div className="bg-amber-950/15 border border-amber-500/20 rounded-lg p-4">
                <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5" /> The Pivot
                </span>
                <p className="text-sm text-amber-200/90 leading-relaxed">{roast.recyclingPlan}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center justify-center gap-1.5 bg-[#111827] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-mono-tech uppercase py-2.5 rounded-lg transition"
            >
              <Link2 className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy link"}
            </button>
            <a
              href={`/api/og/roast/${roast.id}`}
              download={`roast-${roast.id}.png`}
              className="flex items-center justify-center gap-1.5 bg-[#111827] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-mono-tech uppercase py-2.5 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" /> Download card
            </a>
            <a
              href="/oracle"
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white text-xs font-mono-tech font-bold uppercase py-2.5 rounded-lg transition shadow-[0_0_16px_rgba(217,70,239,0.35)]"
            >
              Roast your own <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
