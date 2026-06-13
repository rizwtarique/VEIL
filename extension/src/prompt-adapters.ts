const editorSelectors = [
  "#prompt-textarea",
  ".ProseMirror",
  "[contenteditable='true'][role='textbox']",
  "textarea[placeholder*='Message']",
  "textarea[placeholder*='Ask']",
  "textarea",
];

const submitSelectors = [
  "button[data-testid='send-button']",
  "button[aria-label*='Send message']",
  "button[aria-label='Send Message']",
  "button[aria-label^='Send']",
  "button[type='submit']",
  "[data-testid='send-button']",
];

export type PromptEditor = HTMLTextAreaElement | HTMLElement;

export function findPromptEditor(start?: EventTarget | null): PromptEditor | null {
  const element = start instanceof Element ? start : null;
  
  // 1. Try to find the closest editor from the starting element (e.g., during keydown)
  const direct = element?.closest<PromptEditor>(editorSelectors.join(","));
  if (direct && isVisible(direct)) return direct;

  // 2. Fallback to global search for the first visible editor
  for (const selector of editorSelectors) {
    const candidate = document.querySelector<PromptEditor>(selector);
    if (candidate && isVisible(candidate)) return candidate;
  }

  return null;
}

export function findSubmitButton(start?: EventTarget | null): HTMLButtonElement | HTMLElement | null {
  const element = start instanceof Element ? start : null;
  
  // 1. If start is a button or inside one, check if it matches
  if (element) {
    const direct = element.closest<HTMLElement>("button, [role='button'], [data-testid='send-button']");
    if (direct && submitSelectors.some((selector) => direct.matches(selector))) {
      return direct;
    }
  }

  // 2. Fallback to global search for the first visible, enabled button
  for (const selector of submitSelectors) {
    const candidate = document.querySelector<HTMLElement>(selector);
    if (candidate && isVisible(candidate)) {
      if ("disabled" in candidate && (candidate as HTMLButtonElement).disabled) continue;
      return candidate;
    }
  }

  return null;
}

export function getEditorText(editor: PromptEditor): string {
  if (editor instanceof HTMLTextAreaElement) {
    return editor.value.trim();
  }
  
  // For ProseMirror and other contenteditable editors
  // innerText is generally better than textContent for preserving line breaks as whitespace
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
    
    // Modern way to clear contenteditable while keeping internal state (mostly)
    try {
      document.execCommand("selectAll", false);
      document.execCommand("insertText", false, text);
    } catch {
      editor.textContent = text;
    }

    if (getEditorText(editor) !== text) {
      editor.textContent = text;
    }
  }

  // Trigger events to notify the site's framework (React/ProseMirror)
  editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
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
    style.display !== "none" &&
    style.opacity !== "0"
  );
}
