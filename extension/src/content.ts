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

let modalOpen = false;
let bypassUntil = 0;

document.addEventListener("keydown", handleKeydown, true);
document.addEventListener("click", handleClick, true);
document.addEventListener("submit", handleSubmit, true);

console.log("VEIL CONTENT SCRIPT LOADED");

function handleKeydown(event: KeyboardEvent) {
  if (
    event.key !== "Enter" ||
    event.shiftKey ||
    event.isComposing
  ) {
    return;
  }

  const editor = findPromptEditor(event.target);
  if (!editor) return;

  intercept(event, editor, () => {
    const button = findSubmitButton();
    if (button) button.click();
  });
}

function handleClick(event: MouseEvent) {
  const button = findSubmitButton(event.target);
  if (!button) return;

  const editor = findPromptEditor(event.target);
  if (!editor) return;

  intercept(event, editor, () => button.click());
}

function handleSubmit(event: SubmitEvent) {
  const editor = findPromptEditor(event.target);
  if (!editor) return;

  const form = event.target instanceof HTMLFormElement ? event.target : null;
  intercept(event, editor, () => form?.requestSubmit());
}

function intercept(
  event: Event,
  editor: PromptEditor,
  continueSubmission: () => void,
) {
  if (Date.now() < bypassUntil) return;

  if (modalOpen) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  const prompt = getEditorText(editor);
  if (!prompt) return;

  const result = detectSensitiveData(prompt);
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
  void logIncident(result);
  const action = await showWarningModal(result);

  if (action === "sanitize") {
    setEditorText(editor, result.sanitizedText);
    return;
  }

  if (action === "continue") {
    bypassUntil = Date.now() + 750;
    continueSubmission();
    window.setTimeout(() => {
      bypassUntil = 0;
    }, 750);
  }
}

async function logIncident(result: DetectionResult) {
  const payload: IncidentPayload = {
    website: location.hostname,
    severity: result.severity,
    risk_score: result.riskScore,
    findings: result.findings.map(
      (finding) => `${finding.type} (${finding.count})`,
    ),
    prompt_preview: result.sanitizedText.slice(0, 240),
  };

  try {
    await chrome.runtime.sendMessage({
      type: "VEIL_LOG_INCIDENT",
      payload,
    });
  } catch (error) {
    console.warn("[Veil] Incident could not be logged.", error);
  }
}
