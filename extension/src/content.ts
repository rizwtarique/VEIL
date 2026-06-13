import { detectSensitiveData } from "./detector";
import { showWarningModal } from "./modal";
import {
  findPromptEditor,
  findSubmitButton,
  getEditorText,
  setEditorText,
  type PromptEditor,
} from "./prompt-adapters";
import type { DetectionResult, IncidentPayload } from "./types";

declare global {
  interface Window {
    testVeilPipeline: () => Promise<PipelineResponse>;
    testVeilInsert: () => Promise<PipelineResponse>;
  }
}

interface PipelineResponse {
  ok: boolean;
  requestId: string;
  incidentId?: string | number | null;
  error?: string;
}

let modalOpen = false;
let bypassUntil = 0;
let cachedEditor: PromptEditor | null = null;

// Clean up any potential existing listeners in dev environments
document.removeEventListener("keydown", handleKeydown, true);
document.removeEventListener("click", handleClick, true);
document.removeEventListener("submit", handleSubmit, true);

document.addEventListener("keydown", handleKeydown, true);
document.addEventListener("click", handleClick, true);
document.addEventListener("submit", handleSubmit, true);

console.log("[VEIL] Content script loaded");
console.log("[VEIL] Context Check");
console.log("runtime id:", chrome?.runtime?.id);

// MutationObserver for robust SPA support
const observer = new MutationObserver((mutations) => {
  if (cachedEditor && document.contains(cachedEditor)) {
    return;
  }
  
  // Throttle editor searches to avoid performance hits
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      const editor = findPromptEditor();
      if (editor && editor !== cachedEditor) {
        cachedEditor = editor;
        console.log("[VEIL] Editor detected via MutationObserver");
      }
      break;
    }
  }
});

// Defensive check for body availability at document_start
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  const bodyObserver = new MutationObserver(() => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      bodyObserver.disconnect();
    }
  });
  bodyObserver.observe(document.documentElement, { childList: true });
}

// Cleanup on unload to prevent memory leaks
window.addEventListener("unload", () => {
  observer.disconnect();
});

function handleKeydown(event: KeyboardEvent) {
  if (
    event.key !== "Enter" ||
    event.shiftKey ||
    event.isComposing
  ) {
    return;
  }

  const editor = findPromptEditor(event.target) || cachedEditor;
  if (!editor || !editor.contains(event.target as Node)) return;
  console.log("[VEIL] editor found");

  intercept(event, editor, () => {
    const button = findSubmitButton();
    if (button) button.click();
  });
}

function handleClick(event: MouseEvent) {
  const button = findSubmitButton(event.target);
  if (!button) return;

  const editor = findPromptEditor(event.target) || cachedEditor;
  if (!editor) return;

  intercept(event, editor, () => button.click());
}

function handleSubmit(event: SubmitEvent) {
  const editor = findPromptEditor(event.target) || cachedEditor;
  if (!editor) return;

  const form = event.target instanceof HTMLFormElement ? event.target : null;
  intercept(event, editor, () => form?.requestSubmit());
}

function intercept(
  event: Event,
  editor: PromptEditor,
  continueSubmission: () => void,
) {
  // Ignore events originating from our own modal
  const target = event.target as Node;
  if (target instanceof Element && target.closest("#veil-warning-host")) {
    return;
  }

  if (Date.now() < bypassUntil) return;

  if (modalOpen) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  const text = getEditorText(editor);
  console.log("[VEIL] text:", text);
  if (!text) return;

  const result = detectSensitiveData(text);
  console.log("[VEIL] findings:", result.findings);
  if (result.findings.length === 0) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  modalOpen = true;

  void handleDetection(editor, result, continueSubmission).finally(() => {
    modalOpen = false;
  });
}

async function handleDetection(
  editor: PromptEditor,
  result: DetectionResult,
  continueSubmission: () => void,
) {
  const action = await showWarningModal(result);

  if (action === "sanitize") {
    setEditorText(editor, result.sanitizedText);
    void logIncident(result);
    return;
  }

  if (action === "continue") {
    bypassUntil = Date.now() + 750;
    void logIncident(result);
    continueSubmission();
    window.setTimeout(() => {
      bypassUntil = 0;
    }, 750);
  }
}

async function logIncident(
  result: DetectionResult,
): Promise<PipelineResponse> {
  console.log("[VEIL] Preparing incident");
  const payload: IncidentPayload = {
    website: location.hostname,
    severity: result.severity,
    risk_score: result.riskScore,
    findings: result.findings.map(
      (finding) => `${finding.type} (${finding.count})`,
    ),
    prompt_preview: result.sanitizedText.slice(0, 240),
  };

  return sendIncident(payload);
}

window.testVeilInsert = async () => {
  console.log("[VEIL] Diagnostic pipeline test started");
  const response = await sendIncident({
    website: "test.local",
    severity: "low",
    risk_score: 1,
    findings: ["manual-test"],
    prompt_preview: "manual-test",
  });
  console.log("[VEIL] Diagnostic pipeline test finished", response);
  return response;
};

async function sendIncident(
  payload: IncidentPayload,
): Promise<PipelineResponse> {
  const runtimeId = getRuntimeId();
  const requestId = crypto.randomUUID();

  if (
    typeof chrome === "undefined" ||
    !chrome.runtime ||
    !runtimeId ||
    typeof chrome.runtime.sendMessage !== "function"
  ) {
    const error = "Chrome runtime unavailable or extension context invalidated. Reload this tab after reloading the extension.";
    console.error("[VEIL] Content pipeline stopped", { requestId, error });
    return { ok: false, requestId, error };
  }

  console.log("[VEIL] Sending message", payload);

  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        {
          type: "VEIL_LOG_INCIDENT",
          requestId,
          payload,
        },
        (response: PipelineResponse | undefined) => {
          const runtimeError = chrome.runtime.lastError;

          if (runtimeError) {
            const error = runtimeError.message;
            console.error("[VEIL] Background messaging failed", {
              requestId,
              error,
            });
            resolve({ ok: false, requestId, error });
            return;
          }

          if (!response) {
            const error = "Background returned no response.";
            console.error("[VEIL] Background response missing", {
              requestId,
              error,
            });
            resolve({ ok: false, requestId, error });
            return;
          }

          resolve(response);
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown runtime error";
      console.error("[VEIL] sendMessage threw", {
        requestId,
        error: errorMessage,
      });
      resolve({ ok: false, requestId, error: errorMessage });
    }
  });
}

function getRuntimeId(): string | null {
  try {
    return typeof chrome !== "undefined" && chrome.runtime?.id
      ? chrome.runtime.id
      : null;
  } catch {
    return null;
  }
}
