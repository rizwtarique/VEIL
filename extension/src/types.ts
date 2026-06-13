export type FindingType =
  | "AWS Key"
  | "OpenAI Key"
  | "Anthropic Key"
  | "GitHub Token"
  | "Google API Key"
  | "Azure Secret"
  | "JWT Token"
  | "Private Key"
  | "SSH Key"
  | "Database URI"
  | "Supabase Key"
  | "IP Address"
  | "Internal URL"
  | "Email Address"
  | "Password"
  | "Phone Number"
  | "Credit Card"
  | "Generic API Key";

export type Severity = "low" | "medium" | "critical";

export interface Finding {
  type: FindingType;
  count: number;
  weight: number;
  confidence?: "low" | "medium" | "high";
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
  prompt_preview?: string | null;
}

export type ModalAction = "cancel" | "continue" | "sanitize";

export interface StoredSettings {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
