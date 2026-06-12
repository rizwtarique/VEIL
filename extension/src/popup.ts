import type { StoredSettings } from "./types";

const form = document.querySelector<HTMLFormElement>("#settings-form");
const urlInput = document.querySelector<HTMLInputElement>("#supabase-url");
const keyInput = document.querySelector<HTMLInputElement>("#supabase-key");
const message = document.querySelector<HTMLParagraphElement>("#message");

void loadSettings();

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveSettings();
});

async function loadSettings() {
  const settings = (await chrome.storage.local.get([
    "supabaseUrl",
    "supabaseAnonKey",
  ])) as StoredSettings;

  if (urlInput) urlInput.value = settings.supabaseUrl || __SUPABASE_URL__;
  if (keyInput) keyInput.value = settings.supabaseAnonKey || __SUPABASE_ANON_KEY__;
}

async function saveSettings() {
  const supabaseUrl = urlInput?.value.trim() ?? "";
  const supabaseAnonKey = keyInput?.value.trim() ?? "";

  if (!supabaseUrl.startsWith("https://") || !supabaseAnonKey) {
    setMessage("Enter a valid URL and anon key.", true);
    return;
  }

  await chrome.storage.local.set({ supabaseUrl, supabaseAnonKey });
  setMessage("Connection saved. Veil is ready.", false);
}

function setMessage(text: string, isError: boolean) {
  if (!message) return;
  message.textContent = text;
  message.style.color = isError ? "#fb7185" : "#19e6c7";
}
