import type { IncidentPayload, StoredSettings } from "./types";

interface LogIncidentMessage {
  type: "VEIL_LOG_INCIDENT";
  payload: IncidentPayload;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#19e6c7" });
  chrome.action.setBadgeText({ text: "ON" });
});

chrome.runtime.onMessage.addListener(
  (
    message: LogIncidentMessage,
    _sender,
    sendResponse: (response: { ok: boolean; error?: string }) => void,
  ) => {
    if (message.type !== "VEIL_LOG_INCIDENT") return false;

    void insertIncident(message.payload)
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Incident logging failed";
        console.warn("[Veil] Supabase insert failed:", errorMessage);
        sendResponse({ ok: false, error: errorMessage });
      });

    return true;
  },
);

async function insertIncident(payload: IncidentPayload): Promise<void> {
  const stored = (await chrome.storage.local.get([
    "supabaseUrl",
    "supabaseAnonKey",
  ])) as StoredSettings;
  const url = (stored.supabaseUrl || __SUPABASE_URL__).replace(/\/$/, "");
  const anonKey = stored.supabaseAnonKey || __SUPABASE_ANON_KEY__;

  if (!anonKey) {
    throw new Error("Add the Supabase anon key in the Veil extension popup.");
  }

  const response = await fetch(`${url}/rest/v1/incidents`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase returned ${response.status}: ${details}`);
  }
}
