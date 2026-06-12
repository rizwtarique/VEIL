"use client";

import { Shell } from "@/components/shell";
import { IncidentTable } from "@/components/incident-table";
import { useIncidents } from "@/hooks/use-incidents";
import { TriangleAlert } from "lucide-react";

export default function IncidentsPage() {
  const { incidents, error } = useIncidents();

  return (
    <Shell
      title="Incident Log"
      subtitle="Full audit trail"
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
          <TriangleAlert className="mt-0.5 shrink-0" size={15} />
          <span>{error}</span>
        </div>
      )}
      <IncidentTable incidents={incidents} />
    </Shell>
  );
}
