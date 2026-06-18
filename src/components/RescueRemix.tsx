import React, { useState } from "react";
import { Hammer, Sparkles, Wand2, Copy, RefreshCw, Layers } from "lucide-react";
import { DeadProject } from "../types";

interface RescueRemixProps {
  projects: DeadProject[];
}

export default function RescueRemix({ projects }: RescueRemixProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [remixType, setRemixType] = useState<"startup" | "lorem" | "zine" | "nft">("startup");
  const [remixOutput, setRemixOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleGenerateRemix = () => {
    if (!selectedProject) return;

    let output = "";
    const name = selectedProject.name;
    const desc = selectedProject.description;
    const cat = selectedProject.category;

    switch (remixType) {
      case "startup":
        // Funny startup name/pitch pivot generator
        const namingPivots = [
          `Sub-optimal ${name} Core`,
          `Decentralized ${name} Protocol`,
          `${name}.ai Enterprise Platform`,
          `Autonomous Micro-${name} Swarm`,
          `Self-Regulating ${name} Ecosystem`
        ];
        const randomPivotName = namingPivots[Math.floor(Math.random() * namingPivots.length)];
        
        const marketingPitbull = [
          "B2B enterprise multi-tenant cloud offering.",
          "Web3 play-to-earn community utility vector.",
          "Self-custodial sovereign developer workspace.",
          "Zero-knowledge micro-transaction execution layer."
        ];
        const marketingStatement = marketingPitbull[Math.floor(Math.random() * marketingPitbull.length)];

        output = `🚀 REVENUE PIVOT PROPOSAL:
----------------------------------------
NEW BRAND: ${randomPivotName}
OLD CONCEPT: ${name} (Tragic Failure)

ELEVATOR PITCH:
"We took the exact failed core database stack of ${name} and wrapped it in a highly complicated ${marketingStatement} By stripping away the broken original functionality and replacing it with continuous AI marketing jargon, we project a seed valuation of $18.5 Million by Q4. No code modifications required!"

HOW IT MONETIZES:
- Custom branded corporate Chrome metal bins
- Enterprise SLA subscriptions for server down-time
- Premium 'toxic containment' virtual certification logs`;
        break;

      case "lorem":
        // Chaotic Lorem Ipsum text using original codebase/failure nouns
        const nouns = [
          "node_modules", "dependency hell", "docker timeout", "stack overflow", 
          "recursive loop", "API keys exposed", "server rot", "venture capital", 
          "over-engineering", "AWS bill", "Juicero squeezing", "broken promise", 
          "merge conflict", "git push --force", "infinite loop", "CSS glitch",
          "flickering CRT", "vaporwave residue", "unrequested sidebar"
        ];
        const structures = [
          `Lorem ipsum dolor sit amet, with high risk ${nouns[0]} inside the core. Consectetur adipiscing elit over ${nouns[1]} and recursive ${nouns[2]}.`,
          `Sed ut perspiciatis unde omnis iste natus error sit voluptatem, launching ${nouns[3]} directly resulting in immediate ${nouns[4]} of ${nouns[5]}.`,
          `Nunc nec congue ${nouns[6]}. Fusce sit amet ${nouns[7]} running entirely on ${nouns[8]} coupled with ${nouns[9]}.`,
          `Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis peaks because of ${nouns[10]} and unauthorized wild ${nouns[11]}.`
        ];
        // Shuffle structures
        const randomizedList = [...structures].sort(() => Math.random() - 0.5).join("\n\n");
        output = `📝 CHAOTIC DISCARDED-DEV LOREM IPSUM:
----------------------------------------
${randomizedList}`;
        break;

      case "zine":
        // Cyber punk/70s zine catalog metadata
        output = `🎨 WASTELAND ART ZINE COVERSHEET
----------------------------------------
TITLE: "Rubble, Rot, and ${name.toUpperCase()}"
ARTIST: ${selectedProject.creator || "Anonymous Tombstone Operator"}
Wasteland Sector: Sector-#${selectedProject.category.toUpperCase()}

ZINE CURATION NOTES:
- Visual Art Style: 70s trash collector brutalist graphics merged with glowing neon grid telemetry lines.
- Cover Art Concept: A flickering CRT monitor displaying an endless console log of: "${selectedProject.causeOfDeath}".
- Back Cover Quote: "${desc.slice(0, 150)}..."
- Sound Accompaniment: 60Hz ambient hum and sizzling static.`;
        break;

      case "nft":
        output = `🪙 TOXIC-WASTE CRYPTO COLLECTIBLE
----------------------------------------
TOKEN ID: #GLITCH-${Math.floor(Math.random() * 89999 + 10000)}
NAME: Memoralized ${name} Core File
RARITY TIER: ${selectedProject.emotionalTragedy >= 8 ? '🔥 COMPROMISED HAZARD' : '💾 WEATHERED PLASTIC'}

METADATA DEBRIS:
- Tragic History: ${selectedProject.causeOfDeath}
- Technical Soil Grade: ${selectedProject.techStack}
- Glitch Level: ${selectedProject.diagnosticScore || 78}%
- Original Carbon Squeezes: ${selectedProject.likes} votes

"Own a cryptographic fragment of genuine digital ruin. Fully compliant with waste guidelines."`;
        break;
    }

    setRemixOutput(output);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(remixOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-6 relative neon-glow-cyan">
      <div className="flex items-center gap-3 mb-6 border-b border-cyan-500/20 pb-4">
        <Hammer className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        <div>
          <h3 className="font-monument text-lg tracking-wider text-cyan-400 uppercase">
            RESCUE & REMIX ENGINE
          </h3>
          <p className="text-xs text-gray-400 font-mono-tech mt-0.5">
            Adopt digital debris and generate funny, recycled startup ideas or assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side selectors */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
              1. Choose a Dead Project to Adopt
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setRemixOutput("");
              }}
              className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="">-- Choose an interactive corpse --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.causeOfDeath})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
              2. select Remix Formula
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRemixType("startup")}
                className={`p-2.5 rounded border text-xs font-mono-tech font-bold uppercase transition flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                  remixType === "startup"
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-300"
                    : "bg-[#060913] border-cyan-500/10 text-gray-400 hover:border-cyan-500/30 hover:text-gray-200"
                }`}
              >
                <Layers className="w-4.5 h-4.5" />
                <span>Revenue Pivot</span>
              </button>
              <button
                type="button"
                onClick={() => setRemixType("lorem")}
                className={`p-2.5 rounded border text-xs font-mono-tech font-bold uppercase transition flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                  remixType === "lorem"
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-300"
                    : "bg-[#060913] border-cyan-500/10 text-gray-400 hover:border-cyan-500/30 hover:text-gray-200"
                }`}
              >
                <RefreshCw className="w-4.5 h-4.5 animate-spin-slow" />
                <span>Dev Lorem Ipsum</span>
              </button>
              <button
                type="button"
                onClick={() => setRemixType("zine")}
                className={`p-2.5 rounded border text-xs font-mono-tech font-bold uppercase transition flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                  remixType === "zine"
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-300"
                    : "bg-[#060913] border-cyan-500/10 text-gray-400 hover:border-cyan-500/30 hover:text-gray-200"
                }`}
              >
                <Wand2 className="w-4.5 h-4.5" />
                <span>Zine Cover</span>
              </button>
              <button
                type="button"
                onClick={() => setRemixType("nft")}
                className={`p-2.5 rounded border text-xs font-mono-tech font-bold uppercase transition flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                  remixType === "nft"
                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-300"
                    : "bg-[#060913] border-cyan-500/10 text-gray-400 hover:border-cyan-500/30 hover:text-gray-200"
                }`}
              >
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                <span>Waste NFT Relic</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateRemix}
            disabled={!selectedProjectId}
            className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-mono-tech uppercase font-bold py-2 px-4 rounded text-xs tracking-wider transition cursor-pointer flex justify-center items-center gap-2"
          >
            <span>RECONSTRUCT CODE DEBRIS</span>
          </button>
        </div>

        {/* Right Side console display */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-[#05070e] border border-cyan-500/20 rounded p-4 flex-1 flex flex-col justify-between min-h-[220px]">
            {remixOutput ? (
              <div className="flex-1 flex flex-col justify-between">
                <pre className="font-mono-tech text-xs text-green-400 overflow-auto whitespace-pre-wrap max-h-[200px] leading-relaxed">
                  {remixOutput}
                </pre>
                
                <div className="flex items-center justify-between border-t border-cyan-500/10 pt-3 mt-3">
                  <span className="text-[10px] font-mono-tech text-yellow-500/80 uppercase">
                    ⚡ adopted and ready for production pivoting
                  </span>
                  <button
                    onClick={handleCopy}
                    className="bg-[#111827] border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 text-xs px-2.5 py-1 rounded transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-600 space-y-2">
                <p className="text-xs uppercase font-mono-tech tracking-wider text-gray-500">
                  Awaiting Reconstruction Formula
                </p>
                <p className="text-[11px] text-gray-600 max-w-xs">
                  Pick a dead project on the left, select a recycling algorithm, and click Reconstruct to pivot the code!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
