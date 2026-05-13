import { useState } from "react";
import { useDashboard, type LayerKey, type TimeWindow, type MapNode } from "./dashboard-store";

const LAYER_DEFS: { key: LayerKey; label: string; marker: "amber-ping" | "amber-dim" | "teal-dot" | "diamond" | "flow" }[] = [
  { key: "outbreaks", label: "Outbreaks", marker: "amber-ping" },
  { key: "heat", label: "Heat Zones", marker: "amber-dim" },
  { key: "funding", label: "Funding Flows", marker: "flow" },
  { key: "hospitals", label: "Hospital Nodes", marker: "teal-dot" },
];
const WINDOWS: TimeWindow[] = ["6H", "24H", "7D", "30D"];

export function HealthMap() {
  const { nodes, signals, fundingFlows, windowedFlows, windowedSignals, layers, timeWindow, toggleLayer, setTimeWindow, selectNode, diagnostics, useSeededDemoData, setUseSeededDemoData, refreshDashboardState, exportDiagnostics } = useDashboard();
  const missingDefs = diagnostics.missingDefinitions;
  const fundingEmpty = diagnostics.fundingSource === "empty" || (Array.isArray(windowedFlows) && windowedFlows.length === 0);
  const [legendOpen, setLegendOpen] = useState(true);
  const [debugOpen, setDebugOpen] = useState(false);

  // A node only renders if there's a signal for it inside the window (outbreak nodes), or always for hospitals/depots.
  const activeOutbreakIds = new Set(windowedSignals.filter((s) => s.kind === "outbreak").map((s) => s.nodeId));

  const showOutbreak = (n: MapNode) =>
    n.kind === "outbreak" && layers.outbreaks && activeOutbreakIds.has(n.id);
  const showHospital = (n: MapNode) => (n.kind === "hospital" || n.kind === "depot") && layers.hospitals;

  return (
    <section className="relative bg-titanium-900 overflow-hidden flex flex-col min-h-0">
      <div className="absolute inset-0 grid-bg" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, color-mix(in oklab, var(--titanium-900) 80%, transparent) 100%)",
        }}
      />

      {/* Heat zones */}
      {layers.heat && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute size-72 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ top: "44%", left: "48%", background: "radial-gradient(circle, color-mix(in oklab, var(--amber-glow) 25%, transparent), transparent 70%)" }} />
          <div className="absolute size-56 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ top: "50%", left: "32%", background: "radial-gradient(circle, color-mix(in oklab, var(--amber-glow) 12%, transparent), transparent 70%)" }} />
        </div>
      )}

      {/* Nodes */}
      <div className="absolute inset-0">
        {nodes.map((n) => {
          const visible = showOutbreak(n) || showHospital(n);
          if (!visible) return null;
          return (
            <button
              key={n.id}
              onClick={() => selectNode(n.id)}
              className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-glow"
              style={{ top: n.top, left: n.left }}
            >
              {n.kind === "outbreak" ? (
                <>
                  <span className="absolute size-24 bg-amber-glow/15 rounded-full animate-ping [animation-duration:3s]" />
                  <span className="absolute size-12 bg-amber-glow/25 rounded-full" />
                  <span className="size-3 bg-amber-glow z-10 glow-amber" />
                  <div className="absolute top-5 left-5 z-20 bg-titanium-900/90 border border-amber-glow/50 px-2 py-1 backdrop-blur-sm">
                    <div className="font-mono text-[9px] text-amber-glow whitespace-nowrap">{n.label}</div>
                  </div>
                </>
              ) : n.kind === "depot" ? (
                <>
                  <span className="size-2 bg-titanium-400 rotate-45" />
                  <div className="absolute top-3 left-3 font-mono text-[9px] text-titanium-400 whitespace-nowrap">{n.label}</div>
                </>
              ) : (
                <>
                  <span className="size-2 bg-teal-secure glow-teal" />
                  <div className="absolute top-3 left-3 font-mono text-[9px] text-titanium-400 whitespace-nowrap">{n.label}</div>
                </>
              )}
            </button>
          );
        })}

        {/* Funding flows */}
        {layers.funding && Array.isArray(windowedFlows) && windowedFlows.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.65 0.12 185)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="oklch(0.72 0.17 60)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {windowedFlows.map((fl) => {
              if (!fl?.from || !fl?.to) return null;
              const a = nodes.find((n) => n.id === fl.from);
              const b = nodes.find((n) => n.id === fl.to);
              if (!a || !b) return null;
              const x1 = parseFloat(a.left); const y1 = parseFloat(a.top);
              const x2 = parseFloat(b.left); const y2 = parseFloat(b.top);
              if ([x1, y1, x2, y2].some((v) => Number.isNaN(v))) return null;
              return (
                <line key={fl.id} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="url(#flow)" strokeWidth="0.25" strokeDasharray="0.6 0.4">
                  <animate attributeName="stroke-dashoffset" from="0" to="-2" dur="1.5s" repeatCount="indefinite" />
                </line>
              );
            })}
          </svg>
        )}
        {layers.funding && Array.isArray(windowedFlows) && windowedFlows.length === 0 && (
          <div className="absolute bottom-24 right-4 z-10 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md px-3 py-2 font-mono text-[10px] text-titanium-400 uppercase tracking-widest">
            No funding flows in window
          </div>
        )}
      </div>

      {/* HUD: Continental Index */}
      <div className="absolute top-4 left-4 z-10 w-64 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md p-4">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400 mb-3">
          Continental Index
        </h2>
        <div className="flex items-end gap-2 mb-4">
          <span className="font-mono text-4xl leading-none text-titanium-100 tracking-tight">84.2</span>
          <span className="font-mono text-sm text-teal-secure mb-1">+1.4%</span>
        </div>
        <div className="space-y-2">
          <Bar label="Bed Capacity" value={68} tone="teal" />
          <Bar label="Supply Burn Rate" value={82} tone="amber" valueLabel="High" />
          <Bar label="Trust Network" value={74} tone="muted" valueLabel="0.74" />
        </div>
      </div>

      {/* Layer Toggles + Window */}
      <div className="absolute bottom-4 left-4 z-10 w-64 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md p-4">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400 mb-3">
          Map Layers
        </h2>
        <div className="space-y-2 mb-4">
          {LAYER_DEFS.map((l) => (
            <label key={l.key} className="flex items-center justify-between cursor-pointer text-xs group">
              <span className="text-titanium-100 group-hover:text-amber-glow transition-colors">{l.label}</span>
              <button
                onClick={() => toggleLayer(l.key)}
                className={`w-9 h-4 relative border ${layers[l.key] ? "bg-teal-secure/30 border-teal-secure" : "bg-titanium-700 border-titanium-600"} transition-colors`}
                aria-pressed={layers[l.key]}
              >
                <span className={`absolute top-0.5 size-3 ${layers[l.key] ? "left-5 bg-teal-secure" : "left-0.5 bg-titanium-400"} transition-all`} />
              </button>
            </label>
          ))}
        </div>
        <div className="pt-3 border-t border-titanium-700">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400 mb-2">
            Time Window
          </div>
          <div className="grid grid-cols-4 gap-1">
            {WINDOWS.map((w) => (
              <button key={w}
                onClick={() => setTimeWindow(w)}
                className={`py-1 font-mono text-[10px] border transition-colors ${timeWindow === w ? "bg-amber-glow/20 border-amber-glow text-amber-glow" : "border-titanium-700 text-titanium-400 hover:border-titanium-400"}`}
              >{w}</button>
            ))}
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-titanium-700 space-y-2">
          <label className="flex items-center justify-between cursor-pointer text-xs group">
            <span className="text-titanium-100 group-hover:text-amber-glow transition-colors">Use seeded demo data</span>
            <button
              onClick={() => setUseSeededDemoData(!useSeededDemoData)}
              className={`w-9 h-4 relative border ${useSeededDemoData ? "bg-teal-secure/30 border-teal-secure" : "bg-titanium-700 border-titanium-600"} transition-colors`}
              aria-pressed={useSeededDemoData}
            >
              <span className={`absolute top-0.5 size-3 ${useSeededDemoData ? "left-5 bg-teal-secure" : "left-0.5 bg-titanium-400"} transition-all`} />
            </button>
          </label>
          <button
            onClick={refreshDashboardState}
            className="w-full border border-titanium-700 px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-titanium-300 hover:border-amber-glow/50 hover:text-amber-glow transition-colors"
          >
            Safe refresh state
          </button>
        </div>
      </div>

      {/* HUD: Funding Deployment */}
      <div className="absolute bottom-4 right-4 z-10 w-72 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md p-4">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400 mb-3 flex items-center justify-between">
          <span>Active Funding Deployment</span>
          {(missingDefs.length > 0 || fundingEmpty) && (
            <span
              className="font-mono text-[9px] text-amber-glow border border-amber-glow/50 px-1.5 py-0.5"
              title={missingDefs.length > 0 ? `Missing: ${missingDefs.join(", ")}` : `Source: ${diagnostics.fundingSource}`}
            >
              {missingDefs.length > 0 ? `MISSING ${missingDefs.length}` : "NO DATA"}
            </span>
          )}
        </h2>
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
          {windowedFlows.map((fl) => {
            const a = nodes.find((n) => n.id === fl.from);
            const b = nodes.find((n) => n.id === fl.to);
            return (
              <div key={fl.id} className="flex justify-between items-center text-xs">
                <span className="text-titanium-100 font-mono text-[10px]">
                  {a?.city ?? fl.from} → {b?.city ?? fl.to}
                </span>
                <span className="font-mono text-[10px] text-teal-secure">
                  ${(fl.amountUSD / 1_000_000).toFixed(1)}M
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-titanium-700 flex justify-between font-mono text-[10px]">
          <span className="text-titanium-400">EFFICIENCY SCORE</span>
          <span className="text-teal-secure">0.72</span>
        </div>
      </div>

      {/* Top right HUD */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="bg-titanium-900/80 border border-titanium-700 backdrop-blur px-3 py-1.5">
          <div className="font-mono text-[9px] text-titanium-400 uppercase">Active Nodes</div>
          <div className="font-mono text-sm text-titanium-100">{nodes.length * 263}</div>
        </div>
        <div className="bg-titanium-900/80 border border-amber-glow/50 backdrop-blur px-3 py-1.5">
          <div className="font-mono text-[9px] text-amber-glow uppercase">Threat Level</div>
          <div className="font-mono text-sm text-amber-glow">Elevated</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md">
        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 gap-3"
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-titanium-400">
            Legend · Window {timeWindow} · {windowedSignals.length} signals · {windowedFlows.length} flows
          </span>
          <span className="font-mono text-[9px] text-titanium-400">{legendOpen ? "−" : "+"}</span>
        </button>
        {legendOpen && (
          <div className="border-t border-titanium-700 px-3 py-2 grid grid-cols-2 gap-x-5 gap-y-1.5 min-w-[420px]">
            {LAYER_DEFS.map((l) => (
              <div key={l.key} className={`flex items-center gap-2 text-[10px] ${layers[l.key] ? "" : "opacity-40"}`}>
                <LegendSwatch marker={l.marker} />
                <span className="font-mono text-titanium-100">{l.label}</span>
                <span className="font-mono text-titanium-400 ml-auto">{layerHint(l.key)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug overlay */}
      <div className="absolute bottom-4 right-4 z-20">
        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="font-mono text-[9px] uppercase tracking-widest text-titanium-400 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md px-2 py-1 hover:text-amber-glow hover:border-amber-glow/50"
        >
          {debugOpen ? "× DEBUG" : "DEBUG"}
        </button>
        {debugOpen && (
          <div className="mt-2 w-72 border border-titanium-700 bg-titanium-900/95 backdrop-blur-md p-3 font-mono text-[10px] text-titanium-300 space-y-1">
            <div className="text-titanium-400 uppercase tracking-widest text-[9px] mb-2">Map Debug · Window {timeWindow}</div>
            <div>signals.total: <span className="text-teal-secure">{signals?.length ?? 0}</span></div>
            <div>signals.windowed: <span className="text-teal-secure">{windowedSignals?.length ?? 0}</span></div>
            <div>fundingFlows.total: <span className="text-teal-secure">{fundingFlows?.length ?? 0}</span></div>
            <div>windowedFlows: <span className="text-teal-secure">{windowedFlows?.length ?? 0}</span></div>
            <div>nodes: <span className="text-teal-secure">{nodes?.length ?? 0}</span></div>
            <div>funding.source: <span className={diagnostics.fundingSource === "empty" ? "text-amber-glow" : "text-teal-secure"}>{diagnostics.fundingSource}</span></div>
            <div>demoSeed.enabled: <span className={useSeededDemoData ? "text-teal-secure" : "text-titanium-500"}>{useSeededDemoData ? "TRUE" : "FALSE"}</span></div>
            <div>refresh.nonce: <span className="text-teal-secure">{diagnostics.refreshNonce}</span></div>
            <div className="pt-2 border-t border-titanium-700 mt-2">
              <div className="text-titanium-400 uppercase tracking-widest text-[9px] mb-1">Layers</div>
              {Object.entries(layers).map(([k, v]) => (
                <div key={k}>{k}: <span className={v ? "text-teal-secure" : "text-titanium-500"}>{v ? "ON" : "OFF"}</span></div>
              ))}
            </div>
            <div className="pt-2 border-t border-titanium-700 mt-2">
              <div className="text-titanium-400 uppercase tracking-widest text-[9px] mb-1">Constants</div>
              {diagnostics.constants.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-2">
                  <span>{c.name}</span>
                  <span className={c.loaded && c.count > 0 ? "text-teal-secure" : "text-amber-glow"}>{c.loaded ? `${c.count} LOADED` : "MISSING"}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-2">
                <span>missing.definitions</span>
                <span className={diagnostics.missingDefinitions.length ? "text-amber-glow" : "text-teal-secure"}>{diagnostics.missingDefinitions.length || "NONE"}</span>
              </div>
              <button
                onClick={exportDiagnostics}
                className="mt-2 w-full border border-titanium-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-titanium-300 hover:border-amber-glow/50 hover:text-amber-glow transition-colors"
              >
                Export diagnostics JSON
              </button>
            </div>
          </div>
        )}
      </div>

      <NodeDrilldown />
    </section>
  );
}

function layerHint(k: LayerKey) {
  if (k === "outbreaks") return "amber pulse";
  if (k === "heat") return "amber halo";
  if (k === "funding") return "teal→amber line";
  return "teal dot · diamond=depot";
}

function LegendSwatch({ marker }: { marker: "amber-ping" | "amber-dim" | "teal-dot" | "diamond" | "flow" }) {
  if (marker === "amber-ping") {
    return (
      <span className="relative inline-flex items-center justify-center w-4 h-4">
        <span className="absolute w-4 h-4 bg-amber-glow/20 rounded-full" />
        <span className="size-1.5 bg-amber-glow glow-amber" />
      </span>
    );
  }
  if (marker === "amber-dim") {
    return <span className="w-4 h-4 rounded-full" style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--amber-glow) 35%, transparent), transparent 70%)" }} />;
  }
  if (marker === "teal-dot") {
    return <span className="size-2 bg-teal-secure glow-teal inline-block" />;
  }
  if (marker === "diamond") {
    return <span className="size-2 bg-titanium-400 inline-block rotate-45" />;
  }
  return (
    <svg width="20" height="6">
      <line x1="0" y1="3" x2="20" y2="3" stroke="oklch(0.65 0.12 185)" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

function Bar({ label, value, tone, valueLabel }: { label: string; value: number; tone: "teal" | "amber" | "muted"; valueLabel?: string }) {
  const fill = tone === "teal" ? "bg-teal-secure" : tone === "amber" ? "bg-amber-glow" : "bg-titanium-400";
  const txt = tone === "amber" ? "text-amber-glow" : "text-titanium-100";
  return (
    <>
      <div className="flex justify-between text-xs">
        <span className="text-titanium-400">{label}</span>
        <span className={`font-mono ${txt}`}>{valueLabel ?? `${value}%`}</span>
      </div>
      <div className="w-full h-1 bg-titanium-700">
        <div className={`h-full ${fill}`} style={{ width: `${value}%` }} />
      </div>
    </>
  );
}

function NodeDrilldown() {
  const { selectedNode, selectNode, windowedSignals, windowMs, timeWindow } = useDashboard();
  if (!selectedNode) return null;
  const n = selectedNode;

  // Build a unified, time-ordered timeline: signals targeting this node + recorded interactions.
  const sigEvents = windowedSignals
    .filter((s) => s.nodeId === n.id)
    .map((s) => ({ ts: s.ts, label: s.code, text: s.title, severity: s.severity, kind: "signal" as const }));
  const interactionEvents = n.interactions.map((i) => ({
    ts: i.ts, label: "INTERACT", text: i.text, severity: "stable" as const, kind: "interaction" as const,
  }));
  const timeline = [...sigEvents, ...interactionEvents].sort((a, b) => b.ts - a.ts).slice(0, 12);

  const now = Date.now();
  const cutoff = now - windowMs;
  const span = Math.max(now - cutoff, 1);

  return (
    <div className="absolute inset-0 z-30 bg-titanium-900/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => selectNode(null)}>
      <div className="w-[520px] border border-titanium-600 bg-titanium-800 max-h-[90%] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}>
        <div className="h-9 border-b border-titanium-700 flex items-center justify-between px-4 bg-titanium-900/70">
          <span className="font-mono text-[10px] uppercase tracking-widest text-titanium-400">
            Institution Drilldown
          </span>
          <button onClick={() => selectNode(null)} className="font-mono text-[10px] text-titanium-400 hover:text-amber-glow">
            CLOSE [ESC]
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`size-2 ${n.kind === "outbreak" ? "bg-amber-glow" : n.kind === "depot" ? "bg-titanium-400 rotate-45" : "bg-teal-secure"}`} />
              <h3 className="font-mono text-sm text-titanium-100">{n.label}</h3>
            </div>
            <p className="font-mono text-[10px] text-titanium-400">{n.city} · {n.country}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Trust Score" value={n.trustScore.toFixed(2)} tone={n.trustScore >= 0.8 ? "teal" : n.trustScore >= 0.7 ? "neutral" : "amber"} />
            <Stat label="Source Credibility" value={n.credibility.toFixed(2)} tone={n.credibility >= 0.8 ? "teal" : "neutral"} />
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-titanium-400 mb-2">Trust Edges</h4>
            <div className="space-y-1.5">
              {n.edges.map((e) => (
                <div key={e.partner} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-titanium-100 font-mono">{n.city}</span>
                    <svg width="40" height="6" className="opacity-60">
                      <line x1="0" y1="3" x2="40" y2="3" stroke={e.score >= 0.8 ? "oklch(0.65 0.12 185)" : "oklch(0.62 0.015 255)"} strokeWidth={Math.max(1, e.score * 3)} />
                    </svg>
                    <span className="text-titanium-100 font-mono">{e.partner}</span>
                  </div>
                  <span className={`font-mono ${e.score >= 0.8 ? "text-teal-secure" : "text-titanium-400"}`}>{e.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] uppercase tracking-widest text-titanium-400">Timeline · {timeWindow}</h4>
              <span className="font-mono text-[9px] text-titanium-400">{timeline.length} events</span>
            </div>
            {/* Axis */}
            <div className="relative h-10 border border-titanium-700 bg-titanium-900/50 mb-2">
              <div className="absolute inset-x-0 top-1/2 h-px bg-titanium-700" />
              {timeline.map((e, idx) => {
                const left = ((e.ts - cutoff) / span) * 100;
                const color = e.severity === "critical" ? "bg-amber-glow glow-amber" : e.severity === "elevated" ? "bg-amber-glow/60" : "bg-teal-secure";
                return (
                  <div key={idx} className={`absolute size-1.5 ${color} top-1/2 -translate-y-1/2 -translate-x-1/2`}
                    style={{ left: `${Math.max(0, Math.min(100, left))}%` }}
                    title={`${e.label} · ${e.text}`} />
                );
              })}
              <div className="absolute left-1 bottom-0.5 font-mono text-[8px] text-titanium-400">−{timeWindow}</div>
              <div className="absolute right-1 bottom-0.5 font-mono text-[8px] text-titanium-400">NOW</div>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
              {timeline.length === 0 && (
                <div className="text-[11px] text-titanium-400 font-mono">No events in {timeWindow} window.</div>
              )}
              {timeline.map((e, idx) => (
                <div key={idx} className={`text-[11px] border-l pl-2 ${e.severity === "critical" ? "border-amber-glow" : e.severity === "elevated" ? "border-amber-glow/50" : "border-teal-secure/60"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-titanium-400" suppressHydrationWarning>
                      {new Date(e.ts).toISOString().substring(11, 19)}Z
                    </span>
                    <span className="font-mono text-[9px] text-titanium-400">{e.label}</span>
                  </div>
                  <div className="text-titanium-100">{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "teal" | "amber" | "neutral" }) {
  const c = tone === "teal" ? "text-teal-secure" : tone === "amber" ? "text-amber-glow" : "text-titanium-100";
  return (
    <div className="border border-titanium-700 bg-titanium-900/50 p-3">
      <div className="text-[10px] uppercase tracking-widest text-titanium-400 mb-1">{label}</div>
      <div className={`font-mono text-xl ${c}`}>{value}</div>
    </div>
  );
}
