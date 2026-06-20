type Mark = { top?: string; bottom?: string; left?: string; right?: string; s: number; r: number; o: string };

/**
 * Faint red X marks scattered at odd fixed spots across the page — like markers
 * scratched on the walls. Pure background atmosphere / a quiet recurring motif
 * for the hidden hunt. Never explained, never interactive.
 */
const MARKS: Mark[] = [
  { top: "14%", left: "5%", s: 26, r: 12, o: "text-red-500/10" },
  { top: "33%", right: "4%", s: 18, r: -8, o: "text-red-500/10" },
  { top: "61%", left: "3%", s: 22, r: 20, o: "text-red-500/[0.08]" },
  { bottom: "12%", right: "7%", s: 30, r: -16, o: "text-red-500/10" },
  { top: "80%", left: "46%", s: 15, r: 6, o: "text-red-500/[0.07]" },
  { top: "48%", right: "24%", s: 14, r: -22, o: "text-red-500/[0.08]" },
  { bottom: "30%", left: "20%", s: 20, r: 10, o: "text-red-500/[0.06]" },
];

export default function XScatter() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {MARKS.map((m, i) => (
        <span
          key={i}
          style={{ position: "absolute", top: m.top, bottom: m.bottom, left: m.left, right: m.right, transform: `rotate(${m.r}deg)` }}
        >
          <svg width={m.s} height={m.s} viewBox="0 0 24 24" className={m.o}>
            <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </span>
      ))}
    </div>
  );
}
