"use client";

import { Activity, Shield, AlertTriangle, TriangleAlert as WarningIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { IncidentTable } from "@/components/incident-table";
import { RiskProfile } from "@/components/risk-profile";
import { useIncidents } from "@/hooks/use-incidents";
import { motion } from "framer-motion";

const RiskChart = dynamic(
  () => import("@/components/risk-chart").then((module) => module.RiskChart),
  { ssr: false, loading: () => <div className="panel h-[402px] animate-pulse rounded-xl lg:col-span-7" /> }
);

export function OverviewContent() {
  const { incidents, error } = useIncidents();
  const [lastSync, setLastSync] = useState("--:--");

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, [incidents]);

  const stats = useMemo(() => {
    const critical = incidents.filter((i) => i.severity.toLowerCase() === "critical").length;
    const medium = incidents.filter((i) => i.severity.toLowerCase() === "medium" || i.severity.toLowerCase() === "high").length;
    
    // Calculate a mock posture score based on recent incidents
    const baseScore = 100;
    const penalty = (critical * 5) + (medium * 2);
    const score = Math.max(0, baseScore - penalty);

    return { critical, medium, score };
  }, [incidents]);

  return (
    <div className="space-y-6">
      <div className="-mt-14 mb-4 flex justify-end">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
          Last sync
          <span className="font-mono text-zinc-300">{lastSync}</span>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <WarningIcon className="mt-0.5 shrink-0" size={16} />
          <span>{error} Check your environment variables and Realtime publication.</span>
        </motion.div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Posture Score", value: `${stats.score}/100`, icon: Shield, detail: "Overall Security Health", tone: stats.score > 80 ? "text-primary" : "text-red-400" },
          { label: "Total Incidents", value: incidents.length.toString(), icon: Activity, detail: "Across all monitored surfaces", tone: "text-zinc-100" },
          { label: "Critical Threats", value: stats.critical.toString(), icon: AlertTriangle, detail: "Requires immediate response", tone: "text-red-500" },
          { label: "Elevated Risks", value: stats.medium.toString(), icon: WarningIcon, detail: "Queued for analyst review", tone: "text-amber-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="panel p-5 flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <stat.icon size={16} className="text-zinc-600" />
            </div>
            <div>
              <p className={`text-3xl font-semibold ${stat.tone}`}>{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-2">{stat.detail}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-8">
          <RiskChart incidents={incidents} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-4">
          <RiskProfile incidents={incidents} />
        </motion.div>
      </section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">Live Incident Feed</h3>
          <p className="text-sm text-zinc-500">Real-time alerts from your configured surfaces.</p>
        </div>
        <IncidentTable incidents={incidents.slice(0, 10)} />
      </motion.section>
    </div>
  );
}
