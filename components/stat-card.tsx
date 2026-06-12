import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone?: "cyan" | "red" | "amber";
}

const toneStyles = {
  cyan: {
    icon: "border-cyan/20 bg-cyan/10 text-cyan",
    glow: "bg-cyan/10",
    line: "bg-cyan",
  },
  red: {
    icon: "border-red-400/20 bg-red-400/10 text-red-400",
    glow: "bg-red-500/10",
    line: "bg-red-400",
  },
  amber: {
    icon: "border-amber-300/20 bg-amber-300/10 text-amber-300",
    glow: "bg-amber-400/10",
    line: "bg-amber-300",
  },
};

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "cyan",
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="panel group min-h-44 rounded-2xl p-5 transition-colors hover:border-white/15">
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${styles.glow}`}
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <div className={`rounded-lg border p-2 ${styles.icon}`}>
            <Icon size={17} strokeWidth={1.8} />
          </div>
        </div>
        <div>
          <p className="font-mono text-4xl font-medium tracking-tight text-white">
            {value.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${styles.line}`} />
            {detail}
          </div>
        </div>
      </div>
    </article>
  );
}
