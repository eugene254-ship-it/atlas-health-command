interface MapNode {
  id: string;
  label: string;
  top: string;
  left: string;
  kind: "critical" | "stable" | "watch";
  meta?: string;
}

const nodes: MapNode[] = [
  { id: "kin", label: "SGN-4092-B // KINSHASA", top: "44%", left: "48%", kind: "critical", meta: "Outbreak vector" },
  { id: "nai", label: "NAIROBI HUB", top: "56%", left: "62%", kind: "stable" },
  { id: "lag", label: "LAGOS DEPOT", top: "50%", left: "32%", kind: "watch" },
  { id: "kam", label: "KAMPALA", top: "52%", left: "55%", kind: "stable" },
  { id: "add", label: "ADDIS", top: "44%", left: "62%", kind: "stable" },
  { id: "jhb", label: "JOHANNESBURG", top: "82%", left: "55%", kind: "stable" },
  { id: "dak", label: "DAKAR", top: "40%", left: "20%", kind: "stable" },
];

export function HealthMap() {
  return (
    <section className="relative bg-titanium-900 overflow-hidden flex flex-col min-h-0">
      {/* Grid backdrop */}
      <div className="absolute inset-0 grid-bg" />
      {/* Soft radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, color-mix(in oklab, var(--titanium-900) 80%, transparent) 100%)",
        }}
      />

      {/* Nodes */}
      <div className="absolute inset-0">
        {nodes.map((n) => (
          <div
            key={n.id}
            className="absolute flex items-center justify-center"
            style={{ top: n.top, left: n.left }}
          >
            {n.kind === "critical" && (
              <>
                <span className="absolute size-24 bg-amber-glow/15 rounded-full animate-ping [animation-duration:3s]" />
                <span className="absolute size-12 bg-amber-glow/25 rounded-full" />
                <span className="size-3 bg-amber-glow z-10 glow-amber" />
                <div className="absolute top-5 left-5 z-20 bg-titanium-900/90 border border-amber-glow/50 px-2 py-1 backdrop-blur-sm">
                  <div className="font-mono text-[9px] text-amber-glow whitespace-nowrap">
                    {n.label}
                  </div>
                </div>
              </>
            )}
            {n.kind === "stable" && (
              <>
                <span className="size-2 bg-teal-secure glow-teal" />
                <div className="absolute top-3 left-3 font-mono text-[9px] text-titanium-400 whitespace-nowrap">
                  {n.label}
                </div>
              </>
            )}
            {n.kind === "watch" && (
              <>
                <span className="size-2 bg-titanium-400" />
                <div className="absolute top-3 left-3 font-mono text-[9px] text-titanium-400 whitespace-nowrap">
                  {n.label}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Funding flow line from Nairobi → Kinshasa */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.65 0.12 185)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="oklch(0.72 0.17 60)" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <line
            x1="62"
            y1="56"
            x2="48"
            y2="44"
            stroke="url(#flow)"
            strokeWidth="0.25"
            strokeDasharray="0.6 0.4"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-2" dur="1.5s" repeatCount="indefinite" />
          </line>
          <line
            x1="32"
            y1="50"
            x2="48"
            y2="44"
            stroke="oklch(0.62 0.015 255 / 0.5)"
            strokeWidth="0.15"
            strokeDasharray="0.4 0.4"
          />
        </svg>
      </div>

      {/* HUD: Continental Index */}
      <div className="absolute top-4 left-4 z-10 w-64 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md p-4">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400 mb-3">
          Continental Index
        </h2>
        <div className="flex items-end gap-2 mb-4">
          <span className="font-mono text-4xl leading-none text-titanium-100 tracking-tight">
            84.2
          </span>
          <span className="font-mono text-sm text-teal-secure mb-1">+1.4%</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-titanium-400">Bed Capacity</span>
            <span className="font-mono text-titanium-100">68%</span>
          </div>
          <div className="w-full h-1 bg-titanium-700">
            <div className="h-full bg-teal-secure" style={{ width: "68%" }} />
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-titanium-400">Supply Burn Rate</span>
            <span className="font-mono text-amber-glow">High</span>
          </div>
          <div className="w-full h-1 bg-titanium-700">
            <div className="h-full bg-amber-glow" style={{ width: "82%" }} />
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-titanium-400">Trust Network</span>
            <span className="font-mono text-titanium-100">0.74</span>
          </div>
          <div className="w-full h-1 bg-titanium-700">
            <div className="h-full bg-titanium-400" style={{ width: "74%" }} />
          </div>
        </div>
      </div>

      {/* HUD: Funding Deployment */}
      <div className="absolute bottom-4 right-4 z-10 w-72 border border-titanium-700 bg-titanium-900/85 backdrop-blur-md p-4">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400 mb-3">
          Active Funding Deployment
        </h2>
        <div className="space-y-3">
          <FlowRow label="Epidemiological Surveillance" amount="$4.2M" tone="teal" />
          <FlowRow label="Rapid Response Teams" amount="$8.9M" tone="amber" />
          <FlowRow label="Cold Chain Maintenance" amount="$1.1M" tone="muted" />
          <FlowRow label="Maternal Health Programs" amount="$3.4M" tone="teal" />
        </div>
        <div className="mt-3 pt-3 border-t border-titanium-700 flex justify-between font-mono text-[10px]">
          <span className="text-titanium-400">EFFICIENCY SCORE</span>
          <span className="text-teal-secure">0.72</span>
        </div>
      </div>

      {/* HUD: Tactical projection (top right) */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="bg-titanium-900/80 border border-titanium-700 backdrop-blur px-3 py-1.5">
          <div className="font-mono text-[9px] text-titanium-400 uppercase">Active Nodes</div>
          <div className="font-mono text-sm text-titanium-100">1,842</div>
        </div>
        <div className="bg-titanium-900/80 border border-amber-glow/50 backdrop-blur px-3 py-1.5">
          <div className="font-mono text-[9px] text-amber-glow uppercase">Threat Level</div>
          <div className="font-mono text-sm text-amber-glow">Elevated</div>
        </div>
      </div>
    </section>
  );
}

function FlowRow({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: string;
  tone: "teal" | "amber" | "muted";
}) {
  const color =
    tone === "teal"
      ? "text-teal-secure"
      : tone === "amber"
        ? "text-amber-glow"
        : "text-titanium-400";
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-titanium-100">{label}</span>
      <span className={`font-mono text-xs ${color}`}>{amount}</span>
    </div>
  );
}
