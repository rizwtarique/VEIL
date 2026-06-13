"use client";

import { Shell } from "@/components/shell";
import { Puzzle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const INTEGRATIONS = [
  { id: "chatgpt", name: "ChatGPT", type: "Web Extension", status: "active", lastSync: "2 mins ago" },
  { id: "claude", name: "Claude", type: "Web Extension", status: "active", lastSync: "5 mins ago" },
  { id: "gemini", name: "Gemini", type: "Web Extension", status: "inactive", lastSync: "Never" },
  { id: "custom_api", name: "Custom API Gateway", type: "Server Proxy", status: "inactive", lastSync: "Never" },
];

export default function IntegrationsPage() {
  const [testing, setTesting] = useState<string | null>(null);

  const testConnection = (id: string) => {
    setTesting(id);
    setTimeout(() => {
      setTesting(null);
      toast.success(`Connection to ${id} successful.`);
    }, 1500);
  };

  const handleAddIntegration = () => {
    toast.info("Add Integration wizard opening (mock).");
  };

  return (
    <Shell title="Integrations" subtitle="External surfaces">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="panel p-6 flex flex-col justify-between h-56"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lg text-zinc-300">
                  {integration.name.charAt(0)}
                </div>
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5",
                  integration.status === "active" ? "bg-primary/10 text-primary border border-primary/20" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                )}>
                  {integration.status === "active" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {integration.status}
                </div>
              </div>
              <h3 className="text-base font-semibold text-zinc-100">{integration.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{integration.type}</p>
            </div>
            
            <div className="pt-4 border-t border-zinc-800/60 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock size={12} />
                <span>Sync: {integration.lastSync}</span>
              </div>
              <button
                onClick={() => testConnection(integration.id)}
                disabled={testing !== null}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded transition-colors",
                  testing === integration.id 
                    ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                )}
              >
                {testing === integration.id ? "Testing..." : "Test Connection"}
              </button>
            </div>
          </motion.div>
        ))}

        <motion.div
          onClick={handleAddIntegration}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: INTEGRATIONS.length * 0.1 }}
          className="panel p-6 flex flex-col items-center justify-center h-56 border-dashed border-zinc-700 bg-transparent hover:bg-zinc-900/30 transition-colors cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-3">
            <Puzzle size={20} />
          </div>
          <p className="text-sm font-medium text-zinc-300">Add Integration</p>
          <p className="text-xs text-zinc-500 mt-1 text-center">Connect a new LLM provider or API gateway.</p>
        </motion.div>
      </div>
    </Shell>
  );
}

