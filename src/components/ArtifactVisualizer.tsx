import React, { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, Radio, Server, Cpu, Flame, Skull, Laptop, Compass, Sparkles, TrendingDown } from "lucide-react";

interface ArtifactVisualizerProps {
  category: string;
  name: string;
  emotionalTragedy: number;
  techStack: string;
  causeOfDeath: string;
  id?: string;
  variant?: "thumbnail" | "detailed" | "crt";
  imageUrl?: string;
}

export default function ArtifactVisualizer({
  category,
  name,
  emotionalTragedy,
  techStack,
  causeOfDeath,
  id = "rnd",
  variant = "thumbnail",
  imageUrl,
}: ArtifactVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime((prev) => (prev + 1) % 100);
      
      // Randomly trigger dramatic glitch flicker
      if (Math.random() > 0.88) {
        setGlitchTrigger(true);
        setTimeout(() => setGlitchTrigger(false), 220);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Visual schematic icons based on category
  const renderInteractiveSchematic = () => {
    const pulseScale = 1 + Math.sin(time * 0.3) * 0.1;
    const rotateAngle = time * 3.6;

    switch (category) {
      case "saas":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400">
            {/* SaaS subscription funnel with interactive rupture */}
            <defs>
              <linearGradient id="saasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Funnel Rings */}
            <path d="M15,10 L85,10 L70,40 L30,40 Z" fill="url(#saasGrad)" stroke="#06b6d4" strokeWidth="1" />
            <path d="M30,42 L70,42 L60,65 L40,65 Z" fill="url(#saasGrad)" stroke="#06b6d4" strokeWidth="1" />
            <path d="M40,67 L60,67 L53,85 L47,85 Z" fill="url(#saasGrad)" stroke="#ef4444" strokeWidth="1.5" className="animate-pulse" />
            
            {/* Ruptured drip points */}
            <circle cx="50" cy="85" r={2 * pulseScale} fill="#ef4444" />
            <circle cx="54" cy={85 + (time % 15)} r="1" fill="#ef4444" opacity={(15 - (time % 15)) / 15} />
            <circle cx="46" cy={80 + ((time + 5) % 15)} r="1" fill="#ef4444" opacity={(15 - ((time + 5) % 15)) / 15} />

            {/* Rupture crack */}
            <path d="M45,25 L55,27 L48,32 L58,35" stroke="#f43f5e" strokeWidth="1.5" fill="none" />
            <text x="50" y="52" fill="#f43f5e" fontSize="6" fontFamily="monospace" textAnchor="middle" className="font-bold">
              $0.00 ARR
            </text>

            <line x1="10" y1="50" x2="90" y2="50" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="2,2" />
          </svg>
        );

      case "web3":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-500">
            {/* Melting coin sinking/cracking */}
            <circle cx="50" cy="45" r="28" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3,3" style={{ transform: `rotate(${rotateAngle}deg)`, transformOrigin: "50px 45px" }} />
            
            {/* Sinking coin slice */}
            <path d="M25,55 C25,35 75,35 75,55 C65,75 35,75 25,55 Z" fill="#713f12" opacity="0.3" stroke="#eab308" strokeWidth="2" />
            <path d="M35,45 L65,65" stroke="#ef4444" strokeWidth="2" />
            <path d="M65,45 L35,65" stroke="#ef4444" strokeWidth="2" />

            {/* Sinking vectors */}
            <line x1="50" y1="75" x2="50" y2="95" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
            <polygon points="50,95 47,90 53,90" fill="#f59e0b" />
            <text x="50" y="32" fill="#f59e0b" fontSize="6.5" fontFamily="monospace" textAnchor="middle" className="uppercase font-bold animate-pulse">
              Rugged
            </text>
          </svg>
        );

      case "mobile":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-green-400">
            {/* Broken phone aspect with screen fracture */}
            <rect x="30" y="10" width="40" height="75" rx="5" fill="#022c22" stroke="#22c55e" strokeWidth="1.5" />
            {/* Speaker & Button */}
            <line x1="45" y1="14" x2="55" y2="14" stroke="#22c55e" strokeWidth="1" />
            <circle cx="50" cy="80" r="2" fill="none" stroke="#22c55e" strokeWidth="1" />
            
            {/* Fractional Web view */}
            <rect x="34" y="18" width="32" height="55" fill="#000" />
            
            {/* Cracks */}
            <path d="M34,25 L48,45 L40,55 L66,50 M48,45 L60,35 M40,55 L35,70" stroke="#f43f5e" strokeWidth="1" fill="none" />
            <circle cx="48" cy="45" r="1.5" fill="#ef4444" />

            <text x="50" y="52" fill="#ef4444" fontSize="5" fontFamily="monospace" textAnchor="middle">
              REJECTED
            </text>
          </svg>
        );

      case "ai":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400">
            {/* Corrupted brain / robot neural net discharging */}
            <circle cx="50" cy="45" r="30" fill="none" stroke="#a855f7" strokeWidth="1" />
            <circle cx="50" cy="45" r="15" fill="none" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="1,1" />

            {/* Neural nodes */}
            <circle cx="35" cy="35" r="2.5" fill="#c084fc" />
            <circle cx="65" cy="35" r="2.5" fill="#c084fc" />
            <circle cx="50" cy="25" r="2.5" fill="#a855f7" />
            <circle cx="42" cy="55" r="2.5" fill="#ec4899" className="animate-ping" />
            <circle cx="58" cy="55" r="2.5" fill="#ef4444" />

            {/* Ruptured interconnects */}
            <line x1="35" y1="35" x2="50" y2="25" stroke="#a855f7" strokeWidth="1" />
            <line x1="65" y1="35" x2="50" y2="25" stroke="#a855f7" strokeWidth="1" />
            <line x1="35" y1="35" x2="42" y2="55" stroke="#ef4444" strokeWidth="1" strokeDasharray="1,1" />
            <line x1="65" y1="35" x2="58" y2="55" stroke="#f43f5e" strokeWidth="1.5" />
            
            {/* Spark lightning discharge */}
            <path d="M50,15 L45,3 L53,3 L48,-4" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" fill="none" transform="translate(0, 15)" />

            <text x="50" y="85" fill="#b51a1a" fontSize="6" fontFamily="monospace" textAnchor="middle" className="uppercase tracking-widest font-bold">
              HALT TRIPPED
            </text>
          </svg>
        );

      case "hardware":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
            {/* Blown capacitor, circuit line sparks */}
            <rect x="25" y="25" width="50" height="50" rx="3" fill="#1b120c" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#f59e0b" strokeWidth="1" />
            
            {/* Blown top cross */}
            <line x1="40" y1="40" x2="60" y2="60" stroke="#ef4444" strokeWidth="2" />
            <line x1="60" y1="40" x2="40" y2="60" stroke="#ef4444" strokeWidth="2" />

            {/* Circuit leads */}
            <line x1="50" y1="10" x2="50" y2="25" stroke="#d97706" strokeWidth="1.5" />
            <line x1="50" y1="75" x2="50" y2="90" stroke="#d97706" strokeWidth="1.5" />

            <circle cx="50" cy="10" r="2" fill="#f59e0b" />
            <circle cx="50" cy="90" r="2" fill="#f59e0b" />

            <text x="50" y="21" fill="#ef4444" fontSize="5" fontFamily="monospace" textAnchor="middle" className="animate-pulse">
              OVERHEATED
            </text>
          </svg>
        );

      case "game":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-pink-500">
            {/* Arcade joystick or simple pixel skull */}
            <rect x="20" y="15" width="60" height="70" rx="4" fill="#1c071a" stroke="#db2777" strokeWidth="1.2" />
            <circle cx="50" cy="40" r="12" fill="#f43f5e" />
            <line x1="50" y1="52" x2="50" y2="70" stroke="#f43f5e" strokeWidth="3" />
            <rect x="35" y="70" width="30" height="6" rx="1" fill="#ec4899" />

            {/* Disrupted lines */}
            <path d="M30,22 L70,22" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2" />
            <text x="50" y="32" fill="#000" fontSize="5" fontFamily="monospace" textAnchor="middle" className="font-bold">
              GAME OVER
            </text>
          </svg>
        );

      case "dev_tool":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-400">
            {/* Infinite recursive node tree collapse */}
            <circle cx="50" cy="20" r="5" fill="#818cf8" stroke="#312e81" strokeWidth="1" />
            <circle cx="30" cy="45" r="5" fill="#818cf8" stroke="#312e81" strokeWidth="1" />
            <circle cx="70" cy="45" r="5" fill="#f43f5e" stroke="#881337" strokeWidth="1.5" className="animate-ping" />
            
            <circle cx="20" cy="74" r="4" fill="#a5b4fc" />
            <circle cx="40" cy="74" r="4" fill="#a5b4fc" />
            <circle cx="60" cy="74" r="4" fill="#f43f5e" />
            <circle cx="80" cy="74" r="4" fill="#f43f5e" />

            <line x1="50" y1="25" x2="30" y2="40" stroke="#4f46e5" strokeWidth="1" />
            <line x1="50" y1="25" x2="70" y2="40" stroke="#4f46e5" strokeWidth="1" />

            <line x1="30" y1="50" x2="20" y2="70" stroke="#4f46e5" strokeWidth="1" />
            <line x1="30" y1="50" x2="40" y2="70" stroke="#4f46e5" strokeWidth="1" />
            <line x1="70" y1="50" x2="60" y2="70" stroke="#f43f5e" strokeWidth="1" />
            <line x1="70" y1="50" x2="80" y2="70" stroke="#f43f5e" strokeWidth="1" />

            <text x="50" y="93" fill="#fb7185" fontSize="5" fontFamily="monospace" textAnchor="middle" className="animate-pulse">
              STACK OVERFLOW
            </text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-red-500">
            {/* Barrels or Biohazard container */}
            <path d="M30,20 L70,20 L65,80 L35,80 Z" fill="#2d0607" stroke="#ef4444" strokeWidth="1.5" />
            {/* Glowing ridges */}
            <line x1="32" y1="35" x2="68" y2="35" stroke="#ef4444" strokeWidth="1" />
            <line x1="33" y1="50" x2="67" y2="50" stroke="#ef4444" strokeWidth="1" />
            <line x1="34" y1="65" x2="66" y2="65" stroke="#ef4444" strokeWidth="1" />
            
            {/* Radiation symbol overlay */}
            <circle cx="50" cy="50" r="6" fill="#ef4444" />
            <path d="M50,50 L45,40" stroke="#ef4444" strokeWidth="1" />
            <text x="50" y="14" fill="#f43f5e" fontSize="6.5" fontFamily="monospace" textAnchor="middle" className="uppercase font-bold animate-pulse">
              TOXIC OIL
            </text>
          </svg>
        );
    }
  };

  if (variant === "thumbnail") {
    return (
      <div className={`relative aspect-video rounded-lg overflow-hidden border bg-[#05070e] transition-all duration-300 w-full group-hover:border-cyan-500/30 ${
        glitchTrigger ? "border-red-500/40 bg-red-950/10" : "border-gray-800"
      }`}>
        {/* Subtle scanline lines overlay */}
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        
        {/* Iridescent gloss border */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500 opacity-60" />

        {/* Vector CAD Grid Background */}
        <div className="absolute inset-0 bg-[#070913]" style={{
          backgroundImage: `radial-gradient(#1e293b 0.6px, transparent 0)`,
          backgroundSize: '12px 12px'
        }} />

        {/* Floating schematic preview container */}
        <div className="absolute inset-0 flex items-center justify-center select-none">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
          ) : (
            <div className="w-24 h-24 max-w-full opacity-70 group-hover:opacity-100 transition-opacity">
              {renderInteractiveSchematic()}
            </div>
          )}
        </div>

        {/* Live overlay markers */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-[#03050a]/90 px-1.5 py-0.5 border border-gray-800 rounded font-mono-tech text-[8px] text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>SYS_FEED: {category.toUpperCase()}</span>
        </div>

        <div className="absolute top-2 right-2 text-[8px] font-mono-tech py-0.5 px-1 bg-red-950/40 text-red-400 border border-red-900/30 rounded">
          DEPRE_LVL: {emotionalTragedy}/10
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-[#05070f] border rounded-xl overflow-hidden shadow-2xl p-4 flex flex-col justify-between ${
      glitchTrigger ? "border-red-500 bg-red-950/15 ring-1 ring-red-500/20" : "border-cyan-500/30"
    }`} style={{ minHeight: "260px" }}>
      {/* Absolute CRT Overlay properties */}
      <div className="absolute inset-0 scanlines opacity-35 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 pointer-events-none" />

      {/* Grid Noise Backdrop */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(18, 24, 38, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 24, 38, 0.1) 1px, transparent 1px)',
        backgroundSize: '10px 10px'
      }} />

      {/* Screen Header Controls */}
      <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-[9px] font-mono-tech text-cyan-400 uppercase tracking-widest font-bold">
          <Radio className="w-3.0 h-3.0 text-red-500 animate-pulse" />
          <span>CONTAINMENT CAMERA CAM_0{emotionalTragedy}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Signal Indicator */}
          <div className="flex items-center gap-1 text-[8px] text-gray-400 font-mono-tech uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>F_DEGRAD: ON</span>
          </div>

          {/* Quick Trigger glitch */}
          <button
            onClick={() => {
              setGlitchTrigger(true);
              setTimeout(() => setGlitchTrigger(false), 250);
            }}
            className="text-[9px] hover:text-cyan-300 transition text-gray-500 cursor-pointer font-mono-tech"
            title="Manual Electromagnetic Glitch"
          >
            ⚡ GLITCH
          </button>
        </div>
      </div>

      {/* Active schematic layout */}
      <div className="relative flex-1 flex items-center justify-center bg-black/40 border border-gray-950 rounded-lg overflow-hidden select-none mb-3">
        
        {/* Dynamic Warning Alert on severe failure */}
        {emotionalTragedy >= 8 && (
          <div className="absolute left-2.5 top-2.5 p-1 bg-red-950/60 border border-red-500/30 text-red-400 rounded text-[8px] font-mono-tech tracking-wider uppercase animate-pulse flex items-center gap-1 z-10">
            <Skull className="w-3 h-3" /> SEVERE FAILURE DETECTED
          </div>
        )}

        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80 hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-32 h-32 opacity-85 hover:scale-105 transition-transform duration-300">
            {renderInteractiveSchematic()}
          </div>
        )}

        {/* Video feed state lines */}
        <div className="absolute right-3.5 bottom-3 text-right space-y-0.5 text-[8px] font-mono-tech text-gray-500">
          <div>SCALE: 1:1 VECTOR CAD</div>
          <div>FREQ: {time % 50}Hz (STABLE)</div>
          <div>MUT: CD_R_332.99</div>
        </div>

        <div className="absolute left-3.5 bottom-3 text-left space-y-0.5 text-[8px] font-mono-tech text-gray-500">
          <div>NAME: {name.toUpperCase().slice(0, 16)}</div>
          <div>TECH: {techStack.toUpperCase().slice(0, 20)}</div>
        </div>
      </div>

      {/* Screen Video Controls Bar Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-cyan-500/10 pt-2 text-[10px] font-mono-tech text-gray-400">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:bg-[#070b14] rounded hover:text-cyan-300 transition flex items-center justify-center cursor-pointer"
            title={isPlaying ? "Mute diagnostics" : "Re-engage telemetry playback"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
          </button>
          <span>{isPlaying ? "DIAGNOSTICS_ACTIVE" : "DIAGNOSTICS_PAUSED"}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-[9px]">
          <span>MUT:</span>
          <span className="text-red-400 border border-red-950 bg-red-950/10 px-1 rounded font-bold">
            {causeOfDeath}
          </span>
        </div>
      </div>
    </div>
  );
}
