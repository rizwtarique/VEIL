export type Severity = "critical" | "high" | "medium" | "low";

export interface Incident {
  id: string | number;
  created_at: string;
  website: string;
  severity: Severity | string;
  risk_score: number;
  findings: string | string[] | Record<string, unknown> | null;
  prompt_preview: string | null;
}
