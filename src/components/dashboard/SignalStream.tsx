type Severity = "critical" | "elevated" | "stable";

interface Signal {
  id: string;
  code: string;
  severity: Severity;
  title: string;
  body: string;
  time: string;
}

const signals: Signal[] = [
  {
    id: "1",
    code: "SGN-4092-B",
    severity: "critical",
    title: "Anomalous Respiratory Cluster Detected",
    body: "LOC: Kinshasa Sector 7\nVAR: +47.2% vs 72h moving baseline\nCONF: 89% (Syndromic Surveillance)",
    time: "14:02:44Z",
  },
  {
    id: "2",
    code: "LOG-118-X",
    severity: "elevated",
    title: "Cold Chain Integrity Compromised",
    body: "NODE: Lagos Central Depot\nSTAT: Power fluctuation. Backup generators engaged. 12h reserve.",
    time: "13:47:12Z",
  },
  {
    id: "3",
    code: "RES-901-A",
    severity: "stable",
    title: "Vaccine Allocation Dispatched",
    body: "ACT: 45,000 doses en route to Rift Valley coordination center. ETA 4h 12m.",
    time: "12:15:00Z",
  },
  {
    id: "4",
    code: "SGN-4088-C",
    severity: "elevated",
    title: "Cross-Border Mobility Spike",
    body: "LOC: Mano River Union checkpoint Alpha\nSTAT: 300% increase in transient volume over 6h.",
    time: "11:30:22Z",
  },
  {
    id: "5",
    code: "FND-2204-K",
    severity: "stable",
    title: "Disbursement Confirmed: Global Fund Tranche",
    body: "AMT: $12.0M → Kenya MoH. Outcome bindings: vaccination, maternal health.",
    time: "10:08:55Z",
  },
  {
    id: "6",
    code: "SGN-4081-A",
    severity: "elevated",
    title: "Trust Index Drop — Western Sector",
    body: "Community reporting frequency down 14.2% over 7d. Investigate intermediary NGOs.",
    time: "09:41:03Z",
  },
];

function severityClasses(s: Severity) {
  if (s === "critical")
    return "border-amber-glow/40 bg-amber-dim/20 border-l-2 border-l-amber-glow";
  if (s === "stable")
    return "border-teal-dim/40 bg-teal-dim/10 border-l-2 border-l-teal-secure";
  return "border-titanium-600 bg-titanium-900/50 border-l-2 border-l-titanium-400";
}

function badgeClasses(s: Severity) {
  if (s === "critical") return "text-amber-glow bg-amber-glow/10";
  if (s === "stable") return "text-teal-secure bg-teal-secure/10";
  return "text-titanium-400 bg-titanium-700";
}

export function SignalStream() {
  return (
    <aside className="border-r border-titanium-700 bg-titanium-800 flex flex-col min-h-0">
      <div className="h-10 shrink-0 border-b border-titanium-700 flex items-center px-4 justify-between">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400">
          Signal Intercepts
        </span>
        <span className="font-mono text-[10px] text-titanium-400">LIVE POLL: 2s</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {signals.map((sig) => (
          <article
            key={sig.id}
            className={`p-3 ${severityClasses(sig.severity)} relative overflow-hidden group cursor-pointer transition-colors hover:bg-titanium-700/40`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-mono text-[10px] px-1.5 py-0.5 ${badgeClasses(sig.severity)}`}>
                {sig.code}
              </span>
              <span className="font-mono text-[10px] text-titanium-400">{sig.time}</span>
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
