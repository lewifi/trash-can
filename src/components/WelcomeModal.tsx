import { useState, useEffect } from "react";
import { Star, Compass, X, Sparkles } from "lucide-react";

/**
 * Lightweight first-visit welcome. One screen, skippable, shown once per browser.
 * Job: get newcomers to the lowest-effort fun thing (the Roast Oracle) fast, and
 * dangle the mystery — a blurred glimpse of the secret world + an obscured clue —
 * so the curious have a reason to stick around and dig. Deliberately cryptic:
 * it teases the hidden hunt without explaining how to start it.
 */
export default function WelcomeModal({
  onRoast,
  onExplore,
  primaryLabel = "Roast someone",
  hideSecondary = false,
}: {
  onRoast: () => void;
  onExplore: () => void;
  /** Label for the primary button (e.g. "See the roast →" on a shared card). */
  primaryLabel?: string;
  /** Hide the "wander the graveyard" secondary button (e.g. on the roast card). */
  hideSecondary?: boolean;
}) {
  // Fade the dim layer in on mount, and out briefly before the parent unmounts us.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    // Double rAF so the browser paints the opacity-0 frame before we flip to
    // opacity-100 — otherwise the fade-in gets skipped.
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setShown(true)); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, []);
  const close = (action: () => void) => {
    setShown(false);
    window.setTimeout(action, 280);
  };
  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0b0f19] p-6 shadow-2xl neon-glow-cyan depth-top overflow-hidden">
        {/* close / skip */}
        <button
          onClick={() => close(onExplore)}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-100 hover:bg-gray-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[10px] font-mono-tech tracking-[3px] uppercase text-cyan-400/80 mb-2">
          Welcome to the graveyard
        </div>
        <h2 className="text-2xl font-bold font-monument tracking-wide leading-tight mb-2 bg-gradient-to-r from-cyan-400 via-teal-200 to-red-400 bg-clip-text text-transparent">
          Dead projects rest here. The living get roasted.
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-5">
          Gawk at other people's wreckage, bury your own dead ideas — or, the fastest fun:
          feed a mate's name to the Oracle and watch it cook them.
        </p>

        {/* Primary + secondary CTAs */}
        <button
          onClick={() => close(onRoast)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-mono-tech text-sm font-bold uppercase tracking-wider text-black bg-gradient-to-r from-fuchsia-400 to-amber-300 shadow-[0_0_24px_rgba(217,70,239,0.5)] hover:brightness-110 transition"
        >
          <Star className="w-4 h-4" /> {primaryLabel}
        </button>
        {!hideSecondary && (
          <button
            onClick={() => close(onExplore)}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 mt-2 font-mono-tech text-xs uppercase tracking-wider text-gray-300 border border-gray-700 hover:bg-gray-900 hover:text-gray-100 transition"
          >
            <Compass className="w-4 h-4" /> Just wander the graveyard
          </button>
        )}

        {/* Mystery teaser: a blurred glimpse of the secret world + an obscured clue */}
        <div className="mt-5 pt-4 border-t border-gray-800">
          <div className="relative h-24 rounded-xl overflow-hidden border border-fuchsia-500/25">
            {/* Stylised glimpse of the secret world: neon sky, mountains and floating
                squares — deliberately NO creatures or gravestones, so the spooky payoff
                stays a surprise. Blurred to keep it a tease. */}
            <svg
              viewBox="0 0 200 96"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full scale-110"
              style={{ filter: "blur(4px)" }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ws-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#0b1233" />
                  <stop offset="0.62" stopColor="#2a1747" />
                  <stop offset="1" stopColor="#e0602e" />
                </linearGradient>
              </defs>
              <rect width="200" height="96" fill="url(#ws-sky)" />
              {/* low sun glow near the horizon */}
              <circle cx="150" cy="72" r="30" fill="#ffd23d" opacity="0.45" />
              {/* far mountain range */}
              <polygon points="0,74 40,46 80,70 120,40 160,66 200,44 200,96 0,96" fill="#1a1140" opacity="0.85" />
              {/* near mountain range */}
              <polygon points="0,84 30,64 70,84 110,60 150,82 200,62 200,96 0,96" fill="#0c0820" />
              {/* floating squares (the "echoes") — no ghouls, no stones */}
              <rect x="30" y="22" width="12" height="12" fill="#3df0ff" opacity="0.85" transform="rotate(45 36 28)" />
              <rect x="92" y="13" width="10" height="10" fill="#ff3df0" opacity="0.85" transform="rotate(45 97 18)" />
              <rect x="141" y="30" width="9" height="9" fill="#7dff8a" opacity="0.8" transform="rotate(45 145 34)" />
            </svg>
            {/* faint neon floor grid, also blurred */}
            <div
              className="absolute inset-0"
              style={{
                opacity: 0.35,
                filter: "blur(1.5px)",
                backgroundImage:
                  "linear-gradient(rgba(255,61,240,.25) 1px, transparent 1px)," +
                  "linear-gradient(90deg, rgba(61,240,255,.25) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-monument tracking-[5px] text-white/80 text-xs select-none text-center leading-tight">
                A HIDDEN<br />WORLD
              </span>
            </div>
            <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[9px] font-mono-tech uppercase tracking-widest text-fuchsia-200/80">
              <Sparkles className="w-3 h-3" /> a secret, hand-built world is buried in here
            </div>
          </div>

          {/* obscured clue — present but deliberately unreadable, to pique curiosity */}
          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono-tech text-fuchsia-300/70">
            <span
              className="px-2 py-1 rounded border border-dashed border-fuchsia-500/40 select-none text-fuchsia-200/80"
              style={{ filter: "blur(1.4px)" }}
              aria-hidden="true"
            >
              ▮▮▮ clue ▮ ▮▮
            </span>
            <span>follow the trail of clues and it opens a way down into that world. two places to pick up the trail: the bright button above, or somewhere among the graves — most people walk straight past both.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
