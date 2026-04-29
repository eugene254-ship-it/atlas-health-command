import { useState } from "react";
import { useDashboard } from "./dashboard-store";

export function PolicySimulator() {
  const { recordParamChange, executeStrategy } = useDashboard();
  const [allocation, setAllocation] = useState(80);
  const [stringency, setStringency] = useState(60);
  const [executing, setExecuting] = useState(false);

  const variance = -(allocation * 0.32 + stringency * 0.15) / 1.2;

  const handleExecute = () => {
    setExecuting(true);
    executeStrategy(allocation, stringency);
    setTimeout(() => setExecuting(false), 600);
  };

  return (
    <footer className="h-56 shrink-0 border-t border-titanium-700 bg-titanium-800 flex flex-col">
      <div className="h-8 shrink-0 border-b border-titanium-700 bg-titanium-900/50 flex items-center px-4 justify-between">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400">
          Policy Simulator // IF → THEN Matrix
        </span>
        <span className="font-mono text-[10px] text-titanium-400">MODEL v2.4 // CAUSAL</span>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-1/4 border-r border-titanium-700 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <Slider
              label="Resource Allocation" value={allocation}
              onChange={(v) => { setAllocation(v); recordParamChange("ALLOCATION", v); }}
              tone="titanium"
              valueLabel={allocation > 75 ? "MAX" : allocation > 40 ? "MID" : "LOW"}
            />
            <Slider
              label="Border Stringency" value={stringency}
              onChange={(v) => { setStringency(v); recordParamChange("STRINGENCY", v); }}
              tone="amber"
              valueLabel={stringency > 75 ? "STRICT" : stringency > 40 ? "ELEVATED" : "OPEN"}
            />
          </div>
          <div className="font-mono text-[10px] text-titanium-400">
            {executing ? "EXECUTING…" : "SIMULATION READY"}
          </div>
        </div>

        <div className="flex-1 p-4 flex items-center gap-6">
          <div className="w-1/2">
            <div className="text-xs text-titanium-400 mb-1">Projected Outcome Variance</div>
            <div className="font-mono text-3xl text-teal-secure tracking-tight">{variance.toFixed(1)}%</div>
            <div className="text-[10px] text-titanium-400 mt-1 uppercase">
              Reduction in transmission rate over 14 days
            </div>
          </div>
          <div className="w-px h-full bg-titanium-700" />
          <div className="w-1/2 space-y-2">
            <OutcomeRow label="Economic Disruption" value="MODERATE" tone="amber" />
            <OutcomeRow label="Public Trust Index" value="STABLE (78)" tone="teal" />
            <OutcomeRow label="Supply Depletion" value="14 DAYS" tone="neutral" />
            <OutcomeRow label="Funding Efficiency" value="+9%" tone="teal" />
          </div>
        </div>

        <AuditPanel />

        <div className="w-56 border-l border-titanium-700 p-4 bg-titanium-900/30 flex flex-col justify-center items-center gap-3">
          <div className="text-[10px] text-titanium-400 uppercase text-center font-mono">
            Authorization Required
          </div>
          <button
            onClick={handleExecute}
            disabled={executing}
            className="w-full py-3 bg-titanium-700 hover:bg-amber-glow/20 hover:border-amber-glow text-titanium-100 font-mono text-xs uppercase tracking-wider transition-colors border border-titanium-600 focus:outline-none focus:ring-1 focus:ring-amber-glow active:bg-titanium-800 disabled:opacity-50"
          >
            {executing ? "Authorizing…" : "Execute Strategy"}
          </button>
          <div className="font-mono text-[9px] text-titanium-400">
            Min. 2 ministerial signatures
          </div>
        </div>
      </div>
    </footer>
  );
}

function AuditPanel() {
  const { auditLog, verifyPendingSignatures } = useDashboard();
  const pending = auditLog.filter((e) => e.signature === "PENDING" || e.signature === "PARTIAL").length;
  const verified = auditLog.filter((e) => e.signature === "VERIFIED").length;
  const rejected = auditLog.filter((e) => e.signature === "REJECTED").length;
  return (
    <div className="w-80 border-l border-titanium-700 flex flex-col bg-titanium-900/30 min-h-0">
      <div className="h-6 shrink-0 border-b border-titanium-700 flex items-center justify-between px-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-titanium-400">
          Incident Audit Log
        </span>
        <span className="font-mono text-[9px] text-titanium-400">{auditLog.length} EVT</span>
      </div>
      <div className="h-6 shrink-0 border-b border-titanium-700 flex items-center justify-between px-2 bg-titanium-900/50 gap-2">
        <div className="flex items-center gap-2 font-mono text-[9px]">
          <span className="text-teal-secure">●{verified}</span>
          <span className="text-amber-glow">●{pending}P</span>
          <span className="text-amber-glow">✕{rejected}</span>
        </div>
        <button
          onClick={() => verifyPendingSignatures()}
          disabled={pending === 0}
          className="px-2 py-0.5 border border-titanium-600 hover:border-amber-glow hover:text-amber-glow text-titanium-100 font-mono text-[9px] uppercase tracking-wider transition-colors disabled:opacity-40 disabled:hover:border-titanium-600 disabled:hover:text-titanium-100"
        >
          Verify signatures
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {auditLog.length === 0 && (
          <div className="font-mono text-[10px] text-titanium-400 p-2">Awaiting events…</div>
        )}
        {auditLog.map((e) => (
          <div key={e.id} className="font-mono text-[10px] flex items-start gap-2 border-l border-titanium-700 pl-2 hover:border-amber-glow/50 hover:bg-titanium-700/30">
            <span className="text-titanium-400 tabular-nums shrink-0" suppressHydrationWarning>
              {new Date(e.ts).toISOString().substring(11, 19)}
            </span>
            <span className={`shrink-0 px-1 ${typeColor(e.type)}`}>{e.type.split("_")[0]}</span>
            <span className="text-titanium-100 flex-1 truncate" title={e.detail}>{e.detail}</span>
            <span className={`shrink-0 ${sigColor(e.signature)}`} title={e.signature}>{sigGlyph(e.signature)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function sigGlyph(s: string) {
  if (s === "VERIFIED") return "●";
  if (s === "REJECTED") return "✕";
  if (s === "PARTIAL") return "◐";
  return "○";
}

function typeColor(t: string) {
  if (t === "EXECUTE") return "text-amber-glow bg-amber-glow/10";
  if (t === "PARAM_CHANGE") return "text-titanium-100 bg-titanium-700";
  if (t === "DRILLDOWN") return "text-teal-secure bg-teal-secure/10";
  if (t === "LAYER_TOGGLE") return "text-titanium-400 bg-titanium-700";
  return "text-titanium-400";
}
function sigColor(s: string) {
  if (s === "VERIFIED") return "text-teal-secure";
  if (s === "REJECTED") return "text-amber-glow";
  if (s === "PARTIAL") return "text-amber-glow";
  return "text-titanium-400";
}

function Slider({ label, value, onChange, tone, valueLabel }: {
  label: string; value: number; onChange: (v: number) => void;
  tone: "amber" | "titanium"; valueLabel: string;
}) {
  const fill = tone === "amber" ? "bg-amber-glow/50" : "bg-titanium-400";
  const knob = tone === "amber" ? "bg-amber-glow" : "bg-titanium-100";
  const labelColor = tone === "amber" ? "text-amber-glow" : "text-titanium-100";
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono mb-1">
        <span className="text-titanium-400">PARAM: {label}</span>
        <span className={labelColor}>{valueLabel}</span>
      </div>
      <div className="relative">
        <div className="w-full h-1.5 bg-titanium-900 relative">
          <div className={`absolute top-0 left-0 h-full ${fill}`} style={{ width: `${value}%` }} />
          <div className={`absolute top-1/2 -translate-y-1/2 size-3 ${knob} border-2 border-titanium-900 pointer-events-none`}
            style={{ left: `calc(${value}% - 6px)` }} />
        </div>
        <input type="range" min={0} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </div>
  );
}

function OutcomeRow({ label, value, tone }: { label: string; value: string; tone: "amber" | "teal" | "neutral" }) {
  const c = tone === "amber" ? "text-amber-glow" : tone === "teal" ? "text-teal-secure" : "text-titanium-100";
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-titanium-400">{label}</span>
      <span className={`font-mono ${c}`}>{value}</span>
    </div>
  );
}
