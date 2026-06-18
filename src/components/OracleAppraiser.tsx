import React, { useState } from "react";
import { AlertCircle, HelpCircle, Activity, ShieldAlert, Sparkles, Archive, Coins } from "lucide-react";
import { AppraisalResult } from "../types";

interface OracleAppraiserProps {
  onAddProjectDirectly: (newProject: any) => void;
}

export default function OracleAppraiser({ onAddProjectDirectly }: OracleAppraiserProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"saas" | "web3" | "mobile" | "ai" | "hardware" | "game" | "dev_tool" | "other">("saas");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [techStack, setTechStack] = useState("");
  const [creator, setCreator] = useState("");
  const [emotionalTragedy, setEmotionalTragedy] = useState(5);
  
  // Custom appraisal results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AppraisalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Advanced coordinates configuration
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setErrorMsg("Project name and description are absolutely mandatory to scan!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await fetch("/api/appraise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description,
          category,
          causeOfDeath: causeOfDeath || "Sudden developer fatigue",
          techStack: techStack || "Existential dread"
        })
      });

      if (!response.ok) {
        throw new Error("Waste Oracle server had an internal seizure. Retrying is advised.");
      }

      const data = await response.json();
      setResult({
        score: Number(data.score) || 75,
        appraisal: data.appraisal || "Decent effort, horrible alignment.",
        postMortem: data.postMortem || "A standard disaster. Reevaluate life.",
        recyclingPlan: data.recyclingPlan || "Sell keycaps and retire to a mountain."
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred with the AI scanner.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuryInWasteland = async () => {
    if (!name || !description) return;
    
    try {
      const payload = {
        name,
        description,
        category,
        causeOfDeath: causeOfDeath || "Sudden developer fatigue",
        techStack: techStack || "Existential dread",
        emotionalTragedy,
        creator: creator || "Anonymous Debris Owner",
        latitude: latitude !== "" ? Number(latitude) : undefined,
        longitude: longitude !== "" ? Number(longitude) : undefined,
      };

      const response = await fetch("/api/dumps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const added = await response.json();
        onAddProjectDirectly(added);
        // Reset state
        setName("");
        setDescription("");
        setCauseOfDeath("");
        setTechStack("");
        setCreator("");
        setEmotionalTragedy(5);
        setLatitude("");
        setLongitude("");
        setResult(null);
        alert(`🎉 Safely dumped: "${added.name}" is now resting in peace inside the digital wasteland.`);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || "Failed to commit trash to the filesystem.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error burying your code artifact.");
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-6 relative neon-glow-cyan overflow-hidden">
      {/* Absolute top diagnostic line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-cyan-500 to-amber-500"></div>

      <div className="flex items-center gap-3 mb-6 border-b border-cyan-500/20 pb-4">
        <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
        <div>
          <h3 className="font-monument text-lg tracking-wider text-cyan-400 uppercase">
            THE TRASH ORACLE
          </h3>
          <p className="text-xs text-gray-400 font-mono-tech mt-0.5">
            AI Waste Appraiser & Diagnostics Suite (Model: Gemini 3.5 Flash)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Submit / Dump Form */}
        <form onSubmit={handleConsult} className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label id="lbl-project-name" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                * Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LaserShoe, Juicero..."
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>
            <div>
              <label id="lbl-project-creator" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                Creator / Tombstone Name
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. Elon Mask Jr."
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label id="lbl-category" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="saas">SaaS (Software as a Struggle)</option>
              <option value="web3">Web3 / High-risk Ponzi Speculation</option>
              <option value="mobile">Mobile / Swiper Addicted App</option>
              <option value="ai">AI / Infinite Token-Sponge Agent</option>
              <option value="hardware">Hardware / Expensive Desk Paperweight</option>
              <option value="game">Game / Half-Finished Unity Lagfest</option>
              <option value="dev_tool">Developer Tool / Dev-Ops Loop of Doom</option>
              <option value="other">Other Digital Rubble</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label id="lbl-cause-death" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                Cause of Death
              </label>
              <input
                type="text"
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                placeholder="e.g. Realized my bare hands could do it"
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label id="lbl-tech-stack" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                Fragile Tech Stack
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. React Native, Fortran, bad advice"
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label id="lbl-description" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
              * Tragedy Narrative (Confession / Retrospective)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us the exact moment you realized it was garbage. Or dump your unrequested project ideas here so our AI chief of staff can review..."
              className="w-full bg-[#060913] border border-cyan-500/30 rounded p-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
              required
            ></textarea>
          </div>

          <div className="bg-[#060913] border border-dashed border-cyan-500/20 rounded p-4">
            <span className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-wider mb-2 font-bold">
              Advanced Telemetry Controls
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono-tech text-cyan-400/80 mb-1">
                  Emotional Tragedy Rating ({emotionalTragedy}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={emotionalTragedy}
                  onChange={(e) => setEmotionalTragedy(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-cyan-950 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono-tech text-cyan-400/80 mb-1">
                  Location Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Random if empty"
                  className="w-full text-xs bg-cyan-950/20 border border-cyan-500/20 rounded px-2 py-1 placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono-tech text-cyan-400/80 mb-1">
                  Location Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Random if empty"
                  className="w-full text-xs bg-cyan-950/20 border border-cyan-500/20 rounded px-2 py-1 placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono-tech uppercase font-bold py-3 px-6 rounded transition shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>RUNNING CORE DIAGNOSTICS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>CONSULT WASTE LIBRARIAN</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Consultation Booth (CRT Screen style) */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-[#05070e] border-2 border-cyan-400/30 rounded-lg p-5 flex-1 relative flex flex-col justify-between overflow-hidden shadow-2xl mini-radar-glow">
            {/* Horizontal sweep scanline indicator */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400/50 opacity-20 pointer-events-none animate-bounce" style={{ animationDuration: '6s' }}></div>
            <div className="absolute inset-0 scanlines opacity-50 pointer-events-none"></div>

            <div>
              <div className="flex justify-between items-center mb-3 border-b border-cyan-500/10 pb-2">
                <span className="text-[10px] font-mono-tech text-cyan-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  ORACLE APPARATUS OK-3000
                </span>
                <span className="text-[9px] font-mono-tech text-gray-500">REV: 03.5.FL</span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 rounded text-red-400 text-xs flex items-start gap-2 animate-pulse">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {loading && (
                <div className="space-y-4 py-8 text-center text-cyan-400/80">
                  <div className="w-10 h-10 border-4 border-dashed border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="text-xs font-mono-tech tracking-wider uppercase animate-pulse">
                    Parsing code smells, analyzing repository dust...
                  </div>
                  <div className="text-[10px] text-gray-500 italic max-w-xs mx-auto">
                    "Sometimes burying it is the best architectural pivot."
                  </div>
                </div>
              )}

              {!loading && !result && !errorMsg && (
                <div className="text-center py-12 text-gray-500 space-y-3">
                  <HelpCircle className="w-12 h-12 mx-auto text-cyan-500/20 animate-pulse" />
                  <p className="text-xs font-mono-tech uppercase tracking-wide">
                    Diagnostics Terminal Dormant
                  </p>
                  <p className="text-[11px] text-gray-600 max-w-xs mx-auto">
                    Fill the left parameters and consult the Waste Chief to receive your Tragic Appraiser Report and customized scrap recycling plan!
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-fade-in text-xs text-gray-300">
                  <div className="flex justify-between items-center bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded">
                    <span className="font-mono-tech text-cyan-300 uppercase">Tragic Glitch Score:</span>
                    <span className="text-sm font-bold text-red-400 font-mono-tech">{result.score}/100</span>
                  </div>

                  <div className="border border-cyan-500/10 p-3 rounded bg-cyan-950/5">
                    <span className="text-[10px] font-mono-tech text-cyan-400 uppercase tracking-widest block mb-1">
                      Chief Consultant's Appraisal
                    </span>
                    <p className="italic text-gray-300 leading-relaxed font-sans font-medium text-sm">
                      "{result.appraisal}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-tech text-red-400 uppercase tracking-widest block">
                      Autopsy Report (Failure Anatomy)
                    </span>
                    <p className="leading-relaxed text-gray-400 text-[11px]">
                      {result.postMortem}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-cyan-500/10 text-amber-300">
                    <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest block flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      Wasteland Recycling Plan (Pivots)
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {result.recyclingPlan}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="mt-6 pt-3 border-t border-cyan-500/10 flex gap-2">
                <button
                  type="button"
                  onClick={handleBuryInWasteland}
                  className="w-full bg-[#111827] border border-cyan-500/40 hover:bg-cyan-950 hover:border-cyan-400 text-cyan-300 text-xs font-mono-tech font-bold uppercase py-2 px-3 rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Seal & Bury in Graveyard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
