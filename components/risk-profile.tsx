import type { Incident } from "@/types/incident";

interface RiskProfileProps {
  incidents: Incident[];
}

const levels = [
  { name: "Critical", key: "critical", color: "bg-red-400" },
  { name: "High", key: "high", color: "bg-orange-400" },
  { name: "Medium", key: "medium", color: "bg-amber-300" },
  { name: "Low", key: "low", color: "bg-cyan" },
];

export function RiskProfile({ incidents }: RiskProfileProps) {
  const total = Math.max(incidents.length, 1);
  const average = incidents.length
    ? Math.round(
        incidents.reduce((sum, item) => sum + Number(item.risk_score || 0), 0) /
          incidents.length,
      )
    : 0;

  return (
    <section className="panel rounded-2xl p-5 lg:col-span-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Exposure profile
      </p>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#19e6c7_var(--risk),#17202b_0)] [--risk:0%]" style={{ "--risk": `${average}%` } as React.CSSProperties}>
          <div className="flex h-[86px] w-[86px] flex-col items-center justify-center rounded-full bg-[#0a1019]">
            <span className="font-mono text-2xl text-white">{average}</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500">
              Avg risk
            </span>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Current risk index</h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Aggregated severity across the latest monitored events.
          </p>
        </div>
      </div>
      <div className="mt-7 space-y-4">
        {levels.map((level) => {
          const count = incidents.filter(
            (item) => item.severity.toLowerCase() === level.key,
          ).length;
          const width = Math.max((count / total) * 100, count ? 5 : 0);

          return (
            <div key={level.key}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-400">{level.name}</span>
                <span className="font-mono text-slate-500">{count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${level.color}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
