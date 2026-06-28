import { useEffect, useRef, useState } from "react";
import {
  Flame, Trash2, RefreshCw, Lock, Heart, Flower2, AlertTriangle, ChevronLeft, Eye, EyeOff,
  ShieldAlert, Pencil, Save, X, ImagePlus,
} from "lucide-react";

interface Dump {
  id: string;
  name: string;
  description: string;
  category?: string;
  causeOfDeath?: string;
  techStack?: string;
  creator?: string;
  createdAt?: string;
  likes?: number;
  flowers?: number;
  emotionalTragedy?: number;
  isPrivate?: boolean;
  roomName?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

const CATEGORIES = ["saas", "web", "web3", "mobile", "ai", "tech", "hardware", "game", "dev_tool", "entertainment", "other"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

export default function Incinerator() {
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [view, setView] = useState<"pending" | "vents" | "live" | "all">("pending");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Dump | null>(null);
  const [saving, setSaving] = useState(false);
  const [coordsInput, setCoordsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [geoQuery, setGeoQuery] = useState("");
  const [geoStatus, setGeoStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/incinerator/dumps");
      if (res.status === 403) {
        setError("Not authorized. Sign in via Cloudflare Access with the admin account.");
        setDumps([]);
        return;
      }
      if (!res.ok) {
        let d = "";
        try { d = (await res.json()).error || ""; } catch {}
        throw new Error(d || `Request failed (${res.status})`);
      }
      setDumps(await res.json());
    } catch (e: any) {
      setError(e.message || "Failed to load entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (d: Dump) => {
    setPublishingId(d.id);
    try {
      const res = await fetch(`/api/incinerator/dumps/${encodeURIComponent(d.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: !d.isPrivate }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDumps((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      }
    } finally {
      setPublishingId(null);
    }
  };

  const incinerate = async (d: Dump) => {
    if (!confirm(`Permanently incinerate "${d.name}"? This cannot be undone.`)) return;
    setDeletingId(d.id);
    try {
      const res = await fetch(`/api/incinerator/dumps/${encodeURIComponent(d.id)}`, { method: "DELETE" });
      if (!res.ok) {
        let d2 = "";
        try { d2 = (await res.json()).error || ""; } catch {}
        throw new Error(d2 || `Delete failed (${res.status})`);
      }
      setDumps((p) => p.filter((x) => x.id !== d.id));
    } catch (e: any) {
      alert(`Could not delete: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (d: Dump) => {
    setEditingId(d.id);
    setDraft({ ...d });
    setCoordsInput(
      d.latitude !== undefined && d.longitude !== undefined ? `${d.latitude}, ${d.longitude}` : ""
    );
    setDateInput(
      d.createdAt && !Number.isNaN(new Date(d.createdAt).getTime())
        ? new Date(new Date(d.createdAt).getTime() - new Date(d.createdAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        : ""
    );
    setGeoQuery("");
    setGeoStatus("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };
  const setField = (k: keyof Dump, v: any) =>
    setDraft((p) => (p ? { ...p, [k]: v } : p));

  const lookupPlace = async () => {
    const q = geoQuery.trim();
    if (!q) return;
    setGeoStatus("Searching\u2026");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) { setGeoStatus(data.error || "Not found."); return; }
      setCoordsInput(`${Number(data.lat).toFixed(4)}, ${Number(data.lng).toFixed(4)}`);
      setGeoStatus(`\uD83D\uDCCD ${data.display}`);
    } catch {
      setGeoStatus("Lookup failed.");
    }
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Image is over 2 MB. Please use a smaller one (images are stored inline).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setField("imageUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const parts = coordsInput.split(",").map((x) => parseFloat(x.trim()));
      const hasCoords = parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1]);
      const payload: Record<string, unknown> = {
        name: draft.name,
        description: draft.description,
        creator: draft.creator,
        category: draft.category,
        causeOfDeath: draft.causeOfDeath,
        techStack: draft.techStack,
        emotionalTragedy: draft.emotionalTragedy,
        imageUrl: draft.imageUrl ?? "",
        createdAt: dateInput && !Number.isNaN(new Date(dateInput).getTime()) ? new Date(dateInput).toISOString() : draft.createdAt,
      };
      if (hasCoords) {
        payload.latitude = parts[0];
        payload.longitude = parts[1];
      }
      const res = await fetch(`/api/incinerator/dumps/${encodeURIComponent(draft.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let d = "";
        try { d = (await res.json()).error || ""; } catch {}
        throw new Error(d || `Save failed (${res.status})`);
      }
      const updated = await res.json();
      setDumps((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      cancelEdit();
    } catch (e: any) {
      alert(`Could not save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#060913] border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-cyan-400";

  return (
    <div className="min-h-screen bg-[#05070e] text-gray-200 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between gap-3 mb-6 border-b border-orange-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-gray-900 rounded-lg border border-orange-700/60">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-500 to-amber-500 opacity-40 blur" />
              <Flame className="w-7 h-7 text-amber-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                THE INCINERATOR
              </h1>
              <p className="text-xs text-gray-500 font-mono">Admin disposal bay · {dumps.length} entries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/"
              className="flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-cyan-400 text-gray-300 text-xs font-mono uppercase px-3 py-2 rounded transition">
              <ChevronLeft className="w-4 h-4" /> Back to site
            </a>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-amber-400 text-gray-300 text-xs font-mono uppercase px-3 py-2 rounded transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded text-red-300 text-sm flex items-start gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading && !error && (
          <div className="text-center py-16 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3" />
            <p className="text-sm font-mono uppercase tracking-wide">Loading the landfill…</p>
          </div>
        )}

        {!loading && !error && dumps.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Trash2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-mono uppercase tracking-wide">The graveyard is empty.</p>
          </div>
        )}

        {!loading && !error && dumps.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              ["pending", "⏳ To review", dumps.filter((d) => d.isPrivate && !d.roomName).length],
              ["vents", "🔒 Vent posts", dumps.filter((d) => d.isPrivate && d.roomName).length],
              ["live", "✅ Live", dumps.filter((d) => !d.isPrivate).length],
              ["all", "All", dumps.length],
            ] as const).map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setView(key as typeof view)}
                className={`text-xs font-mono uppercase font-bold px-3 py-1.5 rounded border transition ${view === key ? "bg-cyan-900/50 border-cyan-500/60 text-cyan-200" : "bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200"}`}
              >
                {label} <span className="opacity-70">({n})</span>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {dumps
            .filter((d) =>
              view === "all" ? true :
              view === "pending" ? (d.isPrivate && !d.roomName) :
              view === "vents" ? (d.isPrivate && !!d.roomName) :
              !d.isPrivate
            )
            .map((d) =>
            editingId === d.id && draft ? (
              <div key={d.id} className="bg-[#0b0f19] border border-cyan-500/40 rounded-lg p-4 space-y-3">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    {draft.imageUrl ? (
                      <img src={draft.imageUrl} alt="" className="w-24 h-24 rounded object-cover border border-gray-700" />
                    ) : (
                      <div className="w-24 h-24 rounded bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center">
                        <ImagePlus className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
                    <button onClick={() => fileRef.current?.click()}
                      className="text-[11px] font-mono uppercase text-cyan-300 border border-cyan-500/40 px-2 py-1 rounded hover:bg-cyan-950">
                      {draft.imageUrl ? "Replace" : "Add image"}
                    </button>
                    {draft.imageUrl && (
                      <button onClick={() => setField("imageUrl", "")}
                        className="text-[11px] font-mono uppercase text-red-300 hover:underline">remove</button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} placeholder="Name" value={draft.name || ""} onChange={(e) => setField("name", e.target.value)} />
                      <input className={inputCls} placeholder="Creator" value={draft.creator || ""} onChange={(e) => setField("creator", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select className={inputCls} value={draft.category || "other"} onChange={(e) => setField("category", e.target.value)}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c === "web3" ? "cloud native" : c}</option>)}
                      </select>
                      <input className={inputCls} placeholder="Cause of death" value={draft.causeOfDeath || ""} onChange={(e) => setField("causeOfDeath", e.target.value)} />
                    </div>
                    <input className={inputCls} placeholder="Tech stack" value={draft.techStack || ""} onChange={(e) => setField("techStack", e.target.value)} />
                    <div className="flex gap-2">
                      <input
                        className={`${inputCls} flex-1`}
                        placeholder="Type a place: city, country"
                        value={geoQuery}
                        onChange={(e) => setGeoQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookupPlace(); } }}
                      />
                      <button type="button" onClick={lookupPlace} className="text-[11px] font-mono uppercase text-cyan-300 border border-cyan-500/40 px-3 rounded hover:bg-cyan-950">Find</button>
                    </div>
                    {geoStatus && <p className="text-[11px] text-gray-400 break-words">{geoStatus}</p>}
                    <input className={inputCls} placeholder="GPS coords: lat, lng (e.g. 40.7128, -74.0060)" value={coordsInput} onChange={(e) => setCoordsInput(e.target.value)} />
                    <label className="block text-[10px] uppercase font-mono text-gray-500">
                      Publish date (controls feed order)
                      <input
                        type="datetime-local"
                        className={inputCls}
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                      />
                    </label>
                    <label className="block text-[10px] uppercase font-mono text-gray-500">
                      Tragedy {draft.emotionalTragedy ?? 5}/10
                      <input type="range" min={1} max={10} value={draft.emotionalTragedy ?? 5}
                        onChange={(e) => setField("emotionalTragedy", Number(e.target.value))}
                        className="w-full accent-amber-400" />
                    </label>
                    <textarea className={inputCls} rows={3} placeholder="Description"
                      value={draft.description || ""} onChange={(e) => setField("description", e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={cancelEdit}
                    className="flex items-center gap-1.5 text-xs font-mono uppercase text-gray-400 border border-gray-700 px-3 py-2 rounded hover:bg-gray-900">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-cyan-200 bg-cyan-900/40 border border-cyan-500/50 px-3 py-2 rounded hover:bg-cyan-900/70 disabled:opacity-50">
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                  </button>
                </div>
              </div>
            ) : (
              <div key={d.id} className="flex gap-4 bg-[#0b0f19] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0 border border-gray-700" />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-900 border border-gray-800 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-100 truncate">{d.name}</span>
                    {d.isPrivate && d.roomName && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> {d.roomName}
                      </span>
                    )}
                    {d.isPrivate && !d.roomName && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                        <EyeOff className="w-3 h-3" /> held
                      </span>
                    )}
                    {!d.isPrivate && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                        <Eye className="w-3 h-3" /> live
                      </span>
                    )}
                    {d.category && (
                      <span className="text-[10px] font-mono uppercase text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">{d.category === "web3" ? "cloud native" : d.category}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 break-words">{d.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 font-mono">
                    <span>by {d.creator || "Anonymous"}</span>
                    {d.createdAt && <span>{new Date(d.createdAt).toLocaleDateString()}</span>}
                    <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" />{d.likes ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><Flower2 className="w-3 h-3" />{d.flowers ?? 0}</span>
                  </div>
                </div>
                <div className="self-center flex flex-col gap-2 flex-shrink-0">
                  {!d.roomName && (
                    <button onClick={() => togglePublish(d)} disabled={publishingId === d.id}
                      className={`flex items-center gap-1.5 text-xs font-mono uppercase font-bold px-3 py-2 rounded transition disabled:opacity-50 ${d.isPrivate ? "bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300" : "bg-gray-900 border border-gray-700 hover:border-amber-400 text-gray-400 hover:text-amber-300"}`}>
                      {publishingId === d.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : d.isPrivate ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {d.isPrivate ? "Publish" : "Hold"}
                    </button>
                  )}
                  <button onClick={() => startEdit(d)}
                    className="flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-500/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono uppercase font-bold px-3 py-2 rounded transition">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => incinerate(d)} disabled={deletingId === d.id}
                    className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 hover:border-red-400 text-red-300 text-xs font-mono uppercase font-bold px-3 py-2 rounded transition disabled:opacity-50">
                    {deletingId === d.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />} Burn
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <p className="text-[11px] text-gray-600 mt-8 flex items-center gap-2 font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          Edits and deletions are permanent. Images are stored inline — keep them under 2 MB. Protected by Cloudflare Access.
        </p>
      </div>
    </div>
  );
}
