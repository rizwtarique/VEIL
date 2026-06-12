const editorSelectors = [
  "#prompt-textarea",
  "textarea[placeholder*='Message']",
  "textarea[placeholder*='Ask']",
  "div[contenteditable='true'][role='textbox']",
  "div.ProseMirror[contenteditable='true']",
  ".ql-editor[contenteditable='true']",
];

const submitSelectors = [
  "button[data-testid='send-button']",
  "button[aria-label*='Send message']",
  "button[aria-label='Send Message']",
  "button[aria-label^='Send']",
  "button[type='submit']",
];

export type PromptEditor = HTMLTextAreaElement | HTMLElement;

export function findPromptEditor(start?: EventTarget | null): PromptEditor | null {
  const element = start instanceof Element ? start : null;
  const direct = element?.closest<PromptEditor>(editorSelectors.join(","));
  if (direct) return direct;

  for (const selector of editorSelectors) {
    const candidate = document.querySelector<PromptEditor>(selector);
    if (candidate && isVisible(candidate)) return candidate;
  }

  return null;
}

export function findSubmitButton(start?: EventTarget | null): HTMLButtonElement | null {
  const element = start instanceof Element ? start : null;
  if (element) {
    const direct = element.closest<HTMLButtonElement>("button");
    return direct && submitSelectors.some((selector) => direct.matches(selector))
      ? direct
      : null;
  }

  for (const selector of submitSelectors) {
    const candidate = document.querySelector<HTMLButtonElement>(selector);
    if (candidate && isVisible(candidate) && !candidate.disabled) return candidate;
  }

  return null;
}

export function getEditorText(editor: PromptEditor): string {
  if (editor instanceof HTMLTextAreaElement) return editor.value.trim();
  return (editor.innerText || editor.textContent || "").trim();
}

export function setEditorText(editor: PromptEditor, text: string): void {
  if (editor instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    setter?.call(editor, text);
  } else {
    editor.focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, text);

    if ((editor.innerText || editor.textContent || "") !== text) {
      editor.textContent = text;
    }
  }

  editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
  editor.dispatchEvent(new Event("change", { bubbles: true }));
  editor.focus();
}

function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== "hidden" &&
    style.display !== "none"
  );
}
