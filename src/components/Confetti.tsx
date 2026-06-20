import { useEffect, useState } from "react";

const COLORS = [
  "#f0abfc", "#e879f9", "#c084fc", // fuchsia / purple
  "#22d3ee", "#38bdf8",             // cyan / sky
  "#a3e635", "#86efac",             // lime / green
  "#fbbf24", "#fb923c",             // amber / orange
  "#f472b6", "#fb7185",             // pink / rose
  "#818cf8",                        // indigo
];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  rect: boolean;
}

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    setParticles(
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 9,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.4,
        rotation: Math.random() * 360,
        rect: Math.random() > 0.5,
      }))
    );
    const t = setTimeout(() => setParticles([]), 3200);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[95] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-14px",
            width: p.size,
            height: p.rect ? p.size * 2.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.rect ? "2px" : "50%",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
