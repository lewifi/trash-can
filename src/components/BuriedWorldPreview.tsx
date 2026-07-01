/**
 * A deliberately soft, slightly-blurred glimpse of the buried world — a blue night
 * sky, mountains, and floating "dotty lights". No church, gravestones, or creatures,
 * so what's actually down there stays a mystery. Shown only deep in the hunt (the
 * Cloudflare grave's Clue 2 reveal), never up front to first-time visitors.
 */
export default function BuriedWorldPreview({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-28 rounded-xl overflow-hidden border border-cyan-500/25 ${className}`}>
      <svg
        viewBox="0 0 200 112"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full scale-105"
        style={{ filter: "blur(2.5px)" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#071233" />
            <stop offset="0.55" stopColor="#122a63" />
            <stop offset="1" stopColor="#21467e" />
          </linearGradient>
          <radialGradient id="bw-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8fd0ff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#8fd0ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="112" fill="url(#bw-sky)" />
        <ellipse cx="120" cy="84" rx="78" ry="26" fill="url(#bw-glow)" />
        {/* mountains */}
        <polygon points="0,84 34,56 70,80 108,50 150,78 200,54 200,112 0,112" fill="#16265a" />
        <polygon points="0,94 40,72 82,92 120,68 165,90 200,72 200,112 0,112" fill="#0b1740" />
        {/* dotty lights (bright haloed ones = the far-off echoes; small = fireflies) */}
        <g>
          <circle cx="34" cy="48" r="7.5" fill="#3df0ff" opacity="0.25" /><circle cx="34" cy="48" r="3" fill="#8ff6ff" />
          <circle cx="120" cy="38" r="7" fill="#ff8fe0" opacity="0.25" /><circle cx="120" cy="38" r="2.6" fill="#ffb8ee" />
          <circle cx="176" cy="54" r="6.5" fill="#9dffb0" opacity="0.25" /><circle cx="176" cy="54" r="2.4" fill="#c7ffce" />
          <circle cx="64" cy="62" r="1.8" fill="#ffe08a" /><circle cx="150" cy="66" r="1.8" fill="#8fd0ff" />
          <circle cx="20" cy="68" r="1.5" fill="#ffd23d" /><circle cx="96" cy="54" r="1.5" fill="#c9a0ff" />
          <circle cx="186" cy="44" r="1.4" fill="#3df0ff" /><circle cx="52" cy="40" r="1.3" fill="#ff8fe0" />
          <circle cx="138" cy="50" r="1.2" fill="#9dffb0" />
        </g>
      </svg>
      <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[9px] font-mono-tech uppercase tracking-widest text-cyan-100/90 drop-shadow">
        a glimpse of what's buried below…
      </div>
    </div>
  );
}
