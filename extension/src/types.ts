export type FindingType =
  | "AWS Key"
  | "Email Address"
  | "Password"
  | "Phone Number"
  | "API Key";

export type Severity = "low" | "medium" | "critical";

export interface Finding {
  type: FindingType;
  count: number;
  weight: number;
}

export interface DetectionResult {
  findings: Finding[];
  riskScore: number;
  sanitizedText: string;
  severity: Severity;
}

export interface IncidentPayload {
  website: string;
  severity: Severity;
  risk_score: number;
  findings: string[];
  prompt_preview: string;
}

export type ModalAction = "cancel" | "continue" | "sanitize";

export interface StoredSettings {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
