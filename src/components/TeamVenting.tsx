import React, { useState } from "react";
import { trackHunt } from "../lib/hunt";
import { Lock, Unlock, AlertTriangle, ShieldCheck, Plus, ListFilter, HelpCircle, Users } from "lucide-react";
import { DeadProject } from "../types";

interface TeamVentingProps {
  onAddProjectDirectly: (newProject: any) => void;
}

// Turn bare URLs inside a vent post into clickable links (used by the hidden hunt).
function linkify(text: string) {
  return text.split(/(https?:\/\/[^\s"]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="text-cyan-300 underline decoration-cyan-500/60 underline-offset-2 break-all hover:text-cyan-200"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function TeamVenting({ onAddProjectDirectly }: TeamVentingProps) {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [activeRoomPassword, setActiveRoomPassword] = useState<string | null>(null);
  const [roomDumps, setRoomDumps] = useState<DeadProject[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New venting log fields
  const [vName, setVName] = useState("");
  const [vCause, setVCause] = useState("");
  const [vDesc, setVDesc] = useState("");
  const [vTech, setVTech] = useState("");
  const [vTragedy, setVTragedy] = useState(5);
  const [vCreator, setVCreator] = useState("");

  const handleAccessRoom = async (e?: React.FormEvent, codeArg?: string, pwdArg?: string) => {
    if (e) e.preventDefault();
    const code = (codeArg ?? roomName).trim();
    const pwd = pwdArg ?? password;
    if (!code || !pwd) {
      setErrorMsg("Please enter a room code and access password.");
      return;
    }
    if (codeArg !== undefined) setRoomName(codeArg);
    if (pwdArg !== undefined) setPassword(pwdArg);

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(code)}?password=${encodeURIComponent(pwd)}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Wrong containment credentials. Toxic fumes detected.");
        }
        throw new Error("Server communication breakdown.");
      }

      const data = await response.json();
      setRoomDumps(data);
      setActiveRoomName(code);
      setActiveRoomPassword(pwd);
      if (code.toLowerCase() === "secret") trackHunt("vent");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to authenticate room access.");
    } finally {
      setLoading(false);
    }
  };

  const [creating, setCreating] = useState(false);
  const handleCreateVentingLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vDesc || !activeRoomName || !activeRoomPassword) {
      alert("Missing required venting log particulars.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: vName,
        description: vDesc,
        causeOfDeath: vCause || "Continuous build pipeline corrosion",
        techStack: vTech || "Docker, Kubernetes, AWS billing",
        category: "dev_tool",
        emotionalTragedy: vTragedy,
        creator: vCreator || "Frustrated Tech Lead",
        isPrivate: true,
        roomName: activeRoomName,
        roomPassword: activeRoomPassword
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
        // Add to active view list immediately for full reactive client fidelity
        setRoomDumps(prev => [...prev, added]);

        // Reset
        setVName("");
        setVCause("");
        setVDesc("");
        setVTech("");
        setVCreator("");
        alert("🔒 Pressure released! Log safely committed to encrypted deep-vault containment.");
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || "Burying failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to emit venting log.");
    } finally {
      setCreating(false);
    }
  };

  const handleExitRoom = () => {
    setActiveRoomName(null);
    setActiveRoomPassword(null);
    setRoomDumps([]);
    setErrorMsg(null);
    setRoomName("");
    setPassword("");
  };

  return (
    <div className="bg-[#0b0f19] border border-red-500/20 rounded-xl p-6 relative">
      {/* Biohazard warning tape */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-zinc-900 to-yellow-500"></div>

      <div className="flex justify-between items-start mb-6 border-b border-red-500/15 pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500 animate-pulse" />
          <div>
            <h3 className="font-monument text-md tracking-wider text-red-400 uppercase">
              TOXIC WASTE CONTAINMENT UNIT
            </h3>
            <p className="text-[11px] text-gray-400 font-mono-tech mt-0.5">
              Private, password-locked venting lockers and post-mortems for software teams
            </p>
          </div>
        </div>
        {activeRoomName && (
          <button
            onClick={handleExitRoom}
            className="text-[10px] font-mono-tech uppercase bg-red-950/40 border border-red-500/30 text-red-300 py-1 px-2.5 rounded hover:bg-red-900/30 transition cursor-pointer"
          >
            Seal Containment & Vault
          </button>
        )}
      </div>

      {!activeRoomName ? (
        /* LOCK SCREEN FOR PRIVATE TEAM VAULT */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-mono-tech text-xs tracking-wider text-yellow-500 uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              AUTHENTICATION PROTOCOL MANDATORY
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Teams and corporate groups utilize password-locked containment rooms to anonymously vent about catastrophic system failure, architectural over-engineering, or executive-mandated deadlines. Dumps inside these lockers are hidden from the public Heatmap.
            </p>
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded text-xs text-cyan-300 flex items-start gap-2 max-w-lg">
              <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">Testing Quick-Guide:</span>
                Create any virtual room right now by entering a unique Room Code (e.g., <code className="text-white">my-team</code>) and a custom password. You can immediately log back in with the same credentials to retrieve, read, and write logs!
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded text-xs text-emerald-300 max-w-lg space-y-2.5">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">General Public Vent Room</span>
                  Don't have a team? Pile into the shared room — open to everyone. Containment Block Code: <code className="text-white">chat</code> · Containment Hatch Password: <code className="text-white">chat</code>.
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAccessRoom(undefined, "chat", "chat")}
                disabled={loading}
                className="w-full bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/30 text-emerald-200 font-mono-tech text-xs uppercase font-bold py-2 px-4 rounded transition cursor-pointer flex justify-center items-center gap-1.5 disabled:opacity-50"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Enter public vent room</span>
              </button>
            </div>
            
            {errorMsg && (
              <p className="text-xs text-red-400 font-mono-tech bg-red-950/20 p-2 border border-red-500/20 rounded animate-shake">
                ⚠️ {errorMsg}
              </p>
            )}
          </div>

          <form onSubmit={handleAccessRoom} className="lg:col-span-2 bg-[#060913] border border-red-500/10 p-5 rounded-lg space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono-tech text-gray-400 uppercase mb-1">
                Containment Block Code (Room Code)
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. legacy-codebases, pipeline-fire"
                className="w-full bg-[#030712] border border-red-500/20 rounded px-3 py-1.5 text-xs text-gray-100 placeholder:text-gray-700 font-mono-tech focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono-tech text-gray-400 uppercase mb-1">
                Containment Hatch Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure ventilation key"
                className="w-full bg-[#030712] border border-red-500/20 rounded px-3 py-1.5 text-xs text-gray-100 placeholder:text-gray-700 font-mono-tech focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-950/40 border border-red-500/40 hover:bg-red-900/30 text-red-300 font-mono-tech text-xs uppercase font-bold py-2 px-4 rounded transition cursor-pointer flex justify-center items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{loading ? "BREACHING HATCH..." : "BREAK CONTAINMENT HATCH"}</span>
            </button>
          </form>
        </div>
      ) : (
        /* ACTIVE VIEWED PRIVATE TEAM LOCKER */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Active Log entries list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center bg-[#060913] p-3 rounded border border-red-500/10 mb-2">
              <span className="text-xs font-mono-tech text-red-400 flex items-center gap-1.5 uppercase font-bold">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                ACTIVE LOGS IN BLOCK: {activeRoomName}
              </span>
              <span className="text-[10px] font-mono-tech text-gray-500 uppercase">
                {roomDumps.length} records retrieved
              </span>
            </div>

            {roomDumps.length === 0 ? (
              <div className="bg-[#05070e] border border-dashed border-red-500/10 p-12 text-center rounded">
                <p className="text-xs font-mono-tech text-gray-500 uppercase">
                  No toxic waste currently detected inside this locker.
                </p>
                <p className="text-[11px] text-gray-600 mt-1 max-w-xs mx-auto">
                  Use the release valve on the right to start dumping your critical secrets onto the encrypted heap.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 lg:max-h-[380px] lg:overflow-y-auto pr-1">
                {roomDumps.map(dump => (
                  <div key={dump.id} className="bg-[#05070e] border border-red-500/20 p-4 rounded-lg relative overflow-hidden">
                    {/* Tiny diagnostic stamp label */}
                    <div className="absolute top-3 right-3 text-[9px] font-mono-tech text-red-400/50 uppercase border border-red-500/20 px-1 bg-red-950/20 rounded">
                      SEV: {dump.emotionalTragedy}/10
                    </div>

                    <div className="font-mono-tech text-xs text-red-300 font-bold uppercase">
                      {dump.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono-tech mt-0.5 flex gap-3">
                      <span>STAMPED_BY: {dump.creator}</span>
                      <span>TECH: {dump.techStack}</span>
                    </div>

                    <p className="text-xs text-gray-300 mt-2 italic border-l border-red-500/20 pl-2.5 break-words">
                      "{linkify(dump.description)}"
                    </p>

                    {dump.id === "hunt-vault-portal" && (
                      <a
                        href="/secretworld.html"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black font-extrabold uppercase tracking-wider text-xs sm:text-sm py-3 px-4 rounded-lg transition shadow-[0_0_18px_rgba(245,200,60,0.45)]"
                      >
                        Enter the buried world →
                      </a>
                    )}

                    <div className="text-[10px] text-red-400/80 mt-2 font-mono-tech flex items-center gap-1 bg-red-950/10 p-1 rounded max-w-max">
                      <span>💀 AUTOPSY:</span>
                      <span className="text-gray-400">{dump.causeOfDeath}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add a venting log valve form */}
          <form onSubmit={handleCreateVentingLog} className="lg:col-span-2 bg-[#060913] border border-red-500/15 p-5 rounded-lg space-y-3">
            <h4 className="font-mono-tech text-xs text-red-400 font-bold uppercase tracking-wider border-b border-red-500/10 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-green-400" />
              RELEASE VALVE VENTS
            </h4>

            <div>
              <label className="block text-[10px] font-mono-tech text-gray-500 uppercase mb-1">
                * Issue Code or System Name
              </label>
              <input
                type="text"
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="e.g. Infinite K8s cluster memory leak"
                className="w-full bg-[#030712] border border-red-500/20 rounded px-2.5 py-1.5 text-xs text-gray-100 placeholder:text-gray-700 focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono-tech text-gray-500 uppercase mb-1">
                * What happened? (Anonymously Vent)
              </label>
              <textarea
                rows={3}
                value={vDesc}
                onChange={(e) => setVDesc(e.target.value)}
                placeholder="Tell us what broke, who called a 3AM emergency P0, or which consultant caused this horror..."
                className="w-full bg-[#030712] border border-red-500/20 rounded p-2.5 text-xs text-gray-100 placeholder:text-gray-700 focus:outline-none focus:border-red-400"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-mono-tech text-gray-500 uppercase mb-1">
                Anatomy of failure / Root Cause
              </label>
              <input
                type="text"
                value={vCause}
                onChange={(e) => setVCause(e.target.value)}
                placeholder="e.g. AWS elastic IP mismatch after wild script"
                className="w-full bg-[#030712] border border-red-500/20 rounded px-2.5 py-1.5 text-xs text-gray-100 placeholder:text-gray-700 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-mono-tech text-gray-500 uppercase mb-0.5">
                  Tech Involved
                </label>
                <input
                  type="text"
                  value={vTech}
                  onChange={(e) => setVTech(e.target.value)}
                  placeholder="e.g. Jenkins, Cobol"
                  className="w-full bg-[#030712] border border-red-500/20 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono-tech text-gray-500 uppercase mb-0.5">
                  Signature / Handles
                </label>
                <input
                  type="text"
                  value={vCreator}
                  onChange={(e) => setVCreator(e.target.value)}
                  placeholder="e.g. Displaced PM"
                  className="w-full bg-[#030712] border border-red-500/20 rounded px-2 py-1 text-xs text-gray-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono-tech text-gray-500 uppercase mb-0.5">
                Stress Level Impact ({vTragedy}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={vTragedy}
                onChange={(e) => setVTragedy(Number(e.target.value))}
                className="w-full accent-red-500 h-1 bg-red-950 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-red-900/30 hover:bg-red-800/20 border border-red-500/50 text-red-300 font-mono-tech text-xs uppercase font-bold py-2 rounded transition cursor-pointer flex justify-center items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-red-300/40 border-t-red-300 rounded-full animate-spin" />
                  <span>SEALING THE VAULT...</span>
                </>
              ) : (
                <span>LOCK AND SEAL TO COLD VAULT</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
