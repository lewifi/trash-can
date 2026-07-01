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
          <div className="relative h-32 rounded-xl overflow-hidden border border-fuchsia-500/25">
            {/* A clear look at the buried world — a neon graveyard at sunrise: mountains,
                a haunted sea, a glowing floor grid, the old church, and the three echoes. */}
            <svg
              viewBox="0 0 200 128"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ws-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#0a1030" />
                  <stop offset="0.5" stopColor="#2a1747" />
                  <stop offset="0.82" stopColor="#7a2e52" />
                  <stop offset="1" stopColor="#e0602e" />
                </linearGradient>
                <radialGradient id="ws-sun" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#ffe8a0" />
                  <stop offset="0.5" stopColor="#ffd23d" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#ffd23d" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="200" height="128" fill="url(#ws-sky)" />
              {/* sun */}
              <circle cx="150" cy="88" r="42" fill="url(#ws-sun)" />
              <circle cx="150" cy="88" r="11" fill="#ffe8a0" />
              {/* mountains */}
              <polygon points="0,88 34,58 70,84 108,52 150,80 200,56 200,128 0,128" fill="#241a3a" />
              <polygon points="0,98 40,76 82,96 120,72 165,94 200,76 200,128 0,128" fill="#140c26" />
              {/* haunted sea */}
              <rect y="98" width="200" height="10" fill="#0a1f3a" opacity="0.92" />
              <rect y="98" width="200" height="1.5" fill="#3df0ff" opacity="0.3" />
              {/* neon ground + perspective grid */}
              <rect y="108" width="200" height="20" fill="#0c0716" />
              <g stroke="#ff3df0" strokeWidth="0.4" opacity="0.5">
                <line x1="-10" y1="128" x2="78" y2="108" /><line x1="38" y1="128" x2="90" y2="108" />
                <line x1="100" y1="128" x2="100" y2="108" /><line x1="162" y1="128" x2="110" y2="108" />
                <line x1="210" y1="128" x2="122" y2="108" />
              </g>
              <g stroke="#3df0ff" strokeWidth="0.4" opacity="0.4">
                <line x1="0" y1="114" x2="200" y2="114" /><line x1="0" y1="121" x2="200" y2="121" />
              </g>
              {/* old church silhouette with lit door + steeple + cross */}
              <g transform="translate(84,68)" fill="#0a0614">
                <rect x="0" y="14" width="30" height="26" />
                <polygon points="-2,14 15,2 32,14" />
                <rect x="12" y="-6" width="6" height="20" />
                <polygon points="11,-6 15,-14 19,-6" />
                <rect x="14.2" y="-20" width="1.6" height="6" /><rect x="12" y="-18" width="6" height="1.6" />
                <rect x="12.5" y="24" width="5" height="16" fill="#ffcf6a" opacity="0.9" />
              </g>
              {/* the three glowing echoes */}
              <g>
                <circle cx="34" cy="54" r="9" fill="#3df0ff" opacity="0.35" />
                <rect x="30" y="50" width="8" height="8" fill="#3df0ff" transform="rotate(45 34 54)" />
                <circle cx="120" cy="42" r="8" fill="#ff3df0" opacity="0.35" />
                <rect x="116.5" y="38.5" width="7" height="7" fill="#ff3df0" transform="rotate(45 120 42)" />
                <circle cx="176" cy="60" r="7" fill="#7dff8a" opacity="0.35" />
                <rect x="173" y="57" width="6" height="6" fill="#7dff8a" transform="rotate(45 176 60)" />
              </g>
              {/* fireflies */}
              <g fill="#ffd23d" opacity="0.85">
                <circle cx="60" cy="46" r="0.8" /><circle cx="96" cy="62" r="0.8" /><circle cx="140" cy="54" r="0.8" />
                <circle cx="20" cy="72" r="0.8" /><circle cx="186" cy="42" r="0.8" /><circle cx="74" cy="90" r="0.8" />
              </g>
            </svg>
            <div className="absolute top-1.5 left-2 flex items-center gap-1.5 text-[9px] font-mono-tech uppercase tracking-widest text-fuchsia-100/90 drop-shadow">
              <Sparkles className="w-3 h-3" /> the buried world — find your way in
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
