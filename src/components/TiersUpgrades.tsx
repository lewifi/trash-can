import React, { useState } from "react";
import { Sparkles, Trophy, Settings2, BarChart3, Palette, ShieldCheck, HeartCrack } from "lucide-react";

export default function TiersUpgrades() {
  const [selectedBinColor, setSelectedBinColor] = useState("#06b6d4"); // Cyan
  const [canSkin, setCanSkin] = useState("chrome"); // chrome, rusty, carbon, gold
  const [binDecal, setBinDecal] = useState("skull"); // skull, fire, radioactive, money
  const [flickerRate, setFlickerRate] = useState(3); // 1-10

  const getSkinText = () => {
    switch (canSkin) {
      case "chrome": return "Brilliant Space Chrome (Vaporwave Classic)";
      case "rusty": return "70s Scrap-pile Iron Oxide (Industrial Retro)";
      case "carbon": return "High-Impact Matte Carbon (Dev-Ops Stealth)";
      case "gold": return "Venture Capital Delusion Gold (Ponzi Luxury Edition)";
      default: return "";
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-6 relative neon-glow-cyan">
      <div className="flex items-center gap-3 mb-6 border-b border-cyan-500/20 pb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <div>
          <h3 className="font-monument text-lg tracking-wider text-cyan-400">
            TRASH TIERS & SPECIFICATIONS
          </h3>
          <p className="text-xs text-gray-400 font-mono-tech mt-0.5">
            Configure premium chrome bins, order custom relics, and analyze rejection patterns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Interactive Playground */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#060913] p-4 rounded-lg border border-cyan-500/15">
            <h4 className="font-mono-tech text-xs text-cyan-300 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Settings2 className="w-4 h-4" />
              1. CUSTOM BIN CONSTRUCTS & ARTIFACT SKINS
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono-tech text-cyan-400/80 mb-1.5">
                    Select Barrel Coating (Texture Group)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["chrome", "rusty", "carbon", "gold"].map((skin) => (
                      <button
                        key={skin}
                        onClick={() => setCanSkin(skin)}
                        className={`py-1.5 rounded text-[10px] font-mono-tech uppercase font-bold text-center border cursor-pointer transition ${
                          canSkin === skin
                            ? "bg-cyan-950/20 text-cyan-300 border-cyan-400"
                            : "bg-[#030712] border-cyan-500/10 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {skin}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono-tech text-cyan-400/80 mb-1.5">
                    Holographic Security Stamp
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["skull", "fire", "radioactive", "money"].map((decal) => (
                      <button
                        key={decal}
                        onClick={() => setBinDecal(decal)}
                        className={`py-1.5 rounded text-[10px] font-mono-tech uppercase font-bold text-center border cursor-pointer transition ${
                          binDecal === decal
                            ? "bg-cyan-950/20 text-cyan-300 border-cyan-400"
                            : "bg-[#030712] border-cyan-500/10 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {decal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono-tech text-cyan-400/80 mb-1.5">
                  Neon Gas Color Accent
                </label>
                <div className="flex gap-2">
                  {[
                    { hex: "#06b6d4", name: "Cyan" },
                    { hex: "#22c55e", name: "Green" },
                    { hex: "#ef4444", name: "Red" },
                    { hex: "#f59e0b", name: "Amber" },
                    { hex: "#ec4899", name: "Pink" }
                  ].map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => setSelectedBinColor(col.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                        selectedBinColor === col.hex ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    ></button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-tech text-cyan-400/80 mb-1">
                  Radiation Luminescence Pulse Frequency ({flickerRate}Hz)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={flickerRate}
                  onChange={(e) => setFlickerRate(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-cyan-950 rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#060913] p-4 rounded-lg border border-cyan-500/15">
            <h4 className="font-mono-tech text-xs text-cyan-300 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              2. WASTE REJECTION ANALYTICS (GLOBAL HISTORIC TRENDS)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-[#030712] border border-cyan-500/10 p-2.5 rounded">
                <span className="block text-[9px] font-mono-tech text-gray-500 uppercase">Worst Season</span>
                <span className="block font-bold text-red-400 font-mono-tech text-sm mt-1 uppercase">Crypto Winter</span>
              </div>
              <div className="bg-[#030712] border border-cyan-500/10 p-2.5 rounded">
                <span className="block text-[9px] font-mono-tech text-gray-500 uppercase">Top Tech Graved</span>
                <span className="block font-bold text-cyan-400 font-mono-tech text-sm mt-1 uppercase">Node Modules</span>
              </div>
              <div className="bg-[#030712] border border-cyan-500/10 p-2.5 rounded">
                <span className="block text-[9px] font-mono-tech text-gray-500 uppercase">Failure Metric</span>
                <span className="block font-bold text-amber-500 font-mono-tech text-sm mt-1 uppercase">Over-Eng.</span>
              </div>
              <div className="bg-[#030712] border border-cyan-500/10 p-2.5 rounded">
                <span className="block text-[9px] font-mono-tech text-gray-500 uppercase">Mean Damage</span>
                <span className="block font-bold text-red-500 font-mono-tech text-sm mt-1 uppercase">8.9 / 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bin Container Mockup visualization */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-[#05070e] border border-cyan-500/20 rounded p-5 relative overflow-hidden">
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-mono-tech text-cyan-400 uppercase tracking-wider mb-4 border-b border-cyan-500/10 pb-2">
              <span>HOLO_BIN PREVIEW</span>
              <span className="text-yellow-400 flex items-center gap-1 text-[9px]">
                <Sparkles className="w-3 h-3 animate-pulse" /> PREMIUM ACTIVE
              </span>
            </div>

            {/* Vector Simulated Bin Rendering */}
            <div className="my-3 flex justify-center items-center">
              <div className="relative w-44 h-48 flex flex-col items-center">
                
                {/* Neon Gas glow shadow behind */}
                <div 
                  className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-300"
                  style={{ backgroundColor: selectedBinColor, transform: `scale(${1 + flickerRate * 0.05})` }}
                ></div>

                {/* Bin Top/Lid */}
                <div 
                  className="w-36 h-8 rounded-t-lg border-2 border-white/20 transition-all duration-300 relative z-10"
                  style={{
                    backgroundColor: canSkin === "chrome" ? "#e5e7eb" : canSkin === "rusty" ? "#7c2d12" : canSkin === "carbon" ? "#1f2937" : "#eab308",
                    boxShadow: `0 0 14px ${selectedBinColor}`
                  }}
                >
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/40 rounded"></div>
                </div>

                {/* Barrel Body */}
                <div 
                  className="w-32 flex-1 border-x-2 border-b-2 border-white/20 rounded-b-lg relative mt-1 flex flex-col items-center justify-center overflow-hidden" 
                  style={{
                    backgroundColor: canSkin === "chrome" ? "#9ca3af" : canSkin === "rusty" ? "#9a3412" : canSkin === "carbon" ? "#111827" : "#ca8a04",
                  }}
                >
                  {/* Decorative stripes/ridges on bin */}
                  <div className="space-y-3.5 w-full px-2.5 py-1 z-0 absolute inset-0 flex flex-col justify-around opacity-25">
                    <div className="h-0.5 bg-black"></div>
                    <div className="h-0.5 bg-black"></div>
                    <div className="h-0.5 bg-black"></div>
                    <div className="h-0.5 bg-black"></div>
                  </div>

                  {/* Decal Badge */}
                  <div className="relative z-10 bg-[#030712] p-2.5 rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                    {binDecal === "skull" ? (
                      <span className="text-xl shadow-red-500/30">💀</span>
                    ) : binDecal === "fire" ? (
                      <span className="text-xl">🔥</span>
                    ) : binDecal === "radioactive" ? (
                      <span className="text-xl text-yellow-500 font-bold font-mono">☢️</span>
                    ) : (
                      <span className="text-xl text-green-500 font-bold">$</span>
                    )}
                  </div>

                  {/* Cyan / customizable neon light band */}
                  <div 
                    className="absolute bottom-2.5 left-0 right-0 h-1 transition-all duration-300"
                    style={{ backgroundColor: selectedBinColor, boxShadow: `0 0 15px 3px ${selectedBinColor}` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Micro details panel */}
            <div className="text-center space-y-1.5 text-[11px] text-gray-400 mt-4 bg-black/30 p-2.5 rounded border border-cyan-500/10">
              <p className="font-bold text-cyan-300">Skin: {getSkinText()}</p>
              <p className="text-[10px] text-gray-500">
                Pulse modulation: {flickerRate}Hz • Hologram: {binDecal.toUpperCase()} STAMP
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/10">
            <button
              onClick={() => alert("🎉 Premium skin successfully synchronized! Your dumps will arrive in style inside the global trash timeline.")}
              className="w-full bg-[#111827] hover:bg-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-mono-tech uppercase font-bold py-2 text-xs rounded transition cursor-pointer"
            >
              Apply Holo-Skin Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
