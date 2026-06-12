import { ArrowUpRight, Fingerprint } from "lucide-react";
import type { Incident } from "@/types/incident";

interface IncidentFeedProps {
  incidents: Incident[];
}

const severityStyles: Record<string, string> = {
  critical: "border-red-400/20 bg-red-400/10 text-red-300",
  high: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  low: "border-cyan/20 bg-cyan/10 text-cyan",
};

function getFinding(findings: Incident["findings"]) {
  if (Array.isArray(findings)) return findings[0] ?? "Anomalous behavior";
  if (typeof findings === "string") return findings;
  if (findings && typeof findings === "object") {
    return Object.keys(findings)[0] ?? "Anomalous behavior";
  }
  return "Anomalous behavior";
}

function getRelativeTime(dateString: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  return (
    <section className="panel mt-5 rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Live incident feed
          </p>
          <h2 className="mt-2 text-lg font-medium text-white">
            Latest detections
          </h2>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          {incidents.length} events loaded
        </p>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {incidents.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Fingerprint className="mx-auto text-slate-700" size={30} />
            <p className="mt-4 text-sm text-slate-500">
              No incidents detected. Your perimeter is quiet.
            </p>
          </div>
        ) : (
          incidents.slice(0, 8).map((incident) => {
            const severity = incident.severity.toLowerCase();
            return (
              <article
                className="group grid gap-4 px-5 py-5 transition-colors hover:bg-white/[0.018] md:grid-cols-[1fr_140px_90px_28px] md:items-center"
                key={incident.id}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        severity === "critical"
                          ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.8)]"
                          : "bg-cyan"
                      }`}
                    />
                    <p className="truncate text-sm font-medium text-slate-200">
                      {incident.website}
                    </p>
                  </div>
                  <div className="ml-4 mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-600">
                    <span className="shrink-0 text-slate-400">
                      {getFinding(incident.findings)}
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {incident.prompt_preview ?? "No prompt preview captured"}
                    </span>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
                      severityStyles[severity] ?? severityStyles.low
                    }`}
                  >
                    {incident.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 md:block">
                  <span className="font-mono text-sm text-slate-300">
                    {incident.risk_score}
                  </span>
                  <span className="ml-1 text-[9px] uppercase text-slate-600">
                    risk
                  </span>
                  <p
                    className="mt-1 text-[10px] text-slate-600"
                    suppressHydrationWarning
                  >
                    {getRelativeTime(incident.created_at)}
                  </p>
                </div>
                <ArrowUpRight
                  className="text-slate-700 transition-colors group-hover:text-cyan"
                  size={16}
                />
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
