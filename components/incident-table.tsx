"use client";

import { useState, useMemo } from "react";
import type { Incident } from "@/types/incident";
import { format } from "date-fns";
import { Search, Download, Filter, ChevronDown, ChevronUp, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface IncidentTableProps {
  incidents: Incident[];
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Incident>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = incidents;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.website.toLowerCase().includes(q) ||
          (i.prompt_preview && i.prompt_preview.toLowerCase().includes(q))
      );
    }

    if (severityFilter !== "all") {
      result = result.filter((i) => i.severity.toLowerCase() === severityFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField] ?? "";
      let bVal = b[sortField] ?? "";
      
      if (sortField === "created_at") {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [incidents, search, severityFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Incident) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSeverityBadge = (severity: string) => {
    const s = severity.toLowerCase();
    const colors: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      low: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded border text-[10px] uppercase tracking-widest font-semibold", colors[s] || colors.low)}>
        {severity}
      </span>
    );
  };

  const exportCSV = () => {
    const headers = ["ID", "Date", "Platform", "Severity", "Risk Score", "Findings"];
    const rows = filteredAndSorted.map(i => [
      i.id,
      new Date(i.created_at).toISOString(),
      i.website,
      i.severity,
      i.risk_score,
      JSON.stringify(i.findings)
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veil-incidents-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 panel p-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search platform or prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-zinc-500" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-2 rounded-lg text-sm transition-colors border border-zinc-700"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800/60">
            <tr>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort("created_at")}>
                <div className="flex items-center gap-1">Time {sortField === "created_at" && (sortDirection === "asc" ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort("website")}>
                <div className="flex items-center gap-1">Platform {sortField === "website" && (sortDirection === "asc" ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort("severity")}>
                <div className="flex items-center gap-1">Severity {sortField === "severity" && (sortDirection === "asc" ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-300 transition-colors" onClick={() => handleSort("risk_score")}>
                <div className="flex items-center gap-1">Risk {sortField === "risk_score" && (sortDirection === "asc" ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
              </th>
              <th className="px-6 py-4 font-medium">Preview</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredAndSorted.map((incident) => (
              <tr key={incident.id} className="hover:bg-zinc-800/20 transition-colors group cursor-pointer" onClick={() => setSelectedIncident(incident)}>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-300 font-mono text-xs">
                  {format(new Date(incident.created_at), "MMM d, HH:mm:ss")}
                </td>
                <td className="px-6 py-4 font-medium text-zinc-200">
                  {incident.website}
                </td>
                <td className="px-6 py-4">
                  {getSeverityBadge(incident.severity)}
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-zinc-300">{incident.risk_score}</span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-zinc-500">
                  {incident.prompt_preview || "No preview"}
                </td>
                <td className="px-6 py-4 text-right">
                  <ArrowRight size={16} className="inline-block text-zinc-600 group-hover:text-primary transition-colors" />
                </td>
              </tr>
            ))}
            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No incidents match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedIncident && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-zinc-800/60 bg-ink/95 backdrop-blur-xl shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-zinc-100">Incident Details</h3>
                <button onClick={() => setSelectedIncident(null)} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-100 text-lg">
                    {selectedIncident.website.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-100">{selectedIncident.website}</h4>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{format(new Date(selectedIncident.created_at), "PPpp")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="panel p-4 bg-zinc-900/30 border-zinc-800/40">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Severity</p>
                    {getSeverityBadge(selectedIncident.severity)}
                  </div>
                  <div className="panel p-4 bg-zinc-900/30 border-zinc-800/40">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Risk Score</p>
                    <span className="text-2xl font-mono text-zinc-100">{selectedIncident.risk_score}</span><span className="text-zinc-500 text-sm">/100</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Detected Findings</h4>
                  <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-4 font-mono text-xs text-zinc-300">
                    {typeof selectedIncident.findings === 'string' 
                      ? selectedIncident.findings 
                      : JSON.stringify(selectedIncident.findings, null, 2)}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Prompt Preview</h4>
                  <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedIncident.prompt_preview || "No preview available for this incident."}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
