import React, { useState, useEffect, useRef } from "react";
import { Move, HeartOff, Flame, AlertOctagon, Terminal, Globe, Trophy } from "lucide-react";
import { DeadProject } from "../types";

interface HeartbreakMapProps {
  projects: DeadProject[];
  onSelectProject: (project: DeadProject) => void;
}

export default function HeartbreakMap({ projects, onSelectProject }: HeartbreakMapProps) {
  const [hoveredProject, setHoveredProject] = useState<DeadProject | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map");
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setMapLoading(false);
      })
      .catch((err) => {
        console.error("Error loading world outline:", err);
        setMapLoading(false);
      });
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const handleTilt = (e: React.MouseEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg)`;
  };
  const resetTilt = () => {
    if (stageRef.current) stageRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  // Translate lat/lng to container percentages for simple responsive SVG plotting
  // Simple cylindrical projection approximation matching Equirectangular format
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) };
  };

  // Convert GeoJSON geometry to responsive SVG path data
  const getSvgPath = (geometry: any) => {
    if (!geometry) return "";
    const { type, coordinates } = geometry;

    const projectPoint = (lng: number, lat: number) => {
      const x = ((lng + 180) / 360) * 100;
      const y = ((90 - lat) / 180) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    if (type === "Polygon") {
      return coordinates
        .map((ring: any[]) => {
          return (
            "M" +
            ring
              .map((pt) => projectPoint(pt[0], pt[1]))
              .join(" L") +
            "Z"
          );
        })
        .join(" ");
    } else if (type === "MultiPolygon") {
      return coordinates
        .map((polygon: any[][]) => {
          return polygon
            .map((ring: any[]) => {
              return (
                "M" +
                ring
                  .map((pt) => projectPoint(pt[0], pt[1]))
                  .join(" L") +
                "Z"
              );
            })
            .join(" ");
        })
        .join(" ");
    }
    return "";
  };

  return (
    <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl overflow-hidden p-6 relative neon-glow-cyan depth-top">
      {/* Decorative top header */}
      <div className="flex justify-between items-center mb-4 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
          <h3 className="font-mono-tech text-md tracking-wider text-cyan-400 uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            HEATMAP OF HEARTBREAK — Global Rejection Telemetry
          </h3>
        </div>
        <div className="text-xs font-mono-tech text-red-400/80 bg-red-950/40 px-2 py-0.5 border border-red-500/20 rounded">
          STATUS: SEVERE OVERFLOW
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* The Map visual stage (CSS-perspective tilt on mouse move) */}
        <div
          className="lg:col-span-3"
          style={{ perspective: "1000px" }}
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
        >
          <div
            ref={stageRef}
            className="relative bg-[#060913] border border-cyan-500/10 rounded-lg h-[230px] sm:h-[430px] overflow-hidden p-2 transition-transform duration-200 ease-out will-change-transform"
          >
          {/* Cyber grid lines */}
          <div className="absolute inset-0 scanlines opacity-40 pointer-events-none"></div>
          <div className="absolute inset-0 bg-grid-cyan opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          ></div>

          {/* SVG World Map Vector Outline Layer */}
          {geoData && (
            <svg 
              viewBox="0 0 100 100" 
              className="absolute inset-0 w-full h-full select-none pointer-events-none z-0"
              preserveAspectRatio="none"
            >
              <g className="pointer-events-auto">
                {geoData.features.map((feature: any, idx: number) => {
                  const countryName = feature.properties?.name || `Country-${idx}`;
                  const isHovered = hoveredCountry === countryName;
                  return (
                    <path
                      key={countryName + "-" + idx}
                      d={getSvgPath(feature.geometry)}
                      fill={isHovered ? "rgba(34, 211, 238, 0.12)" : "rgba(34, 211, 238, 0.035)"}
                      stroke={isHovered ? "rgba(34, 211, 238, 0.45)" : "rgba(34, 211, 238, 0.12)"}
                      strokeWidth={isHovered ? "0.3" : "0.15"}
                      className="transition-all duration-200 cursor-cell"
                      onMouseEnter={() => setHoveredCountry(countryName)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    >
                      <title>{countryName}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Simple Vectorized Continents Silhouette as beautiful clean background text */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-cyan-500/5 select-none font-monument text-3xl font-bold tracking-widest text-center uppercase p-8 leading-none z-0">
            JUNKYARD EARTH <br />
            <span className="text-sm font-mono-tech mt-2 tracking-normal text-cyan-400/4 opacity-30">EST. 1970 — REJECTED ORBITS DETECTED</span>
          </div>

          {/* Sizable items mapped */}
          <div className="absolute inset-0 z-10">
            {projects.map((project) => {
              const { x, y } = getCoordinates(project.latitude, project.longitude);
              const isTragic = project.emotionalTragedy >= 8;
              
              return (
                <div
                  key={project.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                >
                  {/* Glowing core */}
                  <button
                    onClick={() => onSelectProject(project)}
                    onMouseEnter={() => setHoveredProject(project)}
                    onMouseLeave={() => setHoveredProject(null)}
                    aria-label={`Project: ${project.name}`}
                    className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isTragic ? 'bg-red-500 hover:scale-150 shadow-lg shadow-red-500/50' : 'bg-cyan-400 hover:scale-150 shadow-lg shadow-cyan-400/50'
                    }`}
                  >
                    {isTragic ? (
                      <Flame className="w-2.5 h-2.5 text-white animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                    )}

                    {/* Ring animation */}
                    <span className={`absolute -inset-2 rounded-full animate-ping opacity-25 ${
                      isTragic ? 'bg-red-500' : 'bg-cyan-400'
                    }`}></span>
                  </button>

                  {/* Desktop Tiny tooltip */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#090d16] border border-cyan-500/40 text-xs px-2.5 py-1.5 rounded-md hidden group-hover:block whitespace-nowrap z-50 shadow-xl pointer-events-none">
                    <div className="font-bold text-cyan-200">{project.name}</div>
                    <div className="text-gray-400 text-[10px]">{project.causeOfDeath}</div>
                    <div className="flex gap-2 mt-1 text-[9px]">
                      <span className="text-red-400">Tragedy: {project.emotionalTragedy}/10</span>
                      <span className="text-cyan-400">{project.likes} upvotes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          {/* Compass & Scale indicators */}
          <div className="relative z-10 flex justify-between items-end text-[10px] font-mono-tech text-cyan-500/50 px-1 pt-2">
            <div>
              <span>LAT_GRID: [84.15° N - 84.15° S]</span>
              <br />
              <span>LON_GRID: [180.00° W - 180.00° E]</span>
              {hoveredCountry && (
                <span className="text-cyan-400 block mt-1 font-bold">GRID LOCATION: {hoveredCountry.toUpperCase()}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>RED = TRASH FIRE (SEVERE REJECTION)</span>
              <span className="w-2 h-2 bg-cyan-400 rounded-full ml-2"></span>
              <span>CYAN = ACTIVE GLITCH DETECTED</span>
            </div>
          </div>
        </div>

        {/* Live Triage Console Sidebar */}
        <div className="bg-[#060913] border border-cyan-500/10 rounded-lg p-4 flex flex-col justify-between depth-top">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-mono-tech text-xs uppercase tracking-wide">
              <Trophy className="w-4 h-4" />
              <span>Hunt Leaderboard</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-gray-900/60 px-3 py-2 rounded-lg border border-amber-500/25">
                <span className="text-xs font-mono-tech text-amber-300 flex items-center gap-2"><span className="text-amber-500 font-bold">#1</span> ???</span>
                <span className="text-[10px] text-gray-500 font-mono-tech">escaped</span>
              </div>
              <div className="flex items-center justify-between bg-gray-900/60 px-3 py-2 rounded-lg border border-amber-500/15">
                <span className="text-xs font-mono-tech text-amber-300/90 flex items-center gap-2"><span className="text-amber-500 font-bold">#2</span> smudge</span>
                <span className="text-[10px] text-gray-500 font-mono-tech">closing in</span>
              </div>
              <p className="text-[10px] text-fuchsia-400/70 font-mono-tech pt-1">🗺️ a clue adventure is hidden here…</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/10 text-xs text-gray-400">
            {hoveredProject ? (
              <div className="bg-cyan-950/20 p-2 rounded border border-cyan-500/20">
                <div className="font-bold text-cyan-300">{hoveredProject.name}</div>
                <p className="text-[10px] line-clamp-2 mt-1">{hoveredProject.description}</p>
              </div>
            ) : (
              <p className="italic text-[10px] text-center text-gray-500">
                Hurry! Click any dot on the heartbeat map to examine its files and salvage its memory.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
