import { useDashboard } from "./dashboard-store";

export function InsightsPanel() {
  const { directives } = useDashboard();
  const latest = directives[0];
  const projection = latest?.projection14d ?? defaultProjection();

  const max = Math.max(...projection);
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
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-3">
            <h3 className="text-xs uppercase tracking-wider text-titanium-400">
              {latest ? "Strategy Result · 14-Day" : "14-Day Trajectory"}
            </h3>
            <span className="font-mono text-[10px] text-titanium-400">
              {latest ? latest.code : "BASELINE"}
            </span>
          </div>

          {latest && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <ResultStat label="Δ TRANSMISSION" value={`-${latest.expectedReduction.toFixed(1)}%`} tone="teal" />
              <ResultStat label="DAY-14 LOAD" value={projection[13].toFixed(0)} tone="neutral" />
              <ResultStat label="PEAK DAY" value={`D${projection.indexOf(Math.max(...projection)) + 1}`} tone="amber" />
            </div>
          )}

          <div className="h-40 border border-titanium-700 bg-titanium-900/50 relative flex items-end p-2 gap-[3px]">
            {/* Severity bands */}
            <div className="absolute inset-x-0 top-0 h-1/3 bg-amber-glow/[0.04] border-b border-amber-glow/20 pointer-events-none">
              <span className="absolute left-1 top-0.5 font-mono text-[8px] text-amber-glow/70">CRITICAL ≥ 70</span>
            </div>
            <div className="absolute inset-x-0 top-1/3 h-1/3 bg-amber-glow/[0.02] border-b border-titanium-700 pointer-events-none">
              <span className="absolute left-1 top-0.5 font-mono text-[8px] text-titanium-400">ELEVATED 40–70</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-teal-secure/[0.04] pointer-events-none">
              <span className="absolute left-1 top-0.5 font-mono text-[8px] text-teal-secure/80">STABLE &lt; 40</span>
            </div>
            {/* Baseline reference (flat ~100) */}
            {latest && (
              <div className="absolute inset-x-2 border-t border-dashed border-titanium-400/40 pointer-events-none"
                style={{ top: `${100 - (100 / max) * 100}%` }}>
                <span className="absolute -top-3 right-0 font-mono text-[8px] text-titanium-400">BASELINE</span>
              </div>
            )}
            {projection.map((v, i) => {
              const h = (v / max) * 100;
              const tone = !latest ? "bg-amber-dim/60 border-t border-amber-glow/60"
                : v >= 70 ? "bg-amber-glow/40 border-t border-amber-glow"
                : v >= 40 ? "bg-amber-glow/20 border-t border-amber-glow/60"
                : "bg-teal-secure/50 border-t border-teal-secure";
              return (
                <div key={i} className={`flex-1 ${tone} relative z-10`} style={{ height: `${h}%` }}>
                  {i === 0 || i === 6 || i === 13 ? (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[8px] text-titanium-400">
                      D{i + 1}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-titanium-400 mt-6 leading-relaxed">
            {latest
              ? `Directive ${latest.code} executed. Expected reduction ${latest.expectedReduction.toFixed(1)}% over 14 days. Confidence interval 84%.`
              : "Awaiting directive execution. Baseline trajectory shown — primary vector projected to breach Sector 7 containment within 48h without intervention."}
          </p>
        </div>

        <div className="h-px w-full bg-titanium-700 mb-6" />

        <div>
          <h3 className="text-xs uppercase tracking-wider text-titanium-400 mb-3">
            Recent Directive Payloads
          </h3>
          {directives.length === 0 && (
            <div className="text-[11px] text-titanium-400 font-mono border border-dashed border-titanium-700 p-3">
              No directives executed. Configure parameters in the Policy Simulator and authorize.
            </div>
          )}
          <div className="space-y-2">
            {directives.slice(0, 4).map((d) => (
              <div key={d.id} className="border border-titanium-600 bg-titanium-900 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-amber-glow">{d.code}</span>
                  <span className="font-mono text-[9px] text-titanium-400" suppressHydrationWarning>
                    {new Date(d.ts).toISOString().substring(11, 19)}Z
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <Field label="ALLOC" value={`${d.params.allocation}`} />
                  <Field label="STRING" value={`${d.params.stringency}`} />
                  <Field label="Δ RATE" value={`${d.expectedReduction.toFixed(1)}%`} tone="teal" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-titanium-700 my-6" />

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

function ResultStat({ label, value, tone }: { label: string; value: string; tone: "teal" | "amber" | "neutral" }) {
  const c = tone === "teal" ? "text-teal-secure" : tone === "amber" ? "text-amber-glow" : "text-titanium-100";
  return (
    <div className="border border-titanium-700 bg-titanium-900/60 p-2">
      <div className="text-[9px] uppercase tracking-widest text-titanium-400">{label}</div>
      <div className={`font-mono text-base ${c}`}>{value}</div>
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "teal" }) {
  const c = tone === "teal" ? "text-teal-secure" : "text-titanium-100";
  return (
    <div>
      <div className="text-titanium-400 text-[9px]">{label}</div>
      <div className={c}>{value}</div>
    </div>
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

function defaultProjection() {
  const out: number[] = [];
  for (let d = 0; d < 14; d += 1) {
    out.push(60 + Math.sin(d * 0.6) * 15 + d * 1.5);
  }
  return out;
}
