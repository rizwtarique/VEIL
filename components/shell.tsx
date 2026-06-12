"use client";

import {
  Bell,
  Command,
  Menu,
  RefreshCw,
  ShieldCheck,
  X,
  Radar,
  CircleAlert,
  Braces,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useIncidents } from "@/hooks/use-incidents";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: Radar, href: "/" },
  { label: "Incidents", icon: CircleAlert, href: "/incidents" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Integrations", icon: Braces, href: "/integrations" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface ShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function Shell({ children, title, subtitle }: ShellProps) {
  const { incidents, connectionState, refresh } = useIncidents();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const pathname = usePathname();

  const stats = useMemo(() => {
    const critical = incidents.filter(
      (incident) => incident.severity.toLowerCase() === "critical",
    ).length;
    return { critical };
  }, [incidents]);

  const connectionCopy = {
    connecting: "Connecting",
    live: "Realtime active",
    demo: "Demo telemetry",
    error: "Connection issue",
  }[connectionState];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="min-h-screen bg-ink text-zinc-300">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-800/60 bg-ink/95 backdrop-blur-xl transition-transform lg:translate-x-0",
          mobileNavOpen ? "translate-x-0 w-64" : "-translate-x-full lg:w-auto"
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck size={20} strokeWidth={1.8} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                <p className="text-lg font-semibold tracking-widest text-zinc-100">VEIL</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Security Operations</p>
              </motion.div>
            )}
          </Link>
          <button
            aria-label="Close navigation"
            className="text-zinc-500 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace Dropdown Mock */}
        {!sidebarCollapsed && (
          <div className="px-5 pb-4">
            <div className="flex w-full items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400 cursor-pointer hover:bg-zinc-800 transition-colors">
              <div className="flex items-center gap-2 truncate">
                <div className="h-5 w-5 rounded bg-gradient-to-tr from-primary to-indigo-600" />
                <span className="truncate font-medium text-zinc-200">Global Tech Inc.</span>
              </div>
              <ChevronRight size={14} className="shrink-0" />
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-none">
          {!sidebarCollapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Command center
            </p>
          )}
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                  sidebarCollapsed ? "justify-center" : "gap-3 w-full"
                )}
                key={item.label}
                onClick={() => setMobileNavOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon size={18} className="relative z-10 shrink-0" strokeWidth={active ? 2 : 1.7} />
                {!sidebarCollapsed && (
                  <span className="relative z-10 truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 mt-auto">
          {!sidebarCollapsed ? (
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("relative flex h-2 w-2", connectionState === "live" ? "" : "opacity-70")}>
                  {connectionState === "live" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                  )}
                  <span className={cn("relative inline-flex h-2 w-2 rounded-full", connectionState === "error" ? "bg-red-500" : "bg-primary")} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  {connectionCopy}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/50 cursor-pointer hover:text-zinc-200">
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-300 truncate">Security Admin</p>
                  <p className="text-[10px] text-zinc-500 truncate">admin@globaltech.com</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={cn("h-2 w-2 rounded-full", connectionState === "live" ? "bg-primary" : "bg-red-500")} title={connectionCopy} />
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700">
                <User size={14} />
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/80 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        className="flex flex-col min-h-screen transition-all duration-300"
        initial={false}
        animate={{ paddingLeft: sidebarCollapsed ? 80 : 256 }}
      >
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/60 bg-ink/80 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              className="hidden lg:flex items-center justify-center rounded-lg h-8 w-8 text-zinc-500 hover:bg-zinc-800/50 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button
              aria-label="Open navigation"
              className="text-zinc-400 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">{subtitle}</p>
              <h1 className="text-base font-semibold text-zinc-100">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search / Command Palette Trigger */}
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Search size={14} />
              <span>Search platform...</span>
              <span className="ml-4 flex items-center gap-0.5 text-[10px] font-semibold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                <Command size={10} />K
              </span>
            </button>
            <button
              aria-label="Refresh data"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              onClick={() => void refresh()}
            >
              <RefreshCw className={cn(connectionState === "connecting" ? "animate-spin" : "")} size={16} />
            </button>
            <button
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <Bell size={16} />
              {stats.critical > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 mx-auto w-full max-w-[1600px] p-5 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="sm:hidden mb-6">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">{subtitle}</p>
              <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
            </div>
            {children}
          </motion.div>
        </div>
      </motion.main>

      {/* Command Palette Modal (Simplified placeholder for full functionality) */}
      <AnimatePresence>
        {cmdPaletteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setCmdPaletteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-zinc-800 p-4">
                <Search size={18} className="text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search incidents, settings, or integrations..."
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  autoFocus
                />
                <button
                  className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200"
                  onClick={() => setCmdPaletteOpen(false)}
                >
                  ESC
                </button>
              </div>
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-zinc-500">Quick Actions</p>
                <Link href="/incidents" onClick={() => setCmdPaletteOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                  <CircleAlert size={16} /> View latest incidents
                </Link>
                <Link href="/settings" onClick={() => setCmdPaletteOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                  <Settings size={16} /> Configure detection rules
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
