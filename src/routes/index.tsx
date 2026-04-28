import { createFileRoute } from "@tanstack/react-router";
import { CommandHeader } from "@/components/dashboard/CommandHeader";
import { SignalStream } from "@/components/dashboard/SignalStream";
import { HealthMap } from "@/components/dashboard/HealthMap";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { PolicySimulator } from "@/components/dashboard/PolicySimulator";
import { DashboardProvider } from "@/components/dashboard/dashboard-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas Sanctum — WHS Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Live continental health intelligence cockpit: outbreak detection, funding flows, institutional trust, and policy simulation for WHS Nairobi 2026.",
      },
      { property: "og:title", content: "Atlas Sanctum — WHS Intelligence Dashboard" },
      {
        property: "og:description",
        content:
          "A decision engine for African health coordination — signals, map, AI directives, and policy simulator.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardProvider>
      <div className="h-dvh w-full bg-titanium-900 text-titanium-100 flex flex-col overflow-hidden text-sm">
        <CommandHeader />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr_380px] overflow-hidden min-h-0">
          <SignalStream />
          <HealthMap />
          <InsightsPanel />
        </main>
        <PolicySimulator />
      </div>
    </DashboardProvider>
  );
}
