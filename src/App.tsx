import React, { useState, useEffect, useRef } from "react";
import HeartbreakMap from "./components/HeartbreakMap";
import OracleAppraiser from "./components/OracleAppraiser";
import RescueRemix from "./components/RescueRemix";
import TeamVenting from "./components/TeamVenting";
import TiersUpgrades from "./components/TiersUpgrades";
import ArtifactVisualizer from "./components/ArtifactVisualizer";
import GhostRating from "./components/GhostRating";
import {
  Trash2,
  Skull,
  Flame,
  HeartCrack,
  Flower2,
  Sparkles,
  MapPin,
  Search,
  Lock,
  Unlock,
  Send,
  Layers,
  Compass,
  HelpCircle,
  Activity,
  HardDrive,
  Terminal,
  Sliders,
  Eye,
  EyeOff,
  Cpu,
  AlertTriangle,
  TrendingDown,
  Plus,
  X,
  Coins,
  Upload,
  Camera,
  ArrowRight,
  ExternalLink,
  Shield,
  FileCode2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  ScrollText,
  Menu
} from "lucide-react";

interface DeadProject {
  id: string;
  name: string;
  description: string;
  category: "saas" | "web" | "web3" | "mobile" | "ai" | "tech" | "hardware" | "game" | "dev_tool" | "entertainment" | "other";
  causeOfDeath: string;
  emotionalTragedy: number;
  techStack: string;
  artifactIcon: string;
  likes: number;
  flowers: number;
  creator: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  aiAppraisal?: string;
  diagnosticScore?: number;
  isPrivate?: boolean;
  roomPassword?: string;
  roomName?: string;
  recyclingPlan?: string;
  appraisal?: string;
  postMortem?: string;
}

// Hand-written patch notes from the gravekeeper, newest first. Written in site voice.
const CRYPT_LOG: { date: string; title: string; body: string; tag: string }[] = [
  {
    date: "2026-06-19",
    tag: "NEW BINS",
    title: "Three new piles opened in the yard",
    body: "Web, Tech, and Entertainment (Fyre-Festival-grade disasters welcome) now have their own piles. No more cramming a doomed gadget or a scammy festival into 'Other' like a coward.",
  },
  {
    date: "2026-06-19",
    tag: "MAP",
    title: "Pin your wreck to a map",
    body: "You can now type a city, country when you bury a project, so the world can see exactly where the dream hit the skip. Optional — some wrecks prefer to stay off the map.",
  },
  {
    date: "2026-06-15",
    tag: "THE CHEF",
    title: "The Waste Chef sharpened the knives",
    body: "The AI roast is bigger, louder, and meaner. The RUN CRITIQUE button now glows because pressing it is the most fun you'll have grieving today.",
  },
  {
    date: "2026-06-12",
    tag: "HOUSEKEEPING",
    title: "Vent rooms sealed shut",
    body: "Private venting-room confessions were leaking into the public landfill. They've been walled back up. What's whispered in the vent stays in the vent.",
  },
  {
    date: "2026-06-08",
    tag: "SHARE",
    title: "Every dump gets a card you can share",
    body: "Drop a /grave link anywhere and it unfurls with its own neon card. Spread the bad news beautifully.",
  },
];

// Compact "X ago" for the freshly-buried feed.
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30); if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

const APP_VERSION = "1.0.0";
const catLabel = (c: string): string => (c === "web3" ? "Cloud Native" : c);

export default function App() {
  // Navigation tabs
  type TabId = "dump" | "memorials" | "oracle" | "disposal" | "contracts" | "log";
  const tabFromPath = (): TabId => {
    const pth = window.location.pathname.replace(/\/+$/, "");
    if (pth === "/memorials") return "memorials";
    if (pth === "/oracle" || pth === "/roastoracle") return "oracle";
    if (pth === "/disposal") return "disposal";
    if (pth === "/contracts") return "contracts";
    if (pth === "/log") return "log";
    if (pth.startsWith("/grave/")) return "memorials";
    return "dump";
  };
  const [activeTab, setActiveTab] = useState<TabId>(tabFromPath());

  // Tab navigation with clean URLs, so refresh / back-button stay on the page.
  const navTab = (tab: TabId) => {
    setActiveTab(tab);
    const path = tab === "dump" ? "/" : tab === "oracle" ? "/roastoracle" : `/${tab}`;
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
  };
  useEffect(() => {
    const onPop = () => setActiveTab(tabFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const detailRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  // Wheel: vertical scroll drives the carousel horizontally without page-jump (fixes Windows jumpiness).
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Trackpad gestures (small/continuous deltas, or any horizontal) keep native
      // scrolling so the page can still move up/down. Only translate real mouse
      // wheels (vertical-only, larger discrete steps) into horizontal carousel scroll.
      if (e.deltaX !== 0 || Math.abs(e.deltaY) < 40) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeTab]);

  // State for original/fetched dumps
  const [dumps, setDumps] = useState<DeadProject[]>([]);
  const [filteredDumps, setFilteredDumps] = useState<DeadProject[]>([]);
  const [selectedDump, setSelectedDump] = useState<DeadProject | null>(null);
  // When a different grave is opened, drop the previous Chef appraisal so stale text
  // doesn't carry over. (No scroll-into-view: stay where the grave was clicked.)
  useEffect(() => {
    setAppraiseResult(null);
  }, [selectedDump?.id]);

  // Lock the page behind the detail modal and restore the exact scroll spot on close,
  // so closing a card returns you to where you were instead of jumping under the map.
  useEffect(() => {
    if (!selectedDump) return;
    const y = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${y}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      window.scrollTo(0, y);
    };
  }, [!!selectedDump]);


  // Deep-link: open /grave/:id straight to that grave once the dumps load.
  const [copiedShare, setCopiedShare] = useState(false);
  useEffect(() => {
    const m = window.location.pathname.match(/^\/grave\/(.+)$/);
    if (m && dumps.length && !selectedDump) {
      const g = dumps.find((d) => d.id === decodeURIComponent(m[1]));
      if (g) setSelectedDump(g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dumps]);

  const shareGrave = (id: string) => {
    const link = `${window.location.origin}/grave/${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 1800);
      });
    } else {
      window.prompt("Copy this link:", link);
    }
  };

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "flowers" | "tragedy">("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setVisibleCount(12); }, [searchQuery, selectedCategory, sortBy]);
  // Reveal more grave cards as the sentinel scrolls into view (paginate on demand).
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount((c) => c + 12); },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filteredDumps.length, visibleCount]);

  // Private Venting Room states
  const [roomNameInput, setRoomNameInput] = useState("");
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const [roomDumps, setRoomDumps] = useState<DeadProject[]>([]);
  const [roomError, setRoomError] = useState("");

  // Create/Dump Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<DeadProject["category"]>("saas");
  const [formPlace, setFormPlace] = useState("");
  const [formCoords, setFormCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formGeoStatus, setFormGeoStatus] = useState("");
  const [formCause, setFormCause] = useState("");
  const [formTech, setFormTech] = useState("");
  const [formCreator, setFormCreator] = useState("");
  const [formTragedy, setFormTragedy] = useState(5);
  const [formIcon, setFormIcon] = useState("skull");
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formRoomName, setFormRoomName] = useState("");
  const [formRoomPassword, setFormRoomPassword] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  
  // Custom interactive settings
  const [customSkin, setCustomSkin] = useState<"cyber-lime" | "radium" | "vaporwave" | "rust-belter">("cyber-lime");
  const [simulationSpeed, setSimulationSpeed] = useState<"static" | "flow" | "frenzy">("flow");

  // AI Appraisal panel states (Independent submission or clicking audit)
  const [appraiseLoading, setAppraiseLoading] = useState(false);
  const [appraiseResult, setAppraiseResult] = useState<{
    score?: number;
    appraisal?: string;
    postMortem?: string;
    recyclingPlan?: string;
    error?: string;
  } | null>(null);

  // Drag and drop image states
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch standard public dumps on load
  const fetchDumps = async () => {
    try {
      const res = await fetch("/api/dumps");
      if (res.ok) {
        const data = await res.json();
        setDumps(data);
      }
    } catch (e) {
      console.error("Error fetching dumps:", e);
    }
  };

  useEffect(() => {
    fetchDumps();
  }, []);

  // Filter and sort handlers
  useEffect(() => {
    let result = dumps.filter((d) => !d.isPrivate);

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(d => d.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.techStack.toLowerCase().includes(query) ||
          d.causeOfDeath.toLowerCase().includes(query) ||
          d.creator.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "likes") {
      result.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === "flowers") {
      result.sort((a, b) => b.flowers - a.flowers);
    } else if (sortBy === "tragedy") {
      result.sort((a, b) => b.emotionalTragedy - a.emotionalTragedy);
    }

    setFilteredDumps(result);
  }, [dumps, searchQuery, selectedCategory, sortBy]);

  // Form submission handler
  const [submitting, setSubmitting] = useState(false);
  const lookupDumpPlace = async () => {
    const q = formPlace.trim();
    if (!q) return;
    setFormGeoStatus("Searching\u2026");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) { setFormGeoStatus(data.error || "Not found."); return; }
      setFormCoords({ lat: Number(data.lat), lng: Number(data.lng) });
      setFormGeoStatus(`\uD83D\uDCCD ${data.display}`);
    } catch {
      setFormGeoStatus("Lookup failed.");
    }
  };

  const handleDumpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDescription) {
      alert("Please provide at least a project name and a brief description of its tragedy.");
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      category: formCategory,
      causeOfDeath: formCause || "Unexplained sudden freeze",
      emotionalTragedy: formTragedy,
      techStack: formTech || "None declared",
      artifactIcon: formIcon,
      creator: formCreator || "Anonymous Grave-keeper",
      isPrivate: formIsPrivate,
      roomName: formIsPrivate ? formRoomName : undefined,
      roomPassword: formIsPrivate ? formRoomPassword : undefined,
      imageUrl: formImageUrl || undefined,
      ...(formCoords ? { latitude: formCoords.lat, longitude: formCoords.lng } : {}),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/dumps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Reset form
        setFormName("");
        setFormDescription("");
        setFormCause("");
        setFormTech("");
        setFormCreator("");
        setFormTragedy(5);
        setFormIsPrivate(false);
        setFormRoomName("");
        setFormRoomPassword("");
        setFormImageUrl("");
        setFormPlace("");
        setFormCoords(null);
        setFormGeoStatus("");
        
        // Refresh & announce
        await fetchDumps();
        navTab("memorials");
        
        // Auto select the new dump for detail preview
        const data = await res.json();
        setSelectedDump(data);
      } else {
        const errData = await res.json();
        alert(`Error dumping project: ${errData.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to record the tragedy. Database signals blocked.");
    } finally {
      setSubmitting(false);
    }
  };

  // Track which dumps the visitor has already mourned/flowered this session
  const [voted, setVoted] = useState<Record<string, { like?: boolean; flower?: boolean }>>({});

  // Upvote/Like trigger (one mourn + one flower per dump per session)
  const handleAction = async (id: string, type: "like" | "flower") => {
    if (voted[id]?.[type]) return; // already counted
    // Optimistically lock the button so it greys out immediately
    setVoted(prev => ({ ...prev, [id]: { ...prev[id], [type]: true } }));
    try {
      const res = await fetch(`/api/dumps/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const updated = await res.json();
        // Update local items in lists
        setDumps(prev => prev.map(item => (item.id === id ? updated : item)));
        if (selectedDump && selectedDump.id === id) {
          setSelectedDump(updated);
        }
        if (roomDumps.length > 0) {
          setRoomDumps(prev => prev.map(item => (item.id === id ? updated : item)));
        }
      } else {
        // Failed: unlock so they can retry
        setVoted(prev => ({ ...prev, [id]: { ...prev[id], [type]: false } }));
      }
    } catch (e) {
      console.error(e);
      setVoted(prev => ({ ...prev, [id]: { ...prev[id], [type]: false } }));
    }
  };

  // Connect & load team room
  const handleAccessRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput) return;
    setRoomError("");

    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomNameInput)}?password=${encodeURIComponent(roomPasswordInput)}`);
      if (res.ok) {
        const data = await res.json();
        setRoomDumps(data);
        setCurrentRoomName(roomNameInput);
        if (data.length === 0) {
          setRoomError("Room is currently empty or does not exist. Create a private dump using this room identity first!");
        }
      } else {
        const err = await res.json();
        setRoomError(err.error || "Failed to penetrate safety valves.");
        setRoomDumps([]);
      }
    } catch (e) {
      setRoomError("Faulty terminal transmission.");
    }
  };

  // AI Appraisal request
  const handleAppraise = async (project: {
    name: string;
    description: string;
    category: string;
    causeOfDeath: string;
    techStack: string;
  }) => {
    setAppraiseLoading(true);
    setAppraiseResult(null);

    try {
      const res = await fetch("/api/appraise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });

      if (res.ok) {
        const data = await res.json();
        setAppraiseResult(data);
      } else {
        const err = await res.json();
        setAppraiseResult({ error: err.error || "Failed to perform diagnostic analysis." });
      }
    } catch (e) {
      setAppraiseResult({ error: "The AI Oracle was disconnected from its synapses." });
    } finally {
      setAppraiseLoading(false);
    }
  };

  // Helper to draw specific artifact icons
  const renderArtifactIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "skull":
        return <Skull className={className} />;
      case "fire":
        return <Flame className={className} />;
      case "heart-broken":
        return <HeartCrack className={className} />;
      case "monitor":
        return <HardDrive className={className} />;
      case "server":
        return <Cpu className={className} />;
      default:
        return <Trash2 className={className} />;
    }
  };

  // Theme skin visual helper classes
  const getSkinClasses = () => {
    switch (customSkin) {
      case "radium":
        return {
          bannerBg: "from-green-950/40 via-black to-slate-950/20",
          accentColor: "text-green-400",
          accentBorder: "border-green-500/30",
          accentBg: "bg-green-500/10",
          glowClass: "neon-glow-green",
          badgeBg: "bg-green-500/20 text-green-300",
          buttonColor: "hover:bg-green-500/20 bg-green-900/30 text-green-400 border-green-500/40",
          textColor: "text-green-100",
          headingGlow: "shadow-green-500/20",
        };
      case "vaporwave":
        return {
          bannerBg: "from-pink-950/40 via-black to-fuchsia-950/20",
          accentColor: "text-pink-400",
          accentBorder: "border-pink-500/30",
          accentBg: "bg-pink-500/10",
          glowClass: "neon-glow-amber",
          badgeBg: "bg-pink-500/20 text-pink-300",
          buttonColor: "hover:bg-pink-500/20 bg-pink-900/30 text-pink-400 border-pink-500/40",
          textColor: "text-pink-100",
          headingGlow: "shadow-pink-500/20",
        };
      case "rust-belter":
        return {
          bannerBg: "from-amber-950/40 via-black to-amber-950/20",
          accentColor: "text-amber-500",
          accentBorder: "border-amber-600/30",
          accentBg: "bg-amber-600/10",
          glowClass: "neon-glow-amber",
          badgeBg: "bg-amber-600/20 text-amber-200",
          buttonColor: "hover:bg-amber-600/20 bg-amber-950/30 text-amber-500 border-amber-600/40",
          textColor: "text-amber-100",
          headingGlow: "shadow-amber-600/20",
        };
      case "cyber-lime":
      default:
        return {
          bannerBg: "from-cyan-950/40 via-black to-slate-950/20",
          accentColor: "text-cyan-400",
          accentBorder: "border-cyan-500/30",
          accentBg: "bg-cyan-500/10",
          glowClass: "neon-glow-cyan",
          badgeBg: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
          buttonColor: "hover:bg-cyan-500/20 bg-cyan-900/30 text-cyan-400 border border-cyan-500/40",
          textColor: "text-cyan-100",
          headingGlow: "shadow-cyan-500/20",
        };
    }
  };

  const skin = getSkinClasses();

  // Static items for Hall of fame / Museum Carousel
  const museumHighRated = dumps.filter(d => d.likes > 300);

  // Geo coordinate hotspot highlights (Heatmap of Heartbreak)
  // Let's filter some coordinate groups
  const coordinateDumps = dumps.filter(d => d.latitude && d.longitude);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const NAV_ITEMS = [
    { id: "dump", label: "Dump", Icon: Plus },
    { id: "memorials", label: "Landfill", Icon: Compass },
    { id: "oracle", label: "Roast Oracle", Icon: Star },
    { id: "disposal", label: "Vent", Icon: Shield },
    { id: "contracts", label: "Salvage", Icon: Coins },
    { id: "log", label: "Notes", Icon: ScrollText },
  ] as const;

  return (
    <div className="relative min-h-screen bg-[#030712] text-gray-200 selection:bg-cyan-500 selection:text-black scanlines">
      
      {/* Decorative ambient background grids */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-blue-950/10 via-cyan-950/5 to-transparent pointer-events-none" />
      <div className="absolute top-[15%] left-[10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[150px] pointer-events-none animate-pulse-slow" />

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-md border-b border-gray-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Zone */}
          <div className="flex items-center justify-between gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
            <div className="relative p-2 bg-gray-900 rounded-lg border border-gray-700/80 group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-500 to-cyan-500 opacity-30 group-hover:opacity-100 transition-opacity blur" />
              <Trash2 className="w-7 h-7 text-cyan-400 relative z-10 animate-flicker" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-wider font-monument bg-gradient-to-r from-cyan-400 via-teal-200 to-red-400 bg-clip-text text-transparent">
                  Roast Graveyard
                </span>
                <span className="text-[10px] font-mono-tech border border-red-500/30 text-red-400 px-1.5 py-0.2 rounded uppercase animate-flicker">
                  trash-can.net
                </span>
              </div>
              <p className="text-xs text-gray-500 tracking-wide">
                Est. 2026 • Where dead projects rest and the living get roasted
              </p>
            </div>
            </div>{/* /logo group */}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className={`md:hidden p-2 rounded-lg border ${skin.accentBorder} ${skin.accentColor} ${skin.glowClass}`}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { navTab(id as TabId); if (id === "dump") setSelectedDump(null); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono-tech text-xs whitespace-nowrap transition-all border ${skin.accentBorder} ${
                  activeTab === id
                    ? `bg-slate-900 ${skin.accentColor} ${skin.glowClass} animate-pulse`
                    : `text-gray-400 hover:text-gray-100 hover:bg-gray-900 ${skin.glowClass} opacity-90 hover:opacity-100`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            <a
              href="/incinerator"
              title="Incinerator (admin)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono-tech text-xs whitespace-nowrap transition-all border border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <Flame className="w-4 h-4" />
              Incinerator
            </a>
          </nav>

        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className={`absolute top-0 right-0 h-full w-72 max-w-[80%] bg-[#0b0f19] border-l ${skin.accentBorder} shadow-2xl p-5 flex flex-col gap-2 animate-fade-in`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-monument text-sm tracking-wider ${skin.accentColor}`}>MENU</span>
              <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { navTab(id as TabId); if (id === "dump") setSelectedDump(null); setMobileNavOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono-tech text-sm transition-all border ${skin.accentBorder} ${
                  activeTab === id
                    ? `bg-slate-900 ${skin.accentColor} ${skin.glowClass}`
                    : "text-gray-300 hover:text-gray-100 hover:bg-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
            <div className="my-2 border-t border-gray-800" />
            <a
              href="/incinerator"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono-tech text-sm text-red-400 border border-red-500/30 hover:bg-red-950/30 transition-all"
            >
              <Flame className="w-5 h-5" />
              Incinerator
            </a>
          </div>
        </div>
      )}

      {/* SUB-ACCENT BANNER */}
      <div className={`p-1 bg-gradient-to-r ${skin.bannerBg} border-b border-gray-800 text-center text-xs tracking-wider uppercase font-mono-tech ${skin.accentColor}`}>
        "ONE ENGINEER'S REJECTED SPAGHETTI IS ANOTHER SCRAP-COLLECTOR'S ENCRYPTED TREASURE" - THE LANDFILL MANIFESTO
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* NAVIGATION SYSTEM */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-950 border border-gray-800/80 p-2 rounded-xl">
          <div className="hidden">
            <button
              onClick={() => { navTab("dump"); setSelectedDump(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-tech text-sm transition-all ${
                activeTab === "dump"
                  ? "bg-slate-900 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-900"
              }`}
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              DUMP YOUR IDEAS
            </button>

            <button
              onClick={() => navTab("memorials")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-tech text-sm transition-all ${
                activeTab === "memorials"
                  ? "bg-slate-900 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-900"
              }`}
            >
              <Compass className="w-4 h-4 text-pink-400" />
              EXPLORE THE LANDFILL
            </button>

            <button
              onClick={() => navTab("oracle")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-tech text-sm transition-all ${
                activeTab === "oracle"
                  ? "bg-slate-900 border border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              AI TRASH ORACLE
            </button>

            <button
              onClick={() => navTab("disposal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-tech text-sm transition-all ${
                activeTab === "disposal"
                  ? "bg-slate-900 border border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-900"
              }`}
            >
              <Shield className="w-4 h-4 text-red-500" />
              TOXIC WASTE VENT (TEAMS)
            </button>

            <button
              onClick={() => navTab("contracts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-tech text-sm transition-all ${
                activeTab === "contracts"
                  ? "bg-slate-900 border border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-900"
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              SALVAGE CONTRACTS
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono-tech text-gray-500">PREVIEW SKIN:</span>
            <div className="flex gap-1.5 bg-black border border-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setCustomSkin("cyber-lime")}
                className={`w-4 h-4 rounded-full bg-cyan-400 border transition-transform ${customSkin === "cyber-lime" ? "scale-125 border-white" : "border-transparent opacity-60"}`}
                title="Cyber-Lime Glow"
              />
              <button
                onClick={() => setCustomSkin("radium")}
                className={`w-4 h-4 rounded-full bg-green-500 border transition-transform ${customSkin === "radium" ? "scale-125 border-white" : "border-transparent opacity-60"}`}
                title="Radium Spill"
              />
              <button
                onClick={() => setCustomSkin("vaporwave")}
                className={`w-4 h-4 rounded-full bg-fuchsia-500 border transition-transform ${customSkin === "vaporwave" ? "scale-125 border-white" : "border-transparent opacity-60"}`}
                title="Neon Vaporwave"
              />
              <button
                onClick={() => setCustomSkin("rust-belter")}
                className={`w-4 h-4 rounded-full bg-amber-500 border transition-transform ${customSkin === "rust-belter" ? "scale-125 border-white" : "border-transparent opacity-60"}`}
                title="Rust Belter Chrome"
              />
            </div>
          </div>
        </div>

        {/* HERO INTRO / VIRTUAL MEMORIAL GRAPHIC */}
        {activeTab === "dump" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            
            {/* LEFT HERO GRAPHIC INTRO */}
            <div className="lg:col-span-7 bg-[#0b0f19] border border-gray-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Virtual Glowing Wireframes background animation */}
              <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono-tech px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                    LANDFILL SECTOR 07
                  </span>
                  <span className="text-xs font-mono-tech text-gray-500">• Procedural Junk-scape</span>
                </div>

                <h1 className={`text-3xl md:text-5xl font-extrabold font-monument tracking-wide leading-tight mb-4 ${skin.accentColor}`}>
                  STORY OF ALL <span className="bg-gradient-to-r from-red-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">YOUR UNUSED CODE</span>
                </h1>

                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                  Did that SaaS idea wither in a folder? Did your smart contract freeze during seed rounds? Was your domain name <strong>trash-can.net</strong> meant for greatness, only to become a monument to rejection? Enter our digital, holographic landfill. Toss your dead dreams here so they can rot in beautiful, neon-lit perfection with 1,840 other gorgeous failures.
                </p>

                {/* Aesthetic interactive simulator panel */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                    <span className="text-xs font-mono-tech text-gray-400 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM DIAGNOSTICS
                    </span>
                    <span className="text-[10px] text-gray-500">SIMULATION: {simulationSpeed.toUpperCase()}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                      <p className="text-[10px] text-gray-500">Methane Vent</p>
                      <p className="text-xs font-mono-tech text-cyan-400 font-bold">12.4 Pa</p>
                    </div>
                    <div className="bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                      <p className="text-[10px] text-gray-500">Rust Oxidation</p>
                      <p className="text-xs font-mono-tech text-red-400 font-bold">84.2%</p>
                    </div>
                    <div className="bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                      <p className="text-[10px] text-gray-500">Domain Entropy</p>
                      <p className="text-xs font-mono-tech text-pink-400 font-bold">9.8 Hz</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span>EMBEDDED COBALT COMPRESSION</span>
                    <button 
                      onClick={() => {
                        setSimulationSpeed(prev => prev === "flow" ? "frenzy" : prev === "frenzy" ? "static" : "flow");
                      }} 
                      className="text-cyan-400 hover:underline font-mono-tech transition-colors"
                    >
                      [CYCLE FREQUENCY]
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Quote */}
              <div className="border-l-2 border-red-500/50 pl-4 py-1 relative z-10">
                <p className="text-xs text-gray-400 italic">
                  "The average developer owns 12 domains that will never launch and 5 repo drafts that give them severe imposter syndrome. We gave them a home."
                </p>
                <span className="text-[10px] text-gray-600 font-mono-tech block mt-1">— Roast Graveyard Conservator Code</span>
              </div>

            </div>

            {/* RIGHT FORM - DUMP YOUR TRASH */}
            <div className="lg:col-span-5 bg-gray-950 border border-gray-800 p-6 rounded-2xl relative">
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-mono-tech text-cyan-400">INPUT GATEWAY ACTIVE</span>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h2 className={`text-lg font-bold font-monument tracking-wider ${skin.accentColor}`}>TOSS SOMETHING INTO THE LANDFILL</h2>
              </div>

              <form onSubmit={handleDumpSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-mono-tech text-gray-400 mb-1">PROJECT NAME / DEAD IDEA *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. EtherGarden / BarkMatch / Uber for Raccoons"
                    className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200 transition-colors placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">CATEGORY</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as DeadProject["category"])}
                      className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200"
                    >
                      <option value="saas">SaaS (Software as a Struggle)</option>
                      <option value="web">Web / Abandoned Landing Page</option>
                      <option value="web3">Cloud Native / Overengineered Infra Dream</option>
                      <option value="mobile">Mobile / Swiper-Addicted App</option>
                      <option value="ai">AI / Infinite Token-Sponge Agent</option>
                      <option value="tech">Tech / Overengineered Gadget Dream</option>
                      <option value="hardware">Hardware / Expensive Desk Paperweight</option>
                      <option value="game">Game / Half-Finished Unity Lagfest</option>
                      <option value="dev_tool">Dev Tool / Dev-Ops Loop of Doom</option>
                      <option value="entertainment">Entertainment / Fyre-Festival-Grade Disaster</option>
                      <option value="other">Other Digital Rubble</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">ARTIFACT SHAPE</label>
                    <select
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200"
                    >
                      <option value="skull">💀 Crushed Mannequin / Skull</option>
                      <option value="fire">🔥 Glowing Trash Cannister</option>
                      <option value="heart-broken">💔 Fragmented Heart Disk</option>
                      <option value="monitor">🖥️ Flickering Retro CRT</option>
                      <option value="server">🖨️ Burnt Out Cloud Server</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech text-gray-400 mb-1">LOCATION (CITY, COUNTRY) — OPTIONAL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formPlace}
                      onChange={(e) => setFormPlace(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lookupDumpPlace(); } }}
                      placeholder="e.g. San Francisco, USA (drops your grave on the map)"
                      className="flex-1 bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-600"
                    />
                    <button type="button" onClick={lookupDumpPlace} className="text-xs font-mono-tech uppercase text-cyan-300 border border-cyan-500/40 px-3 rounded-lg hover:bg-cyan-950">Find</button>
                  </div>
                  {formGeoStatus && <p className="text-[11px] text-gray-400 mt-1 break-words">{formGeoStatus}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono-tech text-gray-400 mb-1">TRAGICAL POST-MORTEM (HOW DID IT DIE?) *</label>
                  <textarea
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe what happened: Was it legal trouble? Did the founders fight? Did you realize squeezable food packets don't need a Wi-Fi computer?"
                    className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200 transition-colors placeholder:text-gray-600 resize-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">CAUSE OF DEATH SUMMARY</label>
                    <input
                      type="text"
                      value={formCause}
                      onChange={(e) => setFormCause(e.target.value)}
                      placeholder="e.g. Recursive billing panic"
                      className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200 transition-colors placeholder:text-gray-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">TECH STACK USED</label>
                    <input
                      type="text"
                      value={formTech}
                      onChange={(e) => setFormTech(e.target.value)}
                      placeholder="e.g. C++, Solidity, Coffee"
                      className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200 transition-colors placeholder:text-gray-600 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1">CREATOR IDENTITY</label>
                    <input
                      type="text"
                      value={formCreator}
                      onChange={(e) => setFormCreator(e.target.value)}
                      placeholder="e.g. Wandering Dev"
                      className="w-full bg-[#05070e] border border-gray-800 focus:border-cyan-500/60 focus:outline-none rounded-lg px-3 py-2 text-gray-200 transition-colors placeholder:text-gray-600 text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-mono-tech text-gray-400">EMOTIONAL DAMAGE</label>
                      <span className="text-xs font-mono-tech text-red-400 font-bold">{formTragedy}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formTragedy}
                      onChange={(e) => setFormTragedy(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                {/* VISUAL IMAGE UPLOADER ZONE */}
                <div className="border-t border-gray-950 pt-3.5 space-y-2">
                  <label className="block text-xs font-mono-tech text-gray-400">
                    MEDIA CORES & PROJECT SCREENSHOT
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 flex flex-col items-center justify-center text-center ${
                      isDragging
                        ? "border-cyan-400 bg-cyan-950/20"
                        : formImageUrl
                        ? "border-emerald-500/50 bg-emerald-950/5"
                        : "border-gray-800 hover:border-gray-700 bg-black/40"
                    }`}
                  >
                    {formImageUrl ? (
                      <div className="w-full space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => setFormImageUrl("")}
                          className="absolute -top-1 -right-1 p-1 bg-red-900 hover:bg-red-700 text-white rounded-full z-10 transition-colors cursor-pointer"
                          title="Purge Image Core"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-800 bg-[#05070e]">
                          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
                          <img
                            src={formImageUrl}
                            alt="Uploaded snapshot"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-[#020306]/85 px-1.5 py-0.5 border border-gray-800 rounded font-mono-tech text-[8px] text-emerald-400 animate-pulse uppercase">
                            ● ATTACHED_SNAPSHOT
                          </div>
                        </div>
                        
                        <p className="text-[10px] font-mono-tech text-gray-500">
                          Custom media registered. Loaded as data URL payload.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <div className="flex justify-center">
                          <div className="p-2 bg-gray-900/60 rounded-lg text-gray-400 border border-gray-850">
                            <Camera className="w-5 h-5 text-cyan-400 animate-pulse" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-300">
                            PROMPT_IMG_INJECT
                          </p>
                          <p className="text-[10px] text-gray-500 max-w-[280px] mt-0.5">
                            Drag & Drop project mockup, or <span className="text-cyan-400 underline cursor-pointer hover:text-cyan-300 relative inline">
                              browse files
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </span> (JPG, PNG, GIF, <span className="text-gray-400 font-bold">10MB MAX</span>)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preset sci-fi schematics gallery */}
                  {!formImageUrl && (
                    <div className="space-y-1.5 pt-0.5">
                      <span className="text-[9px] font-mono-tech text-cyan-500 uppercase tracking-widest block font-bold">
                        ⚡ AUTOMATED MOCKUP BLUEPRINT PICKER
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          {
                            name: "CYAN CAD CORE",
                            color: "hover:border-cyan-400/80 bg-cyan-950/10 border-cyan-900/40 text-cyan-400",
                            svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%2305070e"/><g stroke="%2322d3ee" stroke-dasharray="3,3" stroke-opacity="0.3"><line x1="0" y1="50" x2="300" y2="50"/><line x1="0" y1="100" x2="300" y2="100"/><line x1="0" y1="150" x2="300" y2="150"/></g><circle cx="150" cy="100" r="45" fill="none" stroke="%2322d3ee" stroke-width="1.5"/><line x1="90" y1="100" x2="210" y2="100" stroke="%2322d3ee" stroke-width="1"/><line x1="150" y1="40" x2="150" y2="160" stroke="%2322d3ee" stroke-width="1"/><text x="15" y="25" fill="%2322d3ee" font-family="monospace" font-size="10">SYS_ID: OP_V_09</text></svg>'
                          },
                          {
                            name: "MELTDOWN RED",
                            color: "hover:border-red-500/80 bg-red-950/10 border-red-900/40 text-red-400",
                            svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23110505"/><path d="M40,140 L90,60 L140,120 L190,40 L240,160" fill="none" stroke="%23f43f5e" stroke-width="2"/><text x="150" y="105" fill="%23ef4444" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">CONTAINMENT CRITICAL</text></svg>'
                          },
                          {
                            name: "AI SYNAPSE",
                            color: "hover:border-fuchsia-500/80 bg-fuchsia-950/10 border-fuchsia-900/40 text-fuchsia-400",
                            svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%230c0512"/><circle cx="150" cy="100" r="35" fill="none" stroke="%23a855f7" stroke-width="1"/><polygon points="150,30 155,60 180,65 155,70 150,100" fill="%23c084fc"/><text x="150" y="160" fill="%23c084fc" font-family="monospace" font-size="10" text-anchor="middle">SYN_CORE_BURN</text></svg>'
                          }
                        ].map((scheme, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFormImageUrl(scheme.svg)}
                            className={`py-1.5 px-1 bg-[#090e1a] hover:bg-[#111a33] border rounded text-[9px] font-mono-tech font-bold uppercase transition-all tracking-wider text-center cursor-pointer ${scheme.color}`}
                          >
                            🎨 {scheme.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Private venting controls */}
                <div className="border-t border-gray-900 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPrivate}
                      onChange={(e) => setFormIsPrivate(e.target.checked)}
                      className="w-4 h-4 rounded bg-gray-900 border-gray-800 accent-red-500 focus:ring-0"
                    />
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-mono-tech text-gray-300">ACTIVATE SECURITY WALL (PRIVATE TEAM VENT)</span>
                    </div>
                  </label>

                  {formIsPrivate && (
                    <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-red-950/20 border border-red-950 rounded-lg">
                      <div>
                        <input
                          type="text"
                          required={formIsPrivate}
                          placeholder="Room ID Name"
                          value={formRoomName}
                          onChange={(e) => setFormRoomName(e.target.value)}
                          className="w-full bg-black border border-gray-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          required={formIsPrivate}
                          placeholder="Access Token"
                          value={formRoomPassword}
                          onChange={(e) => setFormRoomPassword(e.target.value)}
                          className="w-full bg-black border border-gray-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 ${skin.buttonColor} font-mono-tech font-bold tracking-wider rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      INSPECTING & DUMPING...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 relative group-hover:rotate-12 transition-transform" />
                      DUMP TRASH TO WEB-SERVER
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        )}

        {/* FRESHLY DUMPED STRIP — quick glance at the newest entries */}
        {activeTab === "dump" && dumps.filter((d) => !d.isPrivate).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-mono-tech uppercase tracking-widest text-gray-400 flex items-center gap-2 min-w-0">
                <Trash2 className={`w-4 h-4 ${skin.accentColor}`} /> Freshly Dumped
              </h3>
              <button
                onClick={() => navTab("log")}
                className={`text-[10px] font-mono-tech uppercase tracking-wider whitespace-nowrap shrink-0 ${skin.accentColor} hover:underline`}
              >
                Yard notes &rarr;
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
              {[...dumps]
                .filter((d) => !d.isPrivate)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 8)
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDump(d); navTab("memorials"); }}
                    className={`flex-shrink-0 w-52 text-left bg-[#0b0f19] border ${skin.accentBorder} rounded-xl p-3 hover:bg-gray-900/60 transition-all group`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-mono-tech text-gray-500 uppercase truncate">{catLabel(d.category)}</span>
                      <span className={`text-[9px] font-mono-tech whitespace-nowrap ${skin.accentColor}`}>{timeAgo(d.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-100 truncate group-hover:underline">{d.name}</p>
                    <p className="text-[10px] font-mono-tech text-gray-500 truncate">by {d.creator || "Anonymous"}</p>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* HEATMAP OF HEARTBREAK — GLOBAL LANDFILL GEOGRAPHY */}
        {(activeTab === "dump" || activeTab === "memorials") && (
          <div className="mb-8">
            <HeartbreakMap 
              projects={dumps} 
              onSelectProject={(p) => { 
                setSelectedDump(p); 
                navTab("memorials"); 
              }} 
            />
          </div>
        )}

        {/* NEON HALL OF FAME / CAROUSEL ZONE */}
        {activeTab === "memorials" && !selectedDump && (
          <div className="mb-8 p-6 bg-gradient-to-r from-[#0d091a] via-[#05070f] to-[#04091a] border border-gray-800 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-fuchsia-500/5 blur-[120px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-fuchsia-400 font-mono-tech">Hall of Legendary Failures</span>
                <h3 className="text-2xl font-bold font-monument tracking-wider text-pink-400">
                  NEON-LIT MUSEUM ZONE
                </h3>
              </div>
              <span className="text-[11px] text-gray-400 font-mono-tech max-w-xs text-right hidden sm:block">
                The most spectacular, high-budget, beautifully catastrophic dreams are enshrined here for eternity.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {museumHighRated.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedDump(item)}
                  className="p-5 bg-black/60 hover:bg-black border border-purple-500/30 hover:border-purple-400 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(240,46,170,0.05)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono-tech text-fuchsia-300 bg-fuchsia-950/40 px-2 py-0.5 rounded border border-fuchsia-900">
                        {catLabel(item.category).toUpperCase()}
                      </span>
                      <GhostRating score={item.diagnosticScore || 90} size={16} />
                    </div>

                    {/* Interactive Showcase holographic blueprint */}
                    <div className="mb-4">
                      <ArtifactVisualizer
                        category={item.category}
                        name={item.name}
                        emotionalTragedy={item.emotionalTragedy}
                        techStack={item.techStack}
                        causeOfDeath={item.causeOfDeath}
                        id={item.id}
                        variant="thumbnail"
                        imageUrl={item.imageUrl}
                      />
                    </div>

                    <h4 className="text-lg font-bold font-monument tracking-wide mb-2 text-white">
                      {item.name}
                    </h4>
                    
                    <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-900 pt-3 text-[11px] font-mono-tech text-gray-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      {item.likes} MOURNERS
                    </span>
                    <span className="flex items-center gap-1 text-purple-400 hover:underline">
                      EXAMINE REMAINS →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRIMARY EXPLORATION & FILTERING GRID */}
        {activeTab === "memorials" && (
          <div className="space-y-6">
            
            {/* SEARCH + CAROUSEL (full width) */}
            <div className="space-y-6">
              
              {/* FILTERS TOOLBAR */}
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative w-full md:w-3/5">
                    <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Sift through virtual garbage pile (name, stack, creator, tragedy)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#05070e] border border-gray-900 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 text-gray-200"
                    />
                  </div>

                  <div className="w-full md:w-2/5 flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#05070e] border border-gray-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">📁 All Categories</option>
                      <option value="saas">SaaS</option>
                      <option value="web">Web</option>
                      <option value="web3">Cloud Native</option>
                      <option value="mobile">Mobile</option>
                      <option value="ai">AI / Prompts</option>
                      <option value="tech">Tech</option>
                      <option value="hardware">Hardware</option>
                      <option value="game">Gaming</option>
                      <option value="dev_tool">Dev Tools</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-[#05070e] border border-gray-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="newest">⏰ Date Dumped</option>
                      <option value="likes">🔥 Upvotes / Mourners</option>
                      <option value="flowers">🌸 Flowers Placed</option>
                      <option value="tragedy">💔 Emotional Damage</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 border-t border-gray-900 pt-2">
                  <span>FOUND: <strong>{filteredDumps.length}</strong> ENTOMBMENTS</span>
                  <span>CLICK TARGETS TO ACTIVATE MEMORIAL CORES</span>
                </div>
              </div>

              {/* THE JUNKYARD GRID LANDSCAPE */}
              {filteredDumps.length === 0 ? (
                <div className="bg-gray-950/60 border border-gray-800 p-12 text-center rounded-2xl flex flex-col items-center justify-center">
                  <Skull className="w-12 h-12 text-gray-600 mb-3 animate-pulse" />
                  <p className="text-gray-400 font-bold font-mono-tech tracking-wide mb-1">
                    LANDFILL SECTOR VACANT
                  </p>
                  <p className="text-gray-600 text-xs max-w-sm">
                    No registered artifacts match your search parameters. Consider dumping a tragedy of your own using the dump tool!
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDumps.slice(0, visibleCount).map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedDump(d);
                        if (!d.aiAppraisal && !appraiseResult) {
                          handleAppraise(d);
                        }
                      }}
                      className="group p-5 bg-gray-950 border border-gray-800 hover:border-cyan-500/60 hover:bg-gray-900/60 transition-all duration-300 rounded-xl cursor-pointer relative overflow-hidden flex flex-col justify-between w-full [content-visibility:auto] [contain-intrinsic-size:auto_360px]"
                    >
                      {/* Subtly animated decorative corner badges */}
                      <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-8 h-8 rounded-full bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors" />
                      
                      <div>
                        {/* Interactive Visual Blueprint cover of the failure */}
                        <div className="mb-3.5">
                          <ArtifactVisualizer
                            category={d.category}
                            name={d.name}
                            emotionalTragedy={d.emotionalTragedy}
                            techStack={d.techStack}
                            causeOfDeath={d.causeOfDeath}
                            id={d.id}
                            variant="thumbnail"
                            imageUrl={d.imageUrl}
                          />
                        </div>

                        {/* Meta Category Section */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[9px] font-mono-tech px-2 py-0.5 bg-gray-900 text-gray-400 border border-gray-800 rounded">
                            {catLabel(d.category).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono-tech text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/30">
                            TRAGEDY: {d.emotionalTragedy}/10
                          </span>
                        </div>

                        {/* Title header */}
                        <div className="flex items-start gap-2.5 mb-2">
                          <span className="p-1.5 bg-gray-900 border border-gray-800 rounded text-cyan-400 group-hover:animate-flicker">
                            {renderArtifactIcon(d.artifactIcon, "w-4 h-4")}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                              {d.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-mono-tech">
                              By {d.creator}
                            </p>
                          </div>
                        </div>

                        {/* Description excerpt */}
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">
                          {d.description}
                        </p>
                      </div>

                      {/* Footer actions counters */}
                      <div className="border-t border-gray-900 pt-3 flex items-center justify-between text-[11px] font-mono-tech text-gray-500">
                        <span className="flex items-center gap-2">
                          <span className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                            <Flame className="w-3.5 h-3.5" /> {d.likes} Mourners
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 group-hover:text-pink-400 transition-colors">
                            <Flower2 className="w-3.5 h-3.5" /> {d.flowers} Flowers
                          </span>
                        </span>
                        
                        <span className="text-cyan-400 text-[10px] group-hover:translate-x-1 transition-transform">
                          INSPECT →
                        </span>
                      </div>
                    </div>
                  ))}
                  </div>
                  {visibleCount < filteredDumps.length && (
                    <div ref={loadMoreRef} className="flex justify-center pt-8">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + 12)}
                        className={`px-6 py-2.5 rounded-lg font-mono-tech text-xs uppercase tracking-wider border ${skin.accentBorder} ${skin.accentColor} ${skin.glowClass} hover:bg-gray-900/60 transition-all`}
                      >
                        Dig deeper ({filteredDumps.length - visibleCount} more in the pile)
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* DETAIL MODAL */}
            {selectedDump && (
              <div
                className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-4 sm:p-8"
                onClick={() => setSelectedDump(null)}
              >
                <div ref={detailRef} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl my-4 bg-gray-950/95 border border-cyan-400/50 rounded-2xl p-6 shadow-[0_0_45px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/40">
                  
                  {/* Close Details panel */}
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                    <span className="text-xs font-mono-tech text-cyan-400 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" /> RETRIEVED ANOMALY MODULE
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDump(null);
                        setAppraiseResult(null);
                      }}
                      className="p-1 hover:bg-gray-900 rounded text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Card Body info */}
                  <div className="space-y-4">
                    {/* Live CRT Containment CCTV Video Feed */}
                    <div className="mb-3.5">
                      <ArtifactVisualizer
                        category={selectedDump.category}
                        name={selectedDump.name}
                        emotionalTragedy={selectedDump.emotionalTragedy}
                        techStack={selectedDump.techStack}
                        causeOfDeath={selectedDump.causeOfDeath}
                        id={selectedDump.id}
                        variant="crt"
                        imageUrl={selectedDump.imageUrl}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-900 border border-gray-800 rounded-lg text-red-400 text-xl">
                        {renderArtifactIcon(selectedDump.artifactIcon, "w-8 h-8")}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white font-monument">
                          {selectedDump.name}
                        </h3>
                        <p className="text-xs font-mono-tech text-gray-500">
                          COORDINATES: {selectedDump.latitude.toFixed(4)}N, {selectedDump.longitude.toFixed(4)}W
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#070b14] border border-gray-900 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-mono-tech text-cyan-400 uppercase">{catLabel(selectedDump.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cause of Death:</span>
                        <span className="font-mono-tech text-red-400 font-bold">{selectedDump.causeOfDeath}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Technology stack:</span>
                        <span className="font-mono-tech text-gray-300">{selectedDump.techStack}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date Logged:</span>
                        <span className="font-mono-tech text-gray-500">{new Date(selectedDump.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-mono-tech text-gray-400 mb-1 uppercase">Post-Mortem Tragedy Logs</h5>
                      <div className="bg-[#0c0d12] border border-gray-900 p-3 rounded-lg text-xs leading-relaxed text-gray-300 max-h-[140px] overflow-y-auto">
                        "{selectedDump.description}"
                      </div>
                    </div>

                    {/* SHARE */}
                    <button
                      onClick={() => shareGrave(selectedDump.id)}
                      className="w-full mb-2 py-2.5 bg-gray-900 hover:bg-gray-800 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-xs font-mono-tech font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {copiedShare ? "LINK COPIED \u2713" : "SHARE THIS GRAVE"}
                    </button>

                    {/* VOTE & MOURN ACTIONS */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleAction(selectedDump.id, "like")}
                        disabled={!!voted[selectedDump.id]?.like}
                        className={`py-2.5 border rounded-lg text-xs font-mono-tech font-bold flex items-center justify-center gap-1.5 transition-colors ${voted[selectedDump.id]?.like ? "bg-gray-900/40 border-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-300 hover:text-white cursor-pointer"}`}
                      >
                        <Flame className={`w-4 h-4 ${voted[selectedDump.id]?.like ? "text-gray-600" : "text-red-400"}`} />
                        {voted[selectedDump.id]?.like ? "MOURNED \u2713" : "MOURN (+1 VOTE)"}
                      </button>

                      <button
                        onClick={() => handleAction(selectedDump.id, "flower")}
                        disabled={!!voted[selectedDump.id]?.flower}
                        className={`py-2.5 border rounded-lg text-xs font-mono-tech font-bold flex items-center justify-center gap-1.5 transition-colors ${voted[selectedDump.id]?.flower ? "bg-gray-900/40 border-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 border-gray-800 text-pink-400 hover:text-pink-300 cursor-pointer"}`}
                      >
                        <Flower2 className={`w-4 h-4 ${voted[selectedDump.id]?.flower ? "text-gray-600" : ""}`} />
                        {voted[selectedDump.id]?.flower ? `FLOWER LAID (${selectedDump.flowers})` : `LAY FLOWER (${selectedDump.flowers})`}
                      </button>
                    </div>

                    {/* AI LANDFILL APPRAISAL COMPONENT */}
                    <div className="border-t border-gray-900 pt-4 space-y-3">
                      <div className="space-y-2">
                        <span className="text-xs font-mono-tech text-purple-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI CHEF APPRAISAL
                        </span>
                        <button
                          onClick={() => handleAppraise(selectedDump)}
                          disabled={appraiseLoading}
                          className={`w-full text-sm bg-purple-600/25 hover:bg-purple-600/45 border border-purple-400/70 text-purple-100 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-mono-tech font-bold uppercase transition-all cursor-pointer shadow-[0_0_18px_rgba(168,85,247,0.45)] disabled:opacity-60 ${appraiseResult || appraiseLoading ? "" : "animate-pulse"}`}
                        >
                          {appraiseLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              SERVING UP THE ROAST...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              RUN CRITIQUE
                            </>
                          )}
                        </button>
                      </div>

                      {/* Displaying static preloaded appraise, or dynamified result */}
                      {appraiseLoading ? (
                        <div className="bg-purple-950/10 border border-purple-950/40 p-4 rounded-lg text-center">
                          <div className="animate-spin inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mb-2" />
                          <p className="text-[11px] font-mono-tech text-purple-400 animate-pulse">
                            Consultant analyzing trace elements of {selectedDump.name}...
                          </p>
                        </div>
                      ) : appraiseResult ? (
                        <div className="bg-purple-950/15 border border-purple-900/40 p-4 rounded-xl space-y-3">
                          {appraiseResult.error ? (
                            <p className="text-xs font-mono-tech text-red-400 text-center">{appraiseResult.error}</p>
                          ) : (
                            <>
                              <div className="flex justify-between items-center border-b border-purple-950/60 pb-2">
                                <span className="text-[10px] font-mono-tech text-purple-400">TRAGIC GLITCH RATING:</span>
                                <span className="text-xs font-mono-tech text-red-400 font-extrabold bg-red-450/20 px-2 py-0.5 rounded">
                                  {appraiseResult.score}/100
                                </span>
                              </div>
                              <p className="text-xs italic text-gray-300 font-medium">
                                "{appraiseResult.appraisal}"
                              </p>
                              <div className="text-[11px] text-gray-400 border-l border-purple-500/30 pl-2 leading-relaxed">
                                <strong className="text-purple-300">Cause Analysis:</strong> {appraiseResult.postMortem}
                              </div>
                              {appraiseResult.recyclingPlan && (
                                <div className="text-[11px] bg-cyan-950/20 text-cyan-300 p-2 rounded-lg border border-cyan-900/30">
                                  💡 <strong className="text-cyan-200">Suggested Code Pivot:</strong> {appraiseResult.recyclingPlan}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ) : selectedDump.aiAppraisal ? (
                        /* Prepopulated diagnostic */
                        <div className="bg-purple-950/15 border border-purple-900/40 p-4 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 border-b border-purple-950/60 pb-1.5">
                            <span className="text-[10px] font-mono-tech text-purple-400">TRAGIC GLITCH RATING:</span>
                            <GhostRating score={selectedDump.diagnosticScore || 85} size={18} />
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed italic">
                            "{selectedDump.aiAppraisal}"
                          </p>
                          <p className="text-[10px] text-purple-400 font-mono-tech">
                            * Prepopulated historic critique.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-900 border border-gray-850 p-4 rounded-xl text-center text-xs text-gray-500">
                          Click <strong>RUN CRITIQUE</strong> above to command the Gemini Waste Chef to analyze this idea.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI WASTE CONSULTING ORACLE PORTAL */}
        {activeTab === "oracle" && (
          <div className="mb-8">
            <OracleAppraiser onAddProjectDirectly={(added) => {
              setDumps(prev => [...prev, added]);
            }} />
          </div>
        )}

        {/* TOXIC WASTE VENT (LOCK PROTECTED TEAMS SYSTEM) */}
        {activeTab === "disposal" && (
          <div className="mb-8">
            <TeamVenting onAddProjectDirectly={(added) => {
              if (!added.isPrivate) setDumps(prev => [...prev, added]);
            }} />
          </div>
        )}

        {/* WORKPLACE CONSULTING CONTRACTS MARKETPLACE */}
        {activeTab === "contracts" && (
          <div className="space-y-8 animate-fade-in">
            {/* Rescue & Remix Segment */}
            <RescueRemix projects={dumps} />

            {/* Custom Subscription Tiers & Artifact Customizer */}
            <TiersUpgrades />

            {/* Intro layout */}
            <div className="bg-[#0b101c] border border-amber-900/40 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono-tech tracking-widest text-amber-500 uppercase">Interactive Developer Guild Residuals</span>
                <h3 className="text-2xl font-bold font-monument tracking-wider text-amber-500">
                  🏗️ WASTE MANAGEMENT CONSULTANT MARKETPLACE
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                  "One developer's abandoned git repo is another builder's gold-mine." Have a half-baked repo you will never launch but owns neat algorithms or nice layout blueprints? Or need an experienced "Trash Sweeper" to fix your project? Explore or list custom salvage contracts below.
                </p>
              </div>

              <div className="font-mono-tech text-xs bg-gray-950 border border-gray-800 p-4 rounded-xl text-amber-400 text-center min-w-[180px]">
                <p className="text-[9px] text-gray-500">ESTIMATED TRASH CAP</p>
                <strong className="text-base text-gray-200">12,420 USD</strong>
                <p className="text-[8px] text-gray-600 mt-1">AVERAGE CONTRACT FEE</p>
              </div>
            </div>

            {/* List of Simulated / Seeded Salvage Contracts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="p-5 bg-gray-950/80 border border-gray-800 hover:border-amber-500/50 rounded-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono-tech">
                    <span className="bg-amber-950/40 text-amber-500 border border-amber-900/40 px-2.5 py-0.5 rounded">SALVAGING EXPERT</span>
                    <strong className="text-white">💰 $250</strong>
                  </div>

                  <h4 className="text-base font-bold text-gray-200 mb-1">
                    "React Native Spaghetti Untangler"
                  </h4>
                  <p className="text-xs text-gray-500 font-mono-tech mb-3">By @SpaghettiSlayer</p>
                  
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    "I will take your abandoned React Native repo with 44 warning errors in console, clean up your state mutations, refactor Redux into clean Context, and make it compile without emulator crash."
                  </p>
                </div>

                <div className="border-t border-gray-900 pt-3 flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-gray-500">Delivery: 4 days</span>
                  <button 
                    onClick={() => alert("SpaghettiSlayer notified! Secure trash container initialized via mail link.")}
                    className="text-amber-500 hover:underline cursor-pointer"
                  >
                    ACCEPTS DRAFT →
                  </button>
                </div>
              </div>

              <div className="p-5 bg-gray-950/80 border border-gray-800 hover:border-amber-500/50 rounded-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono-tech">
                    <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-900/40 px-2.5 py-0.5 rounded">DOMAIN OFFER</span>
                    <strong className="text-emerald-400">🔥 1 Cup of Coffee</strong>
                  </div>

                  <h4 className="text-base font-bold text-gray-200 mb-1">
                    "Unused Crypto Domain Exchange"
                  </h4>
                  <p className="text-xs text-gray-500 font-mono-tech mb-3">By @DecentralizedDave</p>
                  
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    "I purchased 'ethereumgardeners.io' in mid-2022 and have spent $40 renewing it every year out of guilt. Willing to exchange domain ownership for a $10 Starbucks giftcard or a funny meme repository in Go."
                  </p>
                </div>

                <div className="border-t border-gray-900 pt-3 flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-gray-500">Expires: 12 hours</span>
                  <button 
                    onClick={() => alert("Dave notified! Cryptocactus soil is ready for shipment.")}
                    className="text-amber-500 hover:underline cursor-pointer"
                  >
                    ACCEPTS DRAFT →
                  </button>
                </div>
              </div>

              <div className="p-5 bg-gray-950/80 border border-gray-800 hover:border-amber-500/50 rounded-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono-tech">
                    <span className="bg-purple-950/40 text-purple-400 border border-purple-950/40 px-2.5 py-0.5 rounded">ASSET RECYCLING</span>
                    <strong className="text-white">💰 $60</strong>
                  </div>

                  <h4 className="text-base font-bold text-gray-200 mb-1">
                    "Procedural SVG Asset Rescue"
                  </h4>
                  <p className="text-xs text-gray-500 font-mono-tech mb-3">By @VaporwaveGamer</p>
                  
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    "I build high-fidelity vectors, CRT mockup screens, and vaporwave color maps. If you have an ugly landing page dashboard you gave up on, I will turn it into a gorgeous SVG illustration or NFT trading card mockup!"
                  </p>
                </div>

                <div className="border-t border-gray-900 pt-3 flex items-center justify-between text-xs font-mono-tech">
                  <span className="text-gray-500">Delivery: 2 days</span>
                  <button 
                    onClick={() => alert("VaporwaveGamer notified! Graphic scrap files requested.")}
                    className="text-amber-500 hover:underline cursor-pointer"
                  >
                    ACCEPTS DRAFT →
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* GRAVEKEEPER'S CRYPT LOG: patch notes + freshly buried feed */}
        {activeTab === "log" && (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <span className={`text-[10px] font-mono-tech tracking-widest uppercase ${skin.accentColor}`}>Notes from the yardman</span>
              <h2 className={`text-2xl md:text-3xl font-bold font-monument tracking-wider mt-1 ${skin.accentColor}`}>
                YARDMAN'S NOTES
              </h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                What we've hauled in lately, and what got tossed this week. The pile never stops growing, and neither does the changelog.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* PATCH NOTES */}
              <div className="lg:col-span-3 space-y-4">
                <h3 className="text-xs font-mono-tech uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <ScrollText className={`w-4 h-4 ${skin.accentColor}`} /> Yard Notes
                </h3>
                {CRYPT_LOG.map((e, i) => (
                  <div key={i} className={`relative bg-[#0b0f19] border ${skin.accentBorder} rounded-xl p-5 pl-6`}>
                    <span className={`absolute left-0 top-5 bottom-5 w-1 rounded-full bg-current ${skin.accentColor} opacity-70`} />
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className={`text-[10px] font-mono-tech px-2 py-0.5 rounded border ${skin.accentBorder} ${skin.accentColor} uppercase tracking-wider`}>{e.tag}</span>
                      <span className="text-[10px] font-mono-tech text-gray-600">{new Date(e.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-100 mb-1">{e.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{e.body}</p>
                  </div>
                ))}
              </div>

              {/* FRESHLY BURIED FEED */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-mono-tech uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Trash2 className={`w-4 h-4 ${skin.accentColor}`} /> Freshly Dumped
                </h3>
                <div className={`bg-[#0b0f19] border ${skin.accentBorder} rounded-xl divide-y divide-gray-900`}>
                  {[...dumps]
                    .filter((d) => !d.isPrivate)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 8)
                    .map((d) => (
                      <button
                        key={d.id}
                        onClick={() => { navTab("memorials"); setSelectedDump(d); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-900/60 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-gray-100 truncate group-hover:underline">{d.name}</p>
                          <p className="text-[10px] font-mono-tech text-gray-500 truncate">
                            {catLabel(d.category)} • by {d.creator || "Anonymous"}
                          </p>
                        </div>
                        <span className={`text-[10px] font-mono-tech whitespace-nowrap ${skin.accentColor}`}>{timeAgo(d.createdAt)}</span>
                      </button>
                    ))}
                  {dumps.filter((d) => !d.isPrivate).length === 0 && (
                    <p className="px-4 py-6 text-center text-xs text-gray-600 font-mono-tech">The yard's empty. Be the first to dump something.</p>
                  )}
                </div>
                <button
                  onClick={() => { navTab("dump"); setSelectedDump(null); }}
                  className={`w-full text-xs font-mono-tech py-2.5 rounded-lg border ${skin.accentBorder} ${skin.accentColor} ${skin.glowClass} hover:bg-gray-900/60 transition-all uppercase tracking-wider`}
                >
                  + Dump something new
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER SYSTEM */}
      <footer className="border-t border-gray-900 bg-[#02050c] px-4 py-8 mt-12 text-center text-xs text-gray-500 space-y-3 font-mono-tech">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="tracking-wide">
            © 2026 Roast Graveyard™ Central Administration. Built on top of the world's finest garbage. <span className="text-gray-600">v{APP_VERSION}</span>
          </p>
          <div className="flex gap-4">
            <a href="#" onClick={(e) => { e.preventDefault(); alert("RULE 1: there are no rules. RULE 2: you just wasted a click on Rule 1."); }} className="hover:text-cyan-400 transition-colors uppercase cursor-pointer">Security Containment rules</a>
            <span>•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Shields: 100% effective \u2014 nobody, not even us, is reading this page."); }} className="hover:text-pink-400 transition-colors uppercase cursor-pointer">Privacy Shields</a>
            <span>•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("You leased a domain at 3am, built nothing, and are now reading the lease terms. Seek sunlight."); }} className="hover:text-amber-500 transition-colors uppercase cursor-pointer">Domain Lease terms</a>
            <span>•</span>
            <a href="https://ephix.net" target="_blank" rel="noopener noreferrer" title="Ephix Pulse — live top-100 TV & movie trending" className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase">Built by Ephix Pulse</a>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 uppercase">
          "Everything in this system is dedicated to developers who bought domains while drinking coffee at 3:00 AM and never built on them."
        </p>
      </footer>

    </div>
  );
}
