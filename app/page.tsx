"use client";

import { Shell } from "@/components/shell";
import { OverviewContent } from "@/components/overview-content";

export default function Home() {
  return (
    <Shell
      title="Security at a glance"
      subtitle="Perimeter telemetry"
    >
      <OverviewContent />
    </Shell>
  );
}
