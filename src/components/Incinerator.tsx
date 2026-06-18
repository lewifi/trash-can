import { useEffect, useState } from "react";
import { Flame, Trash2, RefreshCw, Lock, Heart, Flower2, AlertTriangle, ShieldAlert } from "lucide-react";

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
  isPrivate?: boolean;
  roomName?: string;
  imageUrl?: string;
}

export default function Incinerator() {
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/incinerator/dumps");
      if (res.status === 403) {
        setError("Not authorized. Make sure you're signed in via Cloudflare Access with the admin account.");
        setDumps([]);
        return;
      }
      if (!res.ok) {
        let detail = "";
        try {
          detail = (await res.json()).error || "";
        } catch {}
        throw new Error(detail || `Request failed (${res.status})`);
      }
      setDumps(await res.json());
    } catch (e: any) {
      setError(e.message || "Failed to load entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const incinerate = async (d: Dump) => {
    if (!confirm(`Permanently incinerate "${d.name}"? This cannot be undone.`)) return;
    setDeletingId(d.id);
    try {
      const res = await fetch(`/api/incinerator/dumps/${encodeURIComponent(d.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let detail = "";
        try {
          detail = (await res.json()).error || "";
        } catch {}
        throw new Error(detail || `Delete failed (${res.status})`);
      }
      setDumps((prev) => prev.filter((x) => x.id !== d.id));
    } catch (e: any) {
      alert(`Could not delete: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

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
              <p className="text-xs text-gray-500 font-mono">
                Admin disposal bay · {dumps.length} entries
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-amber-400 text-gray-300 text-xs font-mono uppercase px-3 py-2 rounded transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
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

        <div className="space-y-3">
          {dumps.map((d) => (
            <div
              key={d.id}
              className="flex gap-4 bg-[#0b0f19] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition"
            >
              {d.imageUrl ? (
                <img
                  src={d.imageUrl}
                  alt=""
                  className="w-16 h-16 rounded object-cover flex-shrink-0 border border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-900 border border-gray-800 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-gray-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-100 truncate">{d.name}</span>
                  {d.isPrivate && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">
                      <Lock className="w-3 h-3" /> {d.roomName || "private"}
                    </span>
                  )}
                  {d.category && (
                    <span className="text-[10px] font-mono uppercase text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                      {d.category}
                    </span>
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

              <button
                onClick={() => incinerate(d)}
                disabled={deletingId === d.id}
                className="self-center flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 hover:border-red-400 text-red-300 text-xs font-mono uppercase font-bold px-3 py-2 rounded transition disabled:opacity-50 flex-shrink-0"
              >
                {deletingId === d.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Flame className="w-4 h-4" />
                )}
                Burn
              </button>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-600 mt-8 flex items-center gap-2 font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          Deletions are permanent. This page is protected by Cloudflare Access.
        </p>
      </div>
    </div>
  );
}
