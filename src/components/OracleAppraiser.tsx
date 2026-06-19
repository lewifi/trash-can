import React, { useState } from "react";
import { AlertCircle, HelpCircle, Activity, ShieldAlert, Sparkles, Archive, Coins, Share2, Trash2 } from "lucide-react";
import { AppraisalResult } from "../types";

interface OracleAppraiserProps {
  onAddProjectDirectly: (newProject: any) => void;
}

const ROAST_PRESETS = [
  { label: "\uD83E\uDD84 Raised $100M", category: "startup", claim: "Raised a $100M Series B at a $2B valuation", tech: "Money, momentum, and a foosball table", desc: "Backed by every top-tier VC on Sand Hill Road. Hired 200 people in a year and bought billboards at the airport. Surely nothing could go wrong." },
  { label: "\uD83D\uDD14 IPO'd", category: "bigtech", claim: "Went public to a standing ovation on the NYSE floor", tech: "Investor hype and a confetti cannon", desc: "Founders rang the bell, the stock popped 80% on day one, and the whole team bought matching Teslas. Peak everything." },
  { label: "\uD83E\uDD1D Acquired by Google", category: "bigtech", claim: "Acqui-hired by Google for an undisclosed (enormous) sum", tech: "A demo that worked exactly once", desc: "The team got golden handcuffs and a shiny campus badge. The product was lovingly sunset six months later." },
  { label: "\uD83D\uDE80 Went viral", category: "influencer", claim: "Hit #1 on Product Hunt and trended worldwide", tech: "Virality, vibes, and a melting server", desc: "Three million signups in a single weekend. The founder did a TED talk about disruption before the load balancer recovered." },
  { label: "\uD83D\uDC96 Beloved & profitable", category: "app", claim: "Profitable, adored, and growing 40% a year", tech: "Actually good decisions", desc: "Happy customers, sustainable revenue, zero drama. Annoyingly wholesome and somehow still begging to be roasted." },
] as const;

export default function OracleAppraiser({ onAddProjectDirectly }: OracleAppraiserProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("startup");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [techStack, setTechStack] = useState("");

  const applyPreset = (p: typeof ROAST_PRESETS[number]) => {
    setCategory(p.category as any);
    setCauseOfDeath(p.claim);
    setTechStack(p.tech);
    setDescription(p.desc);
  };
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
      setErrorMsg("Give me a name and the setup, then I'll roast it.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setShareUrl(null);

    try {
      const response = await fetch("/api/appraise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          mode: "roast",
          description: creator ? `${description}\n\nExtra ammo: ${creator}` : description,
          category,
          causeOfDeath: causeOfDeath || "suspiciously successful",
          techStack: techStack || "pure vibes and good PR"
        })
      });

      if (!response.ok) {
        let serverDetail = "";
        try {
          const errBody = await response.json();
          serverDetail = errBody.detail || errBody.error || "";
        } catch {
          /* ignore non-JSON error bodies */
        }
        throw new Error(
          serverDetail
            ? `Waste Oracle error: ${serverDetail}`
            : "Waste Oracle server had an internal seizure. Retrying is advised."
        );
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

  const [burying, setBurying] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveAndShare = async () => {
    if (!result) return;
    setSharing(true);
    try {
      const res = await fetch("/api/roasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Unnamed target",
          category,
          score: result.score,
          appraisal: result.appraisal,
          postMortem: result.postMortem,
          recyclingPlan: result.recyclingPlan,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      setShareUrl(`${window.location.origin}${data.url}`);
    } catch (e) {
      setErrorMsg("Could not save the roast for sharing. Try again in a moment.");
    } finally {
      setSharing(false);
    }
  };

  const copyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  const handleBuryInWasteland = async () => {
    if (!name || !description) return;
    setBurying(true);
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
    } finally {
      setBurying(false);
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
            THE ROAST ORACLE
          </h3>
          <p className="text-xs text-gray-400 font-mono-tech mt-0.5">
            AI roast machine \u2014 savage verdicts on demand
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Submit / Dump Form */}
        <form onSubmit={handleConsult} className="lg:col-span-3 space-y-4">
          <div>
            <span className="block text-[10px] font-mono-tech text-amber-300 uppercase tracking-widest mb-2 font-bold">
              Quick brag &mdash; one tap, then let the roast do its worst
            </span>
            <div className="flex flex-wrap gap-2">
              {ROAST_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-[11px] font-mono-tech px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-300 hover:bg-amber-950/30 hover:border-amber-400 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label id="lbl-project-name" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                * Target
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cloudflare, your mate Dave, that one startup"
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
                required
              />
            </div>
            <div>
              <label id="lbl-project-creator" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                Their Ride-or-Die or Red Flag (optional)
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. their co-founder, or that they love a cold plunge"
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
              <option value="startup">Startup / Overfunded Dream</option>
              <option value="bigtech">Big Tech / Too Big to Care</option>
              <option value="crypto">Crypto Bro / Web3 Prophet</option>
              <option value="ai">AI Hype / Thin GPT Wrapper</option>
              <option value="influencer">Influencer / Content Machine</option>
              <option value="publicfigure">Public Figure / Main Character</option>
              <option value="mate">Your Mate / Personal Attack</option>
              <option value="app">App / Product</option>
              <option value="other">Other Roastable Entity</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label id="lbl-cause-death" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                Claim to Fame
              </label>
              <input
                type="text"
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                placeholder="best attribute / flex — e.g. Raised $20M, 4M users"
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label id="lbl-tech-stack" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
                Their Whole Deal
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="their vibe, their stack, their whole personality"
                className="w-full bg-[#060913] border border-cyan-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div>
            <label id="lbl-description" className="block text-xs font-mono-tech text-cyan-300 uppercase tracking-widest mb-1.5 font-bold">
              * The Setup \u2014 why they deserve it
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does everyone love about them? The more glowing the setup, the harder the roast lands..."
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
                  <span>RUN THE ROAST</span>
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
                  ROAST ORACLE OK-3000
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
                    "Feed me a target. I'll find the soft spot."
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
                    Fill the left parameters and consult the Waste Chef to receive your Tragic Appraiser Report and customized scrap recycling plan!
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-fade-in text-xs text-gray-300">
                  <div className="flex justify-between items-center bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded">
                    <span className="font-mono-tech text-cyan-300 uppercase">Roast Rating:</span>
                    <span className="text-sm font-bold text-red-400 font-mono-tech">{result.score}/100</span>
                  </div>

                  <div className="border border-cyan-500/10 p-3 rounded bg-cyan-950/5">
                    <span className="text-[10px] font-mono-tech text-cyan-400 uppercase tracking-widest block mb-1">
                      The Verdict
                    </span>
                    <p className="italic text-gray-300 leading-relaxed font-sans font-medium text-sm">
                      "{result.appraisal}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-tech text-red-400 uppercase tracking-widest block">
                      The Deep Cut
                    </span>
                    <p className="leading-relaxed text-gray-400 text-[11px]">
                      {result.postMortem}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-cyan-500/10 text-amber-300">
                    <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest block flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      Unsolicited Advice
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {result.recyclingPlan}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="mt-6 pt-3 border-t border-cyan-500/10 space-y-2">
                {!shareUrl ? (
                  <button
                    type="button"
                    onClick={handleSaveAndShare}
                    disabled={sharing}
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white text-xs font-mono-tech font-bold uppercase py-2.5 px-3 rounded flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 shadow-[0_0_18px_rgba(217,70,239,0.4)]"
                  >
                    {sharing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Plating the roast...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        Save & Share this roast
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono-tech text-fuchsia-300 uppercase tracking-widest">Send it to whoever you just roasted:</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={shareUrl}
                        onFocus={(e) => e.currentTarget.select()}
                        className="flex-1 bg-[#030712] border border-cyan-500/30 rounded px-2 py-1.5 text-[11px] text-cyan-200 font-mono-tech focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={copyShare}
                        className="bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/40 text-cyan-200 text-[11px] font-mono-tech uppercase px-3 rounded transition cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center text-[11px] font-mono-tech text-fuchsia-300 hover:underline"
                    >
                      Open the share card →
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setShareUrl(null);
                    setErrorMsg(null);
                    setName("");
                    setDescription("");
                    setCauseOfDeath("");
                    setTechStack("");
                    setCreator("");
                  }}
                  className="w-full bg-[#111827] border border-gray-700 hover:border-red-400 text-gray-400 hover:text-red-300 text-xs font-mono-tech font-bold uppercase py-2 px-3 rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Bin it &amp; roast something else
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
