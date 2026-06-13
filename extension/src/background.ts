import { insertIncident } from "./supabase";
import type { IncidentPayload } from "./types";

interface LogIncidentMessage {
  type: "VEIL_LOG_INCIDENT";
  requestId: string;
  payload: IncidentPayload;
}

interface PipelineResponse {
  ok: boolean;
  requestId: string;
  incidentId?: string | number | null;
  error?: string;
}

console.log("[VEIL] Background worker loaded");

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#19e6c7" });
  chrome.action.setBadgeText({ text: "ON" });
});

chrome.runtime.onMessage.addListener(
  (
    message: LogIncidentMessage,
    sender,
    sendResponse: (response: PipelineResponse) => void,
  ) => {
    if (message?.type !== "VEIL_LOG_INCIDENT") return false;

    console.log("[VEIL] Message received", message);

    void insertIncident(message.payload)
      .then(({ id }) => {
        sendResponse({
          ok: true,
          requestId: message.requestId,
          incidentId: id,
        });
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Incident logging failed";
        console.error("[VEIL] Insert failed", errorMessage);
        sendResponse({
          ok: false,
          requestId: message.requestId,
          error: errorMessage,
        });
      });

    return true;
  },
);
