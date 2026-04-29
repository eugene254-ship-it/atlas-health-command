import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type Severity = "critical" | "elevated" | "stable";
export type SignalKind = "outbreak" | "funding" | "logistics" | "trust" | "mobility";

export interface Signal {
  id: string;
  code: string;
  severity: Severity;
  kind: SignalKind;
  title: string;
  body: string;
  ts: number; // epoch ms
  nodeId?: string;
}

export interface MapNode {
  id: string;
  label: string;
  city: string;
  country: string;
  top: string;
  left: string;
  kind: "outbreak" | "hospital" | "depot";
  severity: Severity;
  meta?: string;
  trustScore: number;
  credibility: number;
  edges: { partner: string; score: number }[];
  interactions: { ts: number; text: string }[];
}

export interface FundingFlow {
  id: string;
  from: string;
  to: string;
  amountUSD: number;
  purpose: string;
  ts: number;
}

export interface AuditEntry {
  id: string;
  ts: number;
  type: "PARAM_CHANGE" | "EXECUTE" | "DRILLDOWN" | "LAYER_TOGGLE" | "SIGNAL_INGEST";
  actor: string;
  detail: string;
  signature: "PENDING" | "PARTIAL" | "VERIFIED" | "REJECTED";
}

export interface Directive {
  id: string;
  code: string;
  ts: number;
  params: { allocation: number; stringency: number };
  projection14d: number[]; // 14 daily values
  expectedReduction: number;
  signatures: number;
}

export interface DashboardDiagnostics {
  constants: { name: string; loaded: boolean; count: number; required: boolean }[];
  templateCount: number;
  fundingSource: "absolute-seed" | "template-fallback" | "empty";
  missingDefinitions: string[];
  lastHydratedAt: number | null;
  refreshNonce: number;
}

export type LayerKey = "outbreaks" | "heat" | "funding" | "hospitals";
export type TimeWindow = "6H" | "24H" | "7D" | "30D";

interface Ctx {
  signals: Signal[];
  nodes: MapNode[];
  fundingFlows: FundingFlow[];
  auditLog: AuditEntry[];
  directives: Directive[];
  layers: Record<LayerKey, boolean>;
  timeWindow: TimeWindow;
  windowMs: number;
  windowedSignals: Signal[];
  windowedFlows: FundingFlow[];
  selectedNode: MapNode | null;
  useSeededDemoData: boolean;
  diagnostics: DashboardDiagnostics;
  toggleLayer: (k: LayerKey) => void;
  setTimeWindow: (w: TimeWindow) => void;
  setUseSeededDemoData: (enabled: boolean) => void;
  refreshDashboardState: () => void;
  selectNode: (id: string | null) => void;
  recordParamChange: (param: string, value: number) => void;
  executeStrategy: (allocation: number, stringency: number) => Directive;
  verifyPendingSignatures: () => { verified: number; rejected: number };
}

export const WINDOW_MS: Record<TimeWindow, number> = {
  "6H": 6 * 3600_000,
  "24H": 24 * 3600_000,
  "7D": 7 * 24 * 3600_000,
  "30D": 30 * 24 * 3600_000,
};

const DashboardCtx = createContext<Ctx | null>(null);

const NODES: MapNode[] = [
  {
    id: "kin", label: "SGN-4092-B // KINSHASA", city: "Kinshasa", country: "DRC",
    top: "44%", left: "48%", kind: "outbreak", severity: "critical",
    meta: "Outbreak vector",
    trustScore: 0.61, credibility: 0.72,
    edges: [
      { partner: "MSF", score: 0.81 },
      { partner: "WHO AFRO", score: 0.74 },
      { partner: "DRC MoH", score: 0.55 },
    ],
    interactions: [],
  },
  {
    id: "nai", label: "NAIROBI HUB", city: "Nairobi", country: "Kenya",
    top: "56%", left: "62%", kind: "hospital", severity: "stable",
    trustScore: 0.86, credibility: 0.91,
    edges: [
      { partner: "Africa CDC", score: 0.88 },
      { partner: "Global Fund", score: 0.79 },
      { partner: "Kenya MoH", score: 0.84 },
    ],
    interactions: [],
  },
  {
    id: "lag", label: "LAGOS DEPOT", city: "Lagos", country: "Nigeria",
    top: "50%", left: "32%", kind: "depot", severity: "elevated",
    trustScore: 0.74, credibility: 0.78,
    edges: [
      { partner: "Gavi", score: 0.82 },
      { partner: "Nigeria MoH", score: 0.71 },
    ],
    interactions: [],
  },
  {
    id: "kam", label: "KAMPALA", city: "Kampala", country: "Uganda",
    top: "52%", left: "55%", kind: "hospital", severity: "stable",
    trustScore: 0.78, credibility: 0.80,
    edges: [{ partner: "Uganda MoH", score: 0.77 }],
    interactions: [],
  },
  {
    id: "add", label: "ADDIS", city: "Addis Ababa", country: "Ethiopia",
    top: "44%", left: "62%", kind: "hospital", severity: "stable",
    trustScore: 0.81, credibility: 0.83,
    edges: [{ partner: "Africa CDC", score: 0.85 }],
    interactions: [],
  },
  {
    id: "jhb", label: "JOHANNESBURG", city: "Johannesburg", country: "South Africa",
    top: "82%", left: "55%", kind: "hospital", severity: "stable",
    trustScore: 0.84, credibility: 0.87,
    edges: [{ partner: "SAMRC", score: 0.88 }],
    interactions: [],
  },
  {
    id: "dak", label: "DAKAR", city: "Dakar", country: "Senegal",
    top: "40%", left: "20%", kind: "hospital", severity: "stable",
    trustScore: 0.76, credibility: 0.79,
    edges: [{ partner: "WAHO", score: 0.78 }],
    interactions: [],
  },
];

const SEED_SIGNALS: Signal[] = [
  { id: "s1", code: "SGN-4092-B", severity: "critical", kind: "outbreak", title: "Anomalous Respiratory Cluster Detected", body: "LOC: Kinshasa Sector 7\nVAR: +47.2% vs 72h baseline\nCONF: 89%", ts: Date.UTC(2026, 3, 28, 14, 2, 44), nodeId: "kin" },
  { id: "s2", code: "LOG-118-X", severity: "elevated", kind: "logistics", title: "Cold Chain Integrity Compromised", body: "NODE: Lagos Central Depot\nSTAT: Power fluctuation. 12h reserve.", ts: Date.UTC(2026, 3, 28, 13, 47, 12), nodeId: "lag" },
  { id: "s3", code: "RES-901-A", severity: "stable", kind: "logistics", title: "Vaccine Allocation Dispatched", body: "ACT: 45,000 doses → Rift Valley. ETA 4h 12m.", ts: Date.UTC(2026, 3, 28, 12, 15, 0), nodeId: "nai" },
  { id: "s4", code: "FND-2204-K", severity: "stable", kind: "funding", title: "Disbursement Confirmed: Global Fund", body: "AMT: $12.0M → Kenya MoH. Bindings: vaccination, maternal health.", ts: Date.UTC(2026, 3, 28, 10, 8, 55), nodeId: "nai" },
];

// SSR-safe: use fixed offsets (ms) instead of Date.now() at module scope.
// Resolved to absolute ts inside the provider on mount to keep server/client renders consistent.
const SEED_FUNDING_TEMPLATES: Array<Omit<FundingFlow, "ts"> & { offsetMs: number }> = [
  { id: "f1", from: "nai", to: "kin", amountUSD: 12_000_000, purpose: "Outbreak response", offsetMs: 3600_000 },
  { id: "f2", from: "lag", to: "kin", amountUSD: 4_200_000, purpose: "Cold chain support", offsetMs: 7200_000 },
  { id: "f3", from: "jhb", to: "kam", amountUSD: 2_100_000, purpose: "Maternal programs", offsetMs: 10800_000 },
];

type RequiredDashboardSeedConstant = "NODES" | "SEED_SIGNALS" | "SEED_FUNDING_TEMPLATES";

const FUNDING_SEED_CONSTANTS = {
  NODES,
  SEED_SIGNALS,
  SEED_FUNDING_TEMPLATES,
} satisfies Record<RequiredDashboardSeedConstant, readonly unknown[]>;

function buildFundingFlowsFromTemplates(baseTs: number) {
  return SEED_FUNDING_TEMPLATES.map(({ offsetMs, ...rest }) => ({ ...rest, ts: baseTs - offsetMs }));
}

function validateDashboardConstants(lastHydratedAt: number | null, refreshNonce: number, fundingSource: DashboardDiagnostics["fundingSource"]): DashboardDiagnostics {
  const constants = Object.entries(FUNDING_SEED_CONSTANTS).map(([name, value]) => ({
    name,
    loaded: Array.isArray(value),
    count: Array.isArray(value) ? value.length : 0,
    required: true,
  }));
  const missingDefinitions = constants.filter((c) => c.required && (!c.loaded || c.count === 0)).map((c) => c.name);
  return { constants, templateCount: SEED_FUNDING_TEMPLATES.length, fundingSource, missingDefinitions, lastHydratedAt, refreshNonce };
}

// Pool of synthetic templates the mock feed pulls from
const POOL: Omit<Signal, "id" | "ts" | "code">[] = [
  { severity: "critical", kind: "outbreak", title: "Hemorrhagic Fever Suspected Cluster", body: "LOC: Kisangani periphery\nVAR: +32% syndromic", nodeId: "kin" },
  { severity: "elevated", kind: "mobility", title: "Cross-Border Mobility Spike", body: "Mano River checkpoint Alpha +300%", nodeId: "lag" },
  { severity: "stable", kind: "funding", title: "Tranche Released — Gavi", body: "AMT: $4.4M → Lagos cold chain", nodeId: "lag" },
  { severity: "elevated", kind: "trust", title: "Trust Reporting Anomaly", body: "Western sector NGO reporting -14% / 7d", nodeId: "dak" },
  { severity: "critical", kind: "outbreak", title: "Cholera Index Crossing Threshold", body: "Kinshasa Sector 4: WAC > 0.42", nodeId: "kin" },
  { severity: "stable", kind: "logistics", title: "Convoy Acknowledged", body: "Addis → Mekele therapeutic shipment", nodeId: "add" },
  { severity: "elevated", kind: "logistics", title: "Bed Capacity Saturating", body: "Kampala General: 92% occupancy", nodeId: "kam" },
  { severity: "stable", kind: "funding", title: "WHO AFRO Allocation", body: "$1.8M → Johannesburg surveillance lab", nodeId: "jhb" },
];

let pid = 5000;
function nextCode(kind: SignalKind) {
  pid += 1;
  const prefix = kind === "outbreak" ? "SGN" : kind === "funding" ? "FND" : kind === "logistics" ? "LOG" : kind === "mobility" ? "MOB" : "TRS";
  const tail = String.fromCharCode(65 + (pid % 26));
  return `${prefix}-${pid}-${tail}`;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<Signal[]>(SEED_SIGNALS);
  const [nodes, setNodes] = useState<MapNode[]>(NODES);
  // Start empty on SSR + first client render to avoid hydration mismatch from Date.now().
  // Hydrate seed flows in an effect (client-only) with absolute timestamps.
  const [fundingFlows, setFundingFlows] = useState<FundingFlow[]>([]);
  const [useSeededDemoData, setUseSeededDemoData] = useState(true);
  const [lastHydratedAt, setLastHydratedAt] = useState<number | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [clockTs, setClockTs] = useState(() => Date.UTC(2026, 3, 29, 14, 0, 0));
  const fundingSource: DashboardDiagnostics["fundingSource"] = fundingFlows.length > 0 ? "template-fallback" : useSeededDemoData ? "template-fallback" : "empty";
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    outbreaks: true, heat: true, funding: true, hospitals: true,
  });
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("24H");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const auditCounter = useRef(0);

  const hydrateFundingFlows = useCallback((baseTs = Date.now()) => {
    setClockTs(baseTs);
    setLastHydratedAt(baseTs);
    setFundingFlows(useSeededDemoData ? buildFundingFlowsFromTemplates(baseTs) : []);
  }, [useSeededDemoData]);

  useEffect(() => {
    hydrateFundingFlows();
  }, [hydrateFundingFlows, refreshNonce]);

  const refreshDashboardState = useCallback(() => {
    const nextTs = Date.now();
    setSignals(SEED_SIGNALS);
    setNodes(NODES);
    setSelectedId(null);
    setDirectives([]);
    setClockTs(nextTs);
    setLastHydratedAt(nextTs);
    setFundingFlows(useSeededDemoData ? buildFundingFlowsFromTemplates(nextTs) : []);
    setRefreshNonce((n) => n + 1);
    if (typeof window !== "undefined" && "caches" in window) {
      void window.caches.keys().then((keys) => Promise.all(keys.map((key) => window.caches.delete(key))));
    }
  }, [useSeededDemoData]);

  const pushAudit = useCallback((type: AuditEntry["type"], detail: string, signature: AuditEntry["signature"] = "PENDING", actor = "OPS-CMD") => {
    auditCounter.current += 1;
    setAuditLog((prev) => [
      { id: `aud-${auditCounter.current}`, ts: Date.now(), type, actor, detail, signature },
      ...prev,
    ].slice(0, 80));
  }, []);

  // Live signal feed
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      const tpl = POOL[Math.floor(Math.random() * POOL.length)];
      n += 1;
      const sig: Signal = {
        ...tpl,
        id: `live-${Date.now()}-${n}`,
        code: nextCode(tpl.kind),
        ts: Date.now(),
      };
      setSignals((prev) => [sig, ...prev].slice(0, 40));
      pushAudit("SIGNAL_INGEST", `${sig.code} · ${sig.title}`, "VERIFIED", "INGEST-DAEMON");

      // funding signal → add a flow
      if (sig.kind === "funding" && sig.nodeId) {
        setFundingFlows((prev) => [
          { id: `fl-${Date.now()}`, from: sig.nodeId === "nai" ? "jhb" : "nai", to: sig.nodeId!, amountUSD: 1_000_000 + Math.floor(Math.random() * 6_000_000), purpose: "Live disbursement", ts: Date.now() },
          ...prev,
        ].slice(0, 8));
      }
      // outbreak → bump severity flicker
      if (sig.kind === "outbreak" && sig.nodeId) {
        setNodes((prev) => prev.map((nd) => nd.id === sig.nodeId ? { ...nd, interactions: [{ ts: sig.ts, text: sig.title }, ...nd.interactions].slice(0, 6) } : nd));
      }
    }, 4500);
    return () => clearInterval(id);
  }, [pushAudit]);

  const toggleLayer = useCallback((k: LayerKey) => {
    setLayers((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      pushAudit("LAYER_TOGGLE", `${k.toUpperCase()} → ${next[k] ? "ON" : "OFF"}`, "VERIFIED");
      return next;
    });
  }, [pushAudit]);

  const selectNode = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const nd = nodes.find((n) => n.id === id);
      if (nd) pushAudit("DRILLDOWN", `Inspect ${nd.city} (${nd.country})`, "VERIFIED");
    }
  }, [nodes, pushAudit]);

  const recordParamChange = useCallback((param: string, value: number) => {
    pushAudit("PARAM_CHANGE", `${param} → ${value}`, "PENDING");
  }, [pushAudit]);

  const executeStrategy = useCallback((allocation: number, stringency: number) => {
    const baseline = 100;
    const reduction = (allocation * 0.32 + stringency * 0.15) / 1.2;
    const projection: number[] = [];
    for (let d = 0; d < 14; d += 1) {
      // sigmoid decay shaped by reduction
      const t = d / 13;
      const decay = 1 - (reduction / 100) * (1 - Math.exp(-3 * t));
      const noise = (Math.sin(d * 1.7) + Math.cos(d * 0.6)) * 1.5;
      projection.push(Math.max(20, baseline * decay + noise));
    }
    const dir: Directive = {
      id: `dir-${Date.now()}`,
      code: `DIR-${(directives.length + 1).toString().padStart(3, "0")}`,
      ts: Date.now(),
      params: { allocation, stringency },
      projection14d: projection,
      expectedReduction: reduction,
      signatures: 2,
      // ministerial signatures collected
    };
    setDirectives((prev) => [dir, ...prev].slice(0, 10));
    pushAudit("EXECUTE", `${dir.code} · alloc=${allocation} · string=${stringency} · Δ=${reduction.toFixed(1)}%`, "VERIFIED", "MINISTERIAL");
    return dir;
  }, [directives.length, pushAudit]);

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null;

  const verifyPendingSignatures = useCallback(() => {
    let verified = 0;
    let rejected = 0;
    setAuditLog((prev) => prev.map((e) => {
      if (e.signature !== "PENDING" && e.signature !== "PARTIAL") return e;
      // EXECUTE / DRILLDOWN / LAYER / INGEST → VERIFIED. PARAM_CHANGE → 80% VERIFIED, 20% REJECTED.
      const verify = e.type === "PARAM_CHANGE" ? Math.random() > 0.2 : true;
      if (verify) verified += 1; else rejected += 1;
      return { ...e, signature: verify ? "VERIFIED" : "REJECTED" };
    }));
    auditCounter.current += 1;
    setAuditLog((prev) => [
      { id: `aud-${auditCounter.current}`, ts: Date.now(), type: "EXECUTE" as const, actor: "MINISTERIAL", detail: `Signature audit · ${verified} verified · ${rejected} rejected`, signature: "VERIFIED" as const },
      ...prev,
    ].slice(0, 80));
    return { verified, rejected };
  }, []);

  const windowMs = WINDOW_MS[timeWindow];
  const cutoff = Date.now() - windowMs;
  const windowedSignals = useMemo(() => signals.filter((s) => typeof s?.ts === "number" && s.ts >= cutoff), [signals, cutoff]);
  const windowedFlows = useMemo(() => (fundingFlows ?? []).filter((f) => f && typeof f.ts === "number" && f.ts >= cutoff), [fundingFlows, cutoff]);

  const value = useMemo<Ctx>(() => ({
    signals, nodes, fundingFlows, auditLog, directives, layers, timeWindow, windowMs,
    windowedSignals, windowedFlows, selectedNode,
    toggleLayer, setTimeWindow, selectNode, recordParamChange, executeStrategy, verifyPendingSignatures,
  }), [signals, nodes, fundingFlows, auditLog, directives, layers, timeWindow, windowMs, windowedSignals, windowedFlows, selectedNode, toggleLayer, selectNode, recordParamChange, executeStrategy, verifyPendingSignatures]);

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}

export function useDashboard() {
  const v = useContext(DashboardCtx);
  if (!v) throw new Error("useDashboard outside DashboardProvider");
  return v;
}

export function formatTimeUTC(ts: number) {
  return new Date(ts).toISOString().substring(11, 19) + "Z";
}
export function formatDateTimeUTC(ts: number) {
  return new Date(ts).toISOString().substring(5, 19).replace("T", " ") + "Z";
}
