import React, { useState, useEffect } from "react";
import { trackHunt } from "../lib/hunt";
import { speakAppraisal, stopSpeaking } from "../lib/tts";
import { AlertCircle, HelpCircle, Activity, ShieldAlert, Sparkles, Archive, Coins, Share2, Trash2, Volume2 } from "lucide-react";
import { AppraisalResult } from "../types";

interface OracleAppraiserProps {
  onAddProjectDirectly: (newProject: any) => void;
}

const ROAST_PRESETS = [
  { label: "💼 Smug small-biz owner", category: "other", good: "Happy boss, sustainable revenue, zero drama", embarrassing: "Annoyingly opinionated and somehow still begging to be roasted", fav: "their golden-retriever office dog" },
  { label: "💪 Gym mate", category: "mate", good: "Genuinely in great shape and disciplined as hell", embarrassing: "Films every set, grunts for the camera, and works his deadlift number into every chat", fav: "his protein shaker" },
  { label: "🪙 Crypto guy", category: "crypto", good: "Called one coin right back in 2021", embarrassing: "Still dines out on that one trade and has 'web3' in his bio", fav: "his hardware wallet" },
  { label: "📈 LinkedIn poster", category: "influencer", good: "Big following and genuinely strong engagement", embarrassing: "Opens every post with 'Agree?' and once cried for the algorithm", fav: "their personal brand" },
  { label: "🚀 Seed-stage founder", category: "startup", good: "Raised a tidy seed round with real customers", embarrassing: "Calls a 4-person team 'the family' and is 'in stealth' on a to-do list app", fav: "their long-suffering cofounder" },
] as const;

export default function OracleAppraiser({ onAddProjectDirectly }: OracleAppraiserProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("startup");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [techStack, setTechStack] = useState("");

  const applyPreset = (p: typeof ROAST_PRESETS[number]) => {
    setCategory(p.category as any);
    setCauseOfDeath(p.good);
    setCreator(p.fav);
    setDescription(p.embarrassing);
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
      setErrorMsg("Give me a name and something embarrassing, then I'll roast it.");
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
          category,
          causeOfDeath: causeOfDeath || "annoyingly successful",
          techStack: creator || "their loyal hype-man",
          description
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
      const resVal = {
        score: Number(data.score) || 75,
        appraisal: data.appraisal || "Decent effort, horrible alignment.",
        postMortem: data.postMortem || "A standard disaster. Reevaluate life.",
        recyclingPlan: data.recyclingPlan || "Sell keycaps and retire to a mountain."
      };
      setResult(resVal);
      speakAppraisal(resVal.appraisal, resVal.postMortem, resVal.recyclingPlan);
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
  const [exposeName, setExposeName] = useState("");
  const [exposeFriend, setExposeFriend] = useState("");
  const [adventureOpen, setAdventureOpen] = useState(false);
  // After forwarding the roast, the sender bounces to their messaging app and back,
  // distracted — so we bring them straight back to the colourful clue button.
  const [highlightClue, setHighlightClue] = useState(false);
  const drawBackToClue = () => {
    window.setTimeout(() => {
      document.getElementById("next-clue")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightClue(true);
      window.setTimeout(() => setHighlightClue(false), 2800);
    }, 350);
  };
  // Revenge loop: arriving from a roast card's "Roast them back" button pre-fills
  // the sender (?target=) as who you're now roasting.
  const [revengeTarget, setRevengeTarget] = useState("");
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("target");
      if (t) { setExposeFriend(t); setRevengeTarget(t); }
    } catch { /* no search params */ }
    return () => {
      stopSpeaking();
    };
  }, []);

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
      const data = (await res.json()) as { url?: string };
      // Carry the roaster's name as ?from so the victim's card can offer a
      // pre-filled "roast them back" button (the revenge loop). Stored record unchanged.
      const from = exposeName.trim();
      const url = `${window.location.origin}${data.url}${from ? `?from=${encodeURIComponent(from)}` : ""}`;
      setShareUrl(url);
      // Pop the OS share sheet straight away — the link unfurls into the roast's OG card.
      if (navigator.share) {
        const text = exposeFriend
          ? `Ha — the Roast Oracle got me 😈 Your turn, ${exposeFriend}: go roast someone.`
          : `Your turn on the Roast Oracle 😈 — go roast someone.`;
        try { await navigator.share({ title: "Roast Graveyard", text, url }); } catch { /* cancelled / unsupported */ }
      }
      // Came back from the share sheet distracted? Here's your next clue.
      drawBackToClue();
    } catch (e) {
      setErrorMsg("Could not save the roast for sharing. Try again in a moment.");
    } finally {
      setSharing(false);
    }
  };

  const copyShare = () => {
    if (!shareUrl) return;
    if (navigator.share) {
      navigator.share({ title: "Roast Graveyard", text: `${name || "Someone"} just got roasted 🔥`, url: shareUrl }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleExpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exposeName || !exposeFriend) { setErrorMsg("Need their nickname/name and yours."); return; }
    setLoading(true); setErrorMsg(null); setResult(null); setShareUrl(null);
    setName(exposeName);
    setCategory("freshly roasted");
    try {
      const response = await fetch("/api/appraise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: exposeName, mode: "scandal", category: "freshly roasted" }),
      });
      if (!response.ok) {
        let detail = "";
        try { const eb = await response.json(); detail = eb.detail || eb.error || ""; } catch {}
        throw new Error(detail || "The Oracle's printing press jammed. Try again.");
      }
      const data = await response.json();
      const resVal = {
        score: Number(data.score) || 50,
        appraisal: data.appraisal || "No comment.",
        postMortem: data.postMortem || "Details mysteriously redacted.",
        recyclingPlan: data.recyclingPlan || "Lay low, then write a memoir.",
      };
      setResult(resVal);
      speakAppraisal(resVal.appraisal, resVal.postMortem, resVal.recyclingPlan);
    } catch (err: any) {
      setErrorMsg(err.message || "Exposé failed to print.");
    } finally {
      setLoading(false);
    }
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
            AI roast machine &mdash; savage verdicts on demand
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Submit / Dump Form */}
        <form onSubmit={handleExpose} className="lg:col-span-3 space-y-4">
          <div className="bg-[#060913] border border-fuchsia-500/20 rounded-lg p-5 space-y-4 depth-top">
            {revengeTarget && (
              <p className="text-xs text-amber-200 leading-relaxed bg-amber-950/20 border border-amber-500/30 rounded px-2.5 py-2 font-mono-tech">
                😈 You've been dared. We've teed up <span className="font-bold text-amber-300">{revengeTarget}</span> &mdash; but roast anyone you like. Sign your name and let the Oracle cook.
              </p>
            )}
            <p className="text-xs text-gray-400 leading-relaxed">
              Roast a mate. Pop in who you're roasting, sign your own name so they know who to blame, and we'll cook it up.
            </p>
            <p className="text-[10px] text-gray-500 leading-relaxed border border-gray-800 rounded px-2.5 py-1.5">
              🔒 Nothing is sent, ever &mdash; no emails, no messages. Your name just writes the roast and isn't stored, unless <span className="text-gray-400">you</span> tap Save &amp; Share &mdash; which turns it into an invite link you send yourself.
            </p>
            <div>
              <label className="block text-xs font-mono-tech text-fuchsia-300 uppercase tracking-widest mb-1.5 font-bold">* Who are you roasting?</label>
              <input
                type="text"
                value={exposeFriend}
                onChange={(e) => setExposeFriend(e.target.value)}
                placeholder="Their nickname or name"
                className="w-full bg-[#030712] border border-fuchsia-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono-tech text-fuchsia-300 uppercase tracking-widest mb-1.5 font-bold">* Your nickname or name</label>
              <input
                type="text"
                value={exposeName}
                onChange={(e) => setExposeName(e.target.value)}
                placeholder="Your nickname or name"
                className="w-full bg-[#030712] border border-fuchsia-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-400 transition"
                required
              />
              <p className="text-[10px] text-gray-500 mt-1">Sign it so they know the roast came from a mate.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white text-sm font-mono-tech font-bold uppercase py-3 px-4 rounded flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 shadow-[0_0_18px_rgba(217,70,239,0.45)]"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? `Roasting ${exposeFriend || "them"}...` : "Roast them"}
            </button>
            {errorMsg && (
              <p className="text-xs text-red-400 font-mono-tech bg-red-950/20 p-2 border border-red-500/20 rounded">⚠️ {errorMsg}</p>
            )}
          </div>
        </form>

        {/* Right Side: Consultation Booth (CRT Screen style) */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-[#05070e] border-2 border-cyan-400/30 rounded-lg p-5 flex-1 relative flex flex-col justify-between overflow-hidden shadow-2xl mini-radar-glow depth-top">
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
                  <div className="mt-5 rounded-lg border border-dashed border-fuchsia-500/30 bg-fuchsia-950/10 p-2.5 max-w-xs mx-auto">
                    <p className="text-[11px] font-mono-tech text-fuchsia-300/80">🔒 A clue is buried in this Oracle</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Run a roast first — it won't surface until you do.</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-fade-in text-xs text-gray-300">
                  <div className="flex justify-between items-center bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded">
                    <span className="font-mono-tech text-cyan-300 uppercase flex items-center gap-1.5">
                      Roast Rating:
                      <button
                        type="button"
                        onClick={() => speakAppraisal(result.appraisal, result.postMortem, result.recyclingPlan)}
                        title="Listen to Scrapyard Voice"
                        className="p-1 hover:bg-cyan-900/40 rounded text-cyan-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                    <span className="text-sm font-bold text-red-400 font-mono-tech">{Math.round(result.score)}/100</span>
                  </div>

                  <div className="border border-cyan-500/10 p-3 rounded bg-cyan-950/5">
                    <span className="text-[10px] sm:text-xs font-mono-tech text-cyan-400 uppercase tracking-widest block mb-1">
                      The Verdict
                    </span>
                    <p className="italic text-gray-200 leading-relaxed font-sans font-medium text-sm sm:text-[15px]">
                      "{result.appraisal}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-xs font-mono-tech text-red-400 uppercase tracking-widest block">
                      The Deep Cut
                    </span>
                    <p className="leading-relaxed text-gray-300 text-xs sm:text-[13px]">
                      {result.postMortem}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-cyan-500/10 text-amber-200">
                    <span className="text-[10px] sm:text-xs font-mono-tech text-amber-400 uppercase tracking-widest block flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      Unsolicited Advice
                    </span>
                    <p className="leading-relaxed text-xs sm:text-[13px]">
                      {result.recyclingPlan}
                    </p>
                  </div>

                  <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-fuchsia-950/40 to-amber-950/30 border border-fuchsia-500/30 text-center space-y-2">
                    <p className="text-sm font-bold text-fuchsia-200">😈 AHA, {exposeName}!</p>
                    <p className="text-[11px] text-gray-300 leading-relaxed">You thought you were roasting <span className="text-fuchsia-300">{exposeFriend}</span> &mdash; nope. This roast is all about YOU.</p>
                    <p className="text-[11px] text-gray-300 leading-relaxed">😈 Now pass it on: send it to <span className="text-fuchsia-300">{exposeFriend}</span> and dare them to roast someone too &mdash; the Oracle flips it straight onto THEM, exactly like it just did to you.</p>
                    <button
                      type="button"
                      onClick={handleSaveAndShare}
                      disabled={sharing}
                      className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white text-xs font-mono-tech font-bold uppercase py-2 px-4 rounded transition cursor-pointer disabled:opacity-60 shadow-[0_0_14px_rgba(217,70,239,0.4)]"
                    >
                      {sharing ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Plating it…</>
                      ) : shareUrl ? (
                        <><Share2 className="w-3.5 h-3.5" /> Forward to {exposeFriend} again</>
                      ) : (
                        <><Share2 className="w-3.5 h-3.5" /> Send it to {exposeFriend}</>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Makes a share card and opens your share sheet &mdash; pick {exposeFriend} and send. The link &amp; card appear below too.</p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="mt-6 pt-3 border-t border-cyan-500/10 space-y-2">
                <div
                  id="next-clue"
                  className={`rounded-lg bg-gradient-to-r from-fuchsia-950/40 to-amber-950/30 border p-3 text-center space-y-2 transition-all duration-300 ${highlightClue ? "border-fuchsia-400 ring-2 ring-fuchsia-400/70 shadow-[0_0_22px_rgba(217,70,239,0.55)] scale-[1.02]" : "border-fuchsia-500/30"}`}
                >
                  <p className="text-[11px] text-gray-200 leading-relaxed"><span className="text-fuchsia-300 font-bold">You just completed Clue 1</span> of a hidden adventure on this site &mdash; a mission that ends in a surprise. Claim your next clue to officially enter.</p>
                  <button
                    type="button"
                    onClick={() => { setAdventureOpen(true); trackHunt("clue1"); window.dispatchEvent(new Event("hint-found")); }}
                    className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white text-xs font-mono-tech font-bold uppercase py-2 px-4 rounded transition cursor-pointer shadow-[0_0_14px_rgba(217,70,239,0.4)]"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Get your next clue
                  </button>
                </div>
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
                    <p className="text-[10px] font-mono-tech text-fuchsia-300 uppercase tracking-widest">Your roast link &mdash; share it as an invite:</p>
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

      {adventureOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => setAdventureOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative overflow-hidden w-full max-w-lg my-6 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#1a0b2e] via-[#0b0f19] to-[#2e1a0b] border-2 border-fuchsia-500/40 shadow-[0_0_60px_rgba(217,70,239,0.35)] text-center animate-fade-in"
          >
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <svg viewBox="0 0 64 40" className="absolute top-9 -left-3 w-24 h-14 text-fuchsia-400 animate-pulse-slow" fill="currentColor"><circle cx="20" cy="26" r="12"/><circle cx="34" cy="19" r="15"/><circle cx="48" cy="27" r="11"/><rect x="13" y="26" width="42" height="13" rx="6"/></svg>
              <svg viewBox="0 0 64 40" className="absolute top-24 -right-4 w-28 h-16 text-cyan-400" fill="currentColor"><circle cx="20" cy="26" r="12"/><circle cx="34" cy="19" r="15"/><circle cx="48" cy="27" r="11"/><rect x="13" y="26" width="42" height="13" rx="6"/></svg>
              <svg viewBox="0 0 64 40" className="absolute bottom-8 -left-2 w-20 h-12 text-amber-400 animate-pulse-slow" fill="currentColor"><circle cx="20" cy="26" r="12"/><circle cx="34" cy="19" r="15"/><circle cx="48" cy="27" r="11"/><rect x="13" y="26" width="42" height="13" rx="6"/></svg>
              <svg viewBox="0 0 64 40" className="absolute bottom-2 right-1 w-16 h-10 text-sky-400" fill="currentColor"><circle cx="20" cy="26" r="12"/><circle cx="34" cy="19" r="15"/><circle cx="48" cy="27" r="11"/><rect x="13" y="26" width="42" height="13" rx="6"/></svg>
              <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 opacity-60">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M25,60 C25,38 75,38 75,60 C65,82 35,82 25,60 Z" fill="#713f12" opacity="0.35" stroke="#eab308" strokeWidth="2" />
                <path d="M34,42 L66,72" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M66,42 L34,72" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="relative z-10">
            <button
              type="button"
              onClick={() => setAdventureOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
            <p className="text-[10px] font-mono-tech tracking-[0.3em] text-fuchsia-300 uppercase mb-1">Clue 1 of ???</p>
            <h2 className="font-monument text-2xl text-white mb-3">You found the way in.</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              Most people roast a mate and leave. You stumbled onto something hidden. This site runs a secret hunt &mdash; a chain of clues buried in the trash that ends in a surprise very few ever reach.
            </p>
            <div className="bg-black/40 border border-amber-500/30 rounded-lg p-4 text-left mb-5">
              <p className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest mb-1">Your first clue</p>
              <p className="text-sm text-amber-100/90 leading-relaxed">
                One entry in the Graveyard is the odd one out &mdash; it doesn't belong with the rest. That's the one hiding your next clue. Find it, and read its roast closely.
              </p>
            </div>
            <a
              href="/memorials"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white text-sm font-mono-tech font-bold uppercase py-2.5 px-6 rounded-lg transition shadow-[0_0_18px_rgba(217,70,239,0.45)]"
            >
              To the Graveyard →
            </a>
            <p className="text-[10px] text-gray-500 font-mono-tech mt-3">No skipping. The trash remembers.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
