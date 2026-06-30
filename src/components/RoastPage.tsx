import { useEffect, useState } from "react";
import { Flame, Coins, Skull, Download, Link2, ArrowRight, Share2, Compass } from "lucide-react";
import WelcomeModal from "./WelcomeModal";

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
  // Who sent this (for the revenge button). Carried as ?from= on the share link.
  let from = "";
  try { from = new URLSearchParams(window.location.search).get("from") || ""; } catch { /* none */ }
  const [roast, setRoast] = useState<Roast | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");
  const [copied, setCopied] = useState(false);
  // First-visit welcome — shown once per browser, on WHATEVER page you land on.
  // Shares the same key as the main app so people only ever see it once.
  const [showWelcome, setShowWelcome] = useState(false);
  // Open by default so newcomers get the brief "what is this place" without a tap.
  const [tourOpen, setTourOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/roasts/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setRoast(d);
        setStatus("ok");
      })
      .catch(() => setStatus("missing"));
  }, [id]);

  useEffect(() => {
    // Let the roast they came for register first, then welcome the newcomer.
    let seen = true;
    try { seen = localStorage.getItem("rg_welcome_seen") === "1"; } catch {}
    if (seen) return;
    const t = window.setTimeout(() => setShowWelcome(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  // On the shared card the welcome only TEASES — closing it reveals the roast their
  // mate got. The card's own featured "Let's go roast someone" button sends them off
  // after, so the modal never yanks them away from the thing they came to see.
  const dismissWelcome = () => {
    setShowWelcome(false);
    try { localStorage.setItem("rg_welcome_seen", "1"); } catch {}
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Forward via the native OS share sheet; fall back to copying the link.
  const forwardToFriend = () => {
    const url = window.location.href;
    const text = "You've got to try this 😈 — your turn on the Roast Oracle, go roast someone.";
    if (navigator.share) {
      navigator.share({ title: "The Roast Machine", text, url }).catch(() => {});
    } else {
      copyLink();
    }
  };

  // Your turn → drop into the Oracle (sender pre-filled as a suggested target).
  const revengeHref = from
    ? `/roastoracle?target=${encodeURIComponent(from)}`
    : "/roastoracle";

  return (
    <div className="relative min-h-screen bg-[#030712] text-gray-200 scanlines flex flex-col items-center px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-fuchsia-950/15 via-cyan-950/5 to-transparent pointer-events-none" />

      {/* Header bar: brand + an always-visible invite to roast */}
      <div className="relative w-full max-w-2xl flex items-center justify-between gap-3 mb-8">
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative p-2 bg-gray-900 rounded-lg border border-gray-700/80">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 opacity-30 group-hover:opacity-100 transition-opacity blur" />
            <Flame className="w-6 h-6 text-fuchsia-400 relative z-10" />
          </div>
          <span className="font-mono-tech text-sm tracking-[0.3em] text-cyan-400 uppercase">The Roast Machine</span>
        </a>
        <a
          href={revengeHref}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white text-[11px] font-mono-tech font-bold uppercase py-2 px-3 rounded-lg transition shadow-[0_0_14px_rgba(217,70,239,0.35)] whitespace-nowrap"
        >
          <Flame className="w-3.5 h-3.5" /> Roast someone
        </a>
      </div>

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
            href="/roastoracle"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white text-xs font-mono-tech font-bold uppercase py-2.5 px-5 rounded-lg transition"
          >
            Roast something <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {status === "ok" && roast && (
        <div className="relative w-full max-w-2xl animate-fade-in">
          <div className="bg-[#0b0f19] border border-cyan-400/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_45px_rgba(6,182,212,0.18)] ring-1 ring-cyan-400/20 depth-top">
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-[0.3em]">
                {roast.category}
              </span>
              <span className="text-sm font-bold font-mono-tech text-red-400">{Math.round(roast.score)}/100</span>
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
                  The Deep Cut
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
          <div className="mt-4 space-y-2">
            {/* Featured CTA — the whole point: go roast someone yourself */}
            <a
              href={revengeHref}
              className="block rounded-xl bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20 border border-fuchsia-500/40 p-4 text-center hover:border-fuchsia-400 transition group"
            >
              <p className="text-base font-bold text-white">Think you'd survive the Oracle? 😈</p>
              <p className="text-[11px] text-gray-300 mt-0.5 mb-3">Pick anyone, sign your name, and find out.</p>
              <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-cyan-600 group-hover:from-fuchsia-500 group-hover:to-cyan-500 text-white text-sm font-mono-tech font-bold uppercase py-2.5 px-5 rounded-lg transition shadow-[0_0_16px_rgba(217,70,239,0.35)]">
                <Flame className="w-4 h-4" /> Let's go roast someone <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <p className="text-[10px] text-fuchsia-300/80 mt-3 font-mono-tech">🗺️ Psst — finishing a roast unlocks Clue 1 of a hidden adventure…</p>
            </a>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={forwardToFriend}
                className="flex items-center justify-center gap-1.5 bg-[#111827] border border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-300 text-xs font-mono-tech uppercase py-2.5 rounded-lg transition"
              >
                <Share2 className="w-3.5 h-3.5" /> Forward to a friend
              </button>
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
            </div>
          </div>

          {/* Hook: send the newcomer digging into the hidden hunt instead of bouncing */}
          <a
            href="/memorials"
            className="mt-3 block rounded-lg bg-gradient-to-r from-fuchsia-950/40 to-amber-950/30 border border-fuchsia-500/30 p-3 text-center hover:border-fuchsia-400/60 transition"
          >
            <p className="text-[11px] text-fuchsia-200 font-mono-tech leading-relaxed">
              🗺️ Psst — a hidden clue adventure is buried among these graves, and it ends in a surprise.
            </p>
            <p className="text-[11px] text-fuchsia-300 font-bold mt-1">Start digging →</p>
          </a>

          {/* Easy ways to keep exploring instead of closing the tab */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-mono-tech">
            <a href="/memorials" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline">
              <Compass className="w-3.5 h-3.5" /> Wander the graveyard
            </a>
            <span className="text-gray-700">·</span>
            <a href="/" className="text-cyan-400 hover:text-cyan-300 hover:underline">Explore trash-can.net</a>
          </div>

          {/* Persistent intro — dangles the tech-roast graveyard as the thing to explore after roasting */}
          <div className="mt-4 rounded-xl border border-gray-800 bg-[#0a0e17] overflow-hidden">
            <button
              type="button"
              onClick={() => setTourOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-mono-tech uppercase tracking-wider text-cyan-300 hover:bg-gray-900/40 transition"
            >
              <span className="inline-flex items-center gap-2"><Compass className="w-4 h-4" /> New here? What is this place?</span>
              <span className="text-gray-500">{tourOpen ? "−" : "+"}</span>
            </button>
            {tourOpen && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 text-[12px] text-gray-300 leading-relaxed border-t border-gray-800">
                <p>🔥 <strong className="text-fuchsia-200">The Roast Oracle</strong> — name anyone and it cooks them alive. You just saw what it does to a mate.</p>
                <a href="/memorials" className="block hover:text-cyan-200 transition">⚰️ <strong className="text-cyan-200">The Graveyard</strong> — a cemetery of dead software projects, each one handed a brutal AI autopsy. Read the tech roasts and gawk at the wreckage →</a>
                <p>🗺️ <strong className="text-amber-200">A hidden clue adventure</strong> threads quietly through the site — and it ends somewhere most people never find.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showWelcome && (
        <WelcomeModal
          onRoast={dismissWelcome}
          onExplore={dismissWelcome}
          primaryLabel="See the roast →"
          hideSecondary
        />
      )}
    </div>
  );
}
