"use client";

import {
  Activity,
  Bell,
  Braces,
  CircleAlert,
  Command,
  Menu,
  Radar,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { IncidentFeed } from "@/components/incident-feed";
import { RiskProfile } from "@/components/risk-profile";
import { StatCard } from "@/components/stat-card";
import { useIncidents } from "@/hooks/use-incidents";

const RiskChart = dynamic(
  () =>
    import("@/components/risk-chart").then((module) => module.RiskChart),
  {
    ssr: false,
    loading: () => (
      <div className="panel h-[402px] animate-pulse rounded-2xl lg:col-span-7" />
    ),
  },
);

const navItems = [
  { label: "Overview", icon: Radar, active: true },
  { label: "Incidents", icon: CircleAlert },
  { label: "Integrations", icon: Braces },
];

export function Dashboard() {
  const { incidents, connectionState, error, refresh } = useIncidents();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastSync, setLastSync] = useState("--:--");

  useEffect(() => {
    setLastSync(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [incidents]);

  const stats = useMemo(() => {
    const critical = incidents.filter(
      (incident) => incident.severity.toLowerCase() === "critical",
    ).length;
    const medium = incidents.filter(
      (incident) => incident.severity.toLowerCase() === "medium",
    ).length;

    return { critical, medium };
  }, [incidents]);

  const connectionCopy = {
    connecting: "Connecting",
    live: "Realtime active",
    demo: "Demo telemetry",
    error: "Connection issue",
  }[connectionState];

  return (
    <div className="min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/[0.06] bg-[#070b12]/95 p-5 backdrop-blur-xl transition-transform lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
              <ShieldCheck size={20} strokeWidth={1.8} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan shadow-[0_0_9px_#19e6c7]" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.25em] text-white">
                VEIL
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-600">
                Threat intelligence
              </p>
            </div>
          </div>
          <button
            aria-label="Close navigation"
            className="text-slate-500 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-12 space-y-1">
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-700">
            Command center
          </p>
          {navItems.map((item) => (
            <button
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                item.active
                  ? "border border-cyan/10 bg-cyan/[0.07] text-cyan"
                  : "border border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
              }`}
              key={item.label}
            >
              <item.icon size={17} strokeWidth={1.7} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <span
              className={`relative flex h-2 w-2 ${
                connectionState === "live" ? "" : "opacity-70"
              }`}
            >
              {connectionState === "live" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-50" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  connectionState === "error" ? "bg-red-400" : "bg-cyan"
                }`}
              />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {connectionCopy}
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-slate-600">
            Supabase event stream
            <br />
            public.incidents
          </p>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/[0.06] bg-ink/80 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              aria-label="Open navigation"
              className="text-slate-400 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                Security operations
              </p>
              <h1 className="mt-1 text-base font-medium text-slate-200">
                Threat overview
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Refresh incidents"
              className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-2.5 text-slate-500 transition-colors hover:text-cyan"
              onClick={() => void refresh()}
            >
              <RefreshCw
                className={connectionState === "connecting" ? "animate-spin" : ""}
                size={16}
              />
            </button>
            <button
              aria-label="Notifications"
              className="relative rounded-lg border border-white/[0.07] bg-white/[0.025] p-2.5 text-slate-500"
            >
              <Bell size={16} />
              {stats.critical > 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
              )}
            </button>
            <div className="ml-2 hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:flex">
              <Command size={13} className="text-cyan" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                SOC-01
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan">
                <Activity size={13} />
                Perimeter telemetry
              </div>
              <h2 className="mt-3 text-2xl font-medium tracking-tight text-white md:text-3xl">
                Security at a glance
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Monitor AI threat signals across your connected surfaces.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-600">
              Last sync
              <span className="font-mono text-slate-400">{lastSync}</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
              <TriangleAlert className="mt-0.5 shrink-0" size={15} />
              <span>
                {error} Check your environment variables, RLS policy, and
                Realtime publication.
              </span>
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              detail="Across all monitored surfaces"
              icon={Activity}
              label="Total incidents"
              value={incidents.length}
            />
            <StatCard
              detail="Requires immediate response"
              icon={CircleAlert}
              label="Critical incidents"
              tone="red"
              value={stats.critical}
            />
            <StatCard
              detail="Queued for analyst review"
              icon={TriangleAlert}
              label="Medium incidents"
              tone="amber"
              value={stats.medium}
            />
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-12">
            <RiskChart incidents={incidents} />
            <RiskProfile incidents={incidents} />
          </section>

          <IncidentFeed incidents={incidents} />
        </div>
      </main>
    </div>
  );
}
