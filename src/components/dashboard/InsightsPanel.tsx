export function InsightsPanel() {
  return (
    <aside className="border-l border-titanium-700 bg-titanium-800 flex flex-col min-h-0">
      <div className="h-10 shrink-0 border-b border-titanium-700 flex items-center px-4 justify-between">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-titanium-400">
          Algorithmic Projection
        </span>
        <span className="font-mono text-[10px] text-teal-secure border border-teal-secure/30 px-1">
          ONLINE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* Trajectory chart */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-titanium-400 mb-3">
            72h Outbreak Trajectory
          </h3>
          <div className="h-32 border border-titanium-700 bg-titanium-900/50 relative flex items-end p-2 gap-1">
            {[20, 25, 40, 60, 85, 70, 50].map((h, i) => {
              const peak = h === 85;
              return (
                <div
                  key={i}
                  className={`w-full ${peak ? "bg-amber-dim border-t border-amber-glow relative" : h >= 60 ? "bg-amber-dim/70 border-t border-amber-glow/60" : "bg-titanium-700"}`}
                  style={{ height: `${h}%` }}
                >
                  {peak && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-amber-glow bg-titanium-900 px-1 border border-amber-glow/50">
                      PEAK
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-titanium-400 mt-2 leading-relaxed">
            Confidence interval 84%. Primary vector projected to breach Sector 7 containment
            within 48 hours without immediate supply intervention.
          </p>
        </div>

        <div className="h-px w-full bg-titanium-700 mb-6" />

        {/* Directives */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-titanium-400 mb-3">
            Recommended Directives
          </h3>
          <div className="space-y-3">
            <Directive
              dot="amber"
              code="DIRECTIVE ALPHA-1"
              body="Reroute 15,000 therapeutic courses from Central Depot to Sector 7 frontline facilities."
              impact="-22% spread"
              cost="$1.2M"
            />
            <Directive
              dot="muted"
              code="DIRECTIVE BETA-4"
              body="Deploy mobile containment units to border crossing Alpha to intercept transient vectors."
              impact="-14% spread"
              cost="$0.8M"
              costMuted
            />
            <Directive
              dot="muted"
              code="DIRECTIVE GAMMA-2"
              body="Release $2.1M contingency reserve to western sector NGOs to stabilize trust reporting."
              impact="+8% trust"
              cost="$2.1M"
              costMuted
            />
          </div>
        </div>

        <div className="h-px w-full bg-titanium-700 my-6" />

        {/* Trust graph summary */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-titanium-400 mb-3">
            Institutional Trust
          </h3>
          <div className="space-y-2">
            <TrustRow from="WHO" to="Kenya MoH" score={0.81} />
            <TrustRow from="Global Fund" to="Tanzania MoH" score={0.74} />
            <TrustRow from="MSF" to="DRC Health Ministry" score={0.61} />
            <TrustRow from="Africa CDC" to="Nigeria MoH" score={0.86} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function Directive({
  dot,
  code,
  body,
  impact,
  cost,
  costMuted,
}: {
  dot: "amber" | "muted";
  code: string;
  body: string;
  impact: string;
  cost: string;
  costMuted?: boolean;
}) {
  return (
    <button className="block w-full text-left border border-titanium-600 bg-titanium-900 p-3 hover:border-titanium-400 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className={`size-2 ${dot === "amber" ? "bg-amber-glow" : "bg-titanium-400"}`} />
        <span className="font-mono text-[10px] text-titanium-100">{code}</span>
      </div>
      <p className="text-[11px] text-titanium-400 mb-3 leading-snug">{body}</p>
      <div className="flex justify-between items-center font-mono text-[10px]">
        <span className="text-teal-secure">IMPACT: {impact}</span>
        <span className={costMuted ? "text-titanium-400" : "text-amber-glow"}>COST: {cost}</span>
      </div>
    </button>
  );
}

function TrustRow({ from, to, score }: { from: string; to: string; score: number }) {
  const tone = score >= 0.8 ? "text-teal-secure" : score >= 0.7 ? "text-titanium-100" : "text-amber-glow";
  return (
    <div className="flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-2 text-titanium-400 font-mono">
        <span className="text-titanium-100">{from}</span>
        <span>→</span>
        <span className="text-titanium-100">{to}</span>
      </div>
      <span className={`font-mono ${tone}`}>{score.toFixed(2)}</span>
    </div>
  );
}
