import { useEffect, useState } from "react";

function useUtcClock() {
  const [t, setT] = useState<string>("--:--:--Z");
  useEffect(() => {
    const tick = () => setT(new Date().toISOString().substring(11, 19) + "Z");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function CommandHeader() {
  const time = useUtcClock();
  return (
    <header className="h-12 shrink-0 border-b border-titanium-700 bg-titanium-800 flex items-center justify-between px-4 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-2 bg-amber-glow glow-amber" />
          <span className="font-mono font-semibold tracking-widest text-xs text-titanium-100 uppercase">
            Atlas Sanctum
          </span>
        </div>
        <div className="h-4 w-px bg-titanium-600" />
        <h1 className="text-xs text-titanium-400 uppercase tracking-wider font-medium">
          WHS Intelligence Directorate · Nairobi 2026
        </h1>
      </div>
      <div className="hidden md:flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-titanium-400">LAT/LON</span>
          <span className="text-titanium-100">0.0236°S, 37.9062°E</span>
        </div>
        <div className="h-4 w-px bg-titanium-600" />
        <div className="flex items-center gap-2 text-teal-secure">
          <div className="size-1.5 bg-teal-secure" />
          <span>SECURE UPLINK</span>
        </div>
        <div className="h-4 w-px bg-titanium-600" />
        <span className="text-titanium-100 tabular-nums" suppressHydrationWarning>{time}</span>
        <div className="h-4 w-px bg-titanium-600" />
        <span className="text-amber-glow">AUTH: MINISTERIAL OVERRIDE</span>
      </div>
    </header>
  );
}
