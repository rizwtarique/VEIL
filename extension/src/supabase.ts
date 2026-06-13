import type { IncidentPayload, StoredSettings } from "./types";

export interface SupabaseInsertResult {
  id: string | number | null;
}

export async function insertIncident(
  payload: IncidentPayload,
): Promise<SupabaseInsertResult> {
  validateIncidentPayload(payload);
  console.log("[VEIL] Supabase initialized");

  const stored = (await chrome.storage.local.get([
    "supabaseUrl",
    "supabaseAnonKey",
  ])) as StoredSettings;
  const url = (stored.supabaseUrl || __SUPABASE_URL__).replace(/\/$/, "");
  const anonKey = stored.supabaseAnonKey || __SUPABASE_ANON_KEY__;

  if (!url.startsWith("https://")) {
    throw new Error("Supabase URL is missing or invalid.");
  }

  if (!anonKey) {
    throw new Error("Add the Supabase anon key in the Veil extension popup.");
  }

  console.log("[VEIL] Inserting incident", payload);

  const response = await fetch(`${url}/rest/v1/incidents`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Supabase returned ${response.status}: ${responseText || response.statusText}`,
    );
  }

  const rows = responseText
    ? (JSON.parse(responseText) as Array<{ id?: string | number }>)
    : [];
  const id = rows[0]?.id ?? null;
  const data = rows[0] ?? payload;

  console.log("[VEIL] Insert success", data);

  return { id };
}

function validateIncidentPayload(payload: IncidentPayload): void {
  const validSeverities = new Set(["low", "medium", "critical"]);

  if (!payload.website?.trim()) {
    throw new Error("Incident payload website is required.");
  }

  if (!validSeverities.has(payload.severity)) {
    throw new Error(`Incident payload severity is invalid: ${payload.severity}`);
  }

  if (
    !Number.isInteger(payload.risk_score) ||
    payload.risk_score < 0 ||
    payload.risk_score > 100
  ) {
    throw new Error("Incident payload risk_score must be an integer from 0 to 100.");
  }

  if (
    !Array.isArray(payload.findings) ||
    !payload.findings.every((finding) => typeof finding === "string")
  ) {
    throw new Error("Incident payload findings must be a string array.");
  }

  if (
    payload.prompt_preview != null &&
    payload.prompt_preview.length > 240
  ) {
    throw new Error("Incident payload prompt_preview exceeds 240 characters.");
  }
}
