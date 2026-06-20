import { useEffect, useState } from "react";

const BOOT_LINES = [
  { text: "ROAST GRAVEYARD // trash-can.net", delay: 0, color: "text-cyan-400" },
  { text: "> LANDFILL SECTOR: ONLINE", delay: 650, color: "text-green-400" },
  { text: "> 1,840 DEAD PROJECTS CATALOGUED", delay: 1300, color: "text-green-400" },
  { text: "> AI ROAST ENGINE: ARMED", delay: 1950, color: "text-green-400" },
  { text: "> WARNING: ANOMALY DETECTED IN LANDFILL", delay: 2700, color: "text-amber-400" },
  { text: "> ...SOMETHING IS BURIED IN HERE", delay: 3500, color: "text-fuchsia-400" },
];

const STATEMENT_DELAY = 4400;
const BUTTON_DELAY = 5100;

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showStatement, setShowStatement] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [skippable, setSkippable] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines((v) => [...v, i]), line.delay));
    });
    timers.push(setTimeout(() => setShowStatement(true), STATEMENT_DELAY));
    timers.push(setTimeout(() => setShowButton(true), BUTTON_DELAY));
    // Allow click-to-skip after first line appears
    timers.push(setTimeout(() => setSkippable(true), 800));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSkip = () => {
    if (!skippable) return;
    setVisibleLines(BOOT_LINES.map((_, i) => i));
    setShowStatement(true);
    setShowButton(true);
  };

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#010409] transition-opacity duration-600 ${exiting ? "opacity-0" : "opacity-100"}`}
      onClick={handleSkip}
      style={{ transition: "opacity 0.6s ease" }}
    >
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)"
      }} />

      <div className="relative w-full max-w-xl px-6 space-y-1" onClick={(e) => e.stopPropagation()}>

        {/* Boot sequence */}
        <div className="font-mono space-y-1 mb-10 min-h-[11rem]" style={{ fontFamily: "'VT323', monospace", fontSize: "1.1rem", lineHeight: "1.6" }}>
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className={`${line.color} transition-opacity duration-300 flex items-center gap-2 ${visibleLines.includes(i) ? "opacity-100" : "opacity-0"}`}
            >
              {line.text}
              {visibleLines.includes(i) && i === visibleLines[visibleLines.length - 1] && !showStatement && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Main statement */}
        <div className={`text-center transition-all duration-700 ${showStatement ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <p className="font-monument text-4xl sm:text-5xl text-white leading-tight tracking-wide mb-2">
            NOT EVERYONE
          </p>
          <p className="font-monument text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 leading-tight tracking-wide">
            FINDS IT.
          </p>
        </div>

        {/* Enter button */}
        <div className={`pt-10 text-center transition-all duration-500 ${showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transition: "opacity 0.5s ease, transform 0.5s ease" }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleEnter(); }}
            className="group relative inline-flex items-center gap-3 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white font-monument uppercase tracking-widest text-sm px-10 py-4 rounded transition-all duration-200 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            ENTER THE GRAVEYARD
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <p className="text-[10px] font-mono-tech text-gray-600 mt-4 uppercase tracking-widest">
            click anywhere to skip
          </p>
        </div>
      </div>
    </div>
  );
}
