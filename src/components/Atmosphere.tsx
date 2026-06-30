/**
 * Full-page background "room": a faint vector perspective (floor grid receding
 * to a vanishing point + angled side walls) for a sense of depth, plus a few
 * slow rising mist particles for a spooky feel. Fixed, behind everything,
 * non-interactive.
 */
const VPX = 500;
const VPY = 300;

// Floor lines receding to the vanishing point. Foreground lifted by 5% (700 -> 665)
const verticals = Array.from({ length: 13 }, (_, i) => {
  const x = i * (1000 / 12);
  return `M${x},665 L${VPX},${VPY}`;
});
// Perspective "depth" rails between the two outer floor lines.
const depthRails = [0.18, 0.34, 0.5, 0.66, 0.82].map((f) => {
  const lx = 0 + (VPX - 0) * f;
  const rx = 1000 + (VPX - 1000) * f;
  const y = 665 + (VPY - 665) * f;
  return `M${lx},${y} L${rx},${y}`;
});

// Outlines of the side and back walls in perspective
const roomEdges = [
  "M0,0 L240,150",
  "M0,665 L240,560",
  "M240,150 L240,560",
  "M1000,0 L760,150",
  "M1000,665 L760,560",
  "M760,150 L760,560",
  "M240,150 L760,150",
  "M240,560 L760,560"
];

const PerspColors = [
  { stroke: "rgba(34,211,238,0.22)", shadow: "rgba(34,211,238,0.2)" },    // Cyan
  { stroke: "rgba(217,70,239,0.20)", shadow: "rgba(217,70,239,0.18)" },  // Fuchsia
  { stroke: "rgba(52,211,153,0.18)", shadow: "rgba(52,211,153,0.15)" },   // Emerald
  { stroke: "rgba(245,158,11,0.18)", shadow: "rgba(245,158,11,0.15)" },   // Amber
  { stroke: "rgba(56,189,248,0.20)", shadow: "rgba(56,189,248,0.18)" },  // Sky
  { stroke: "rgba(248,113,113,0.20)", shadow: "rgba(248,113,113,0.18)" }, // Red/Rose
];

const getLineStyle = (idx: number, isVertical: boolean) => {
  const seed = idx + (isVertical ? 5 : 12);
  const colorIndex = seed % PerspColors.length;
  const color = PerspColors[colorIndex];
  
  const duration = `${(3.0 + (seed * 1.13) % 4.5).toFixed(2)}s`;
  const delay = `${((seed * 1.47) % 3.5).toFixed(2)}s`;
  
  return {
    stroke: color.stroke,
    filter: `drop-shadow(0 0 3px ${color.shadow})`,
    animation: `subtle-flicker ${duration} linear infinite`,
    animationDelay: delay,
  };
};

const DUST_PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const left = `${((i * 17) % 95) + 2.5}%`; // Distributed horizontally
  const size = `${((i * 7) % 5) + 3}px`;      // 3px to 7px
  const delay = `${((i * 1.3) % 15).toFixed(1)}s`;
  const duration = `${(((i * 2.7) % 10) + 12).toFixed(1)}s`;
  const animationName = i % 2 === 0 ? "dust-float" : "dust-float-alt";
  return { left, size, delay, duration, animationName };
});

export default function Atmosphere() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full opacity-90"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* angled side walls */}
        <polygon points="0,0 0,665 240,560 240,150" fill="rgba(217,70,239,0.08)" />
        <polygon points="1000,0 1000,665 760,560 760,150" fill="rgba(34,211,238,0.08)" />
        {/* back wall panel */}
        <rect x="240" y="150" width="520" height="410" fill="rgba(148,163,184,0.045)" />
        {/* floor perspective */}
        <g strokeWidth="1" fill="none">
          {verticals.map((d, i) => (
            <path key={`v${i}`} d={d} style={getLineStyle(i, true)} />
          ))}
          {depthRails.map((d, i) => (
            <path key={`r${i}`} d={d} style={getLineStyle(i, false)} />
          ))}
        </g>
        {/* structural wireframe room edges */}
        <g strokeWidth="1.5" fill="none">
          {roomEdges.map((d, i) => (
            <path key={`edge${i}`} d={d} style={getLineStyle(i + 20, false)} />
          ))}
        </g>
      </svg>

      {DUST_PARTICLES.map((d, i) => (
        <div
          key={i}
          className="dust-particle"
          style={{
            left: d.left,
            width: d.size,
            height: d.size,
            animationName: d.animationName,
            animationDuration: d.duration,
            animationDelay: d.delay,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite"
          }}
        />
      ))}
    </div>
  );
}
