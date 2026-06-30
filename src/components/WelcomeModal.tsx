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
}: {
  onRoast: () => void;
  onExplore: () => void;
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
          <Star className="w-4 h-4" /> Roast someone
        </button>
        <button
          onClick={() => close(onExplore)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 mt-2 font-mono-tech text-xs uppercase tracking-wider text-gray-300 border border-gray-700 hover:bg-gray-900 hover:text-gray-100 transition"
        >
          <Compass className="w-4 h-4" /> Just wander the graveyard
        </button>

        {/* Mystery teaser: a blurred glimpse of the secret world + an obscured clue */}
        <div className="mt-5 pt-4 border-t border-gray-800">
          <div className="relative h-24 rounded-xl overflow-hidden border border-fuchsia-500/25">
            {/* blurred neon "world" — evokes the secret WebGL graveyard without spoiling it */}
            <div
              className="absolute inset-0 scale-110"
              style={{
                filter: "blur(4px)",
                background:
                  "radial-gradient(circle at 22% 38%, #ff3df0 0, transparent 46%)," +
                  "radial-gradient(circle at 78% 62%, #3df0ff 0, transparent 46%)," +
                  "radial-gradient(circle at 55% 28%, #ffd23d 0, transparent 40%)," +
                  "radial-gradient(circle at 40% 80%, #7dff8a 0, transparent 42%)," +
                  "linear-gradient(#0b0616, #1a0b2e)",
              }}
            />
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
