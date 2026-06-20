/**
 * Full-page background "room": a faint vector perspective (floor grid receding
 * to a vanishing point + angled side walls) for a sense of depth, plus a few
 * slow rising mist particles for a spooky feel. Fixed, behind everything,
 * non-interactive.
 */
const VPX = 500;
const VPY = 300;

// Floor lines receding to the vanishing point.
const verticals = Array.from({ length: 13 }, (_, i) => {
  const x = i * (1000 / 12);
  return `M${x},700 L${VPX},${VPY}`;
});
// Perspective "depth" rails between the two outer floor lines.
const depthRails = [0.18, 0.34, 0.5, 0.66, 0.82].map((f) => {
  const lx = 0 + (VPX - 0) * f;
  const rx = 1000 + (VPX - 1000) * f;
  const y = 700 + (VPY - 700) * f;
  return `M${lx},${y} L${rx},${y}`;
});

const MIST = [
  { left: "8%", size: 120, delay: "0s", dur: "16s" },
  { left: "26%", size: 90, delay: "4s", dur: "20s" },
  { left: "47%", size: 150, delay: "8s", dur: "17s" },
  { left: "68%", size: 100, delay: "2s", dur: "22s" },
  { left: "86%", size: 130, delay: "11s", dur: "18s" },
];

export default function Atmosphere() {
  return (
    <div className="fixed inset-0 -z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.5]"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* angled side walls */}
        <polygon points="0,0 0,700 240,560 240,150" fill="rgba(217,70,239,0.035)" />
        <polygon points="1000,0 1000,700 760,560 760,150" fill="rgba(34,211,238,0.035)" />
        {/* back wall panel */}
        <rect x="240" y="150" width="520" height="410" fill="rgba(148,163,184,0.02)" />
        {/* floor perspective */}
        <g stroke="rgba(34,211,238,0.07)" strokeWidth="1" fill="none">
          {verticals.map((d, i) => (
            <path key={`v${i}`} d={d} />
          ))}
          {depthRails.map((d, i) => (
            <path key={`r${i}`} d={d} stroke="rgba(217,70,239,0.06)" />
          ))}
        </g>
      </svg>

      {MIST.map((m, i) => (
        <div
          key={i}
          className="mist-particle"
          style={{ left: m.left, width: m.size, height: m.size, animationDelay: m.delay, animationDuration: m.dur }}
        />
      ))}
    </div>
  );
}
