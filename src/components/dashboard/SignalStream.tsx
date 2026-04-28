import { useEffect, useState } from "react";
import { useDashboard, formatTimeUTC, type Severity } from "./dashboard-store";

function severityClasses(s: Severity) {
  if (s === "critical") return "border-amber-glow/40 bg-amber-dim/20 border-l-2 border-l-amber-glow";
  if (s === "stable") return "border-teal-dim/40 bg-teal-dim/10 border-l-2 border-l-teal-secure";
  return "border-titanium-600 bg-titanium-900/50 border-l-2 border-l-titanium-400";
}
function badgeClasses(s: Severity) {
  if (s === "critical") return "text-amber-glow bg-amber-glow/10";
  if (s === "stable") return "text-teal-secure bg-teal-secure/10";
  return "text-titanium-400 bg-titanium-700";
}

export function SignalStream() {
  const { signals, selectNode } = useDashboard();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <aside className="border-r border-titanium-700 bg-titanium-800 flex flex-col min-h-0">
      <div className="h-10 shrink-0 border-b border-titanium-700 flex items-center px-4 justify-between">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400">
          Signal Intercepts · Live
        </span>
        <span className="font-mono text-[10px] text-teal-secure flex items-center gap-1.5">
          <span className="size-1.5 bg-teal-secure animate-pulse" />
          STREAM 4.5s
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {signals.map((sig, idx) => (
          <article
            key={sig.id}
            onClick={() => sig.nodeId && selectNode(sig.nodeId)}
            className={`p-3 ${severityClasses(sig.severity)} relative overflow-hidden group cursor-pointer transition-colors hover:bg-titanium-700/40 ${idx === 0 && mounted ? "animate-in fade-in slide-in-from-top-2" : ""}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-mono text-[10px] px-1.5 py-0.5 ${badgeClasses(sig.severity)}`}>
                {sig.code}
              </span>
              <span className="font-mono text-[10px] text-titanium-400 tabular-nums" suppressHydrationWarning>
                {mounted ? formatTimeUTC(sig.ts) : "--:--:--Z"}
              </span>
            </div>
            <h3 className="text-xs font-medium text-titanium-100 mb-1">{sig.title}</h3>
            <p className="text-[11px] text-titanium-400 leading-snug font-mono whitespace-pre-line">
              {sig.body}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}
