"use client";

import { Shell } from "@/components/shell";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, ShieldAlert, SlidersHorizontal, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "detection", label: "Detection Rules", icon: ShieldAlert },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Access & Security", icon: Lock },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [blockMode, setBlockMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <Shell title="Settings" subtitle="Workspace Configuration">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap lg:whitespace-normal",
                    active ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  <tab.icon size={16} className={active ? "text-primary" : "text-zinc-500"} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 max-w-3xl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === "general" && (
              <div className="panel p-6">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Workspace Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Workspace Name</label>
                    <input type="text" defaultValue="Global Tech Inc." className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Retention Period</label>
                    <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary">
                      <option>30 Days</option>
                      <option>90 Days</option>
                      <option>1 Year</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t border-zinc-800">
                    <button className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "detection" && (
              <div className="panel p-6 space-y-6">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Detection Engine</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Strict Blocking Mode</p>
                    <p className="text-xs text-zinc-500 mt-1">Automatically redact high-severity secrets before they leave the browser.</p>
                  </div>
                  <button 
                    onClick={() => setBlockMode(!blockMode)}
                    className={cn("w-10 h-6 rounded-full transition-colors relative", blockMode ? "bg-primary" : "bg-zinc-700")}
                  >
                    <span className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", blockMode ? "translate-x-4" : "translate-x-0")} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="panel p-6 space-y-6">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Alert Preferences</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Email Alerts (Critical Only)</p>
                    <p className="text-xs text-zinc-500 mt-1">Send immediate alerts to security admins for score {'>'} 90.</p>
                  </div>
                  <button 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={cn("w-10 h-6 rounded-full transition-colors relative", emailAlerts ? "bg-primary" : "bg-zinc-700")}
                  >
                    <span className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", emailAlerts ? "translate-x-4" : "translate-x-0")} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="panel p-6">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">API Keys & Access</h3>
                <p className="text-sm text-zinc-400 mb-4">Manage your Supabase configuration and extension endpoints here.</p>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                  <p className="text-xs text-zinc-500 font-mono break-all">Configured via environment variables.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}
