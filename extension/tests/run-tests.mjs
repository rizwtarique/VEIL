import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const extensionRoot = path.resolve(import.meta.dirname, "..");
const tempDir = await mkdtemp(path.join(os.tmpdir(), "veil-extension-"));
let passed = 0;

try {
  await testManifest();
  await testDetector();
  await testContentInterception();
  await testBackgroundLogging();
  console.log(`\n${passed} extension checks passed.`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

async function testManifest() {
  const manifest = JSON.parse(
    await readFile(path.join(extensionRoot, "manifest.json"), "utf8"),
  );
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.type, "module");
  assert.equal(manifest.background.service_worker, "background.js");
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.deepEqual(manifest.content_scripts[0].matches, [
    "https://chatgpt.com/*",
    "https://gemini.google.com/*",
    "https://claude.ai/*",
  ]);
  assert.ok(
    manifest.host_permissions.includes(
      "https://duijlqusviazcvixxgcy.supabase.co/*",
    ),
  );
  pass("Manifest V3 declares the service worker, supported sites, and minimal permissions");
}

async function testDetector() {
  const outfile = path.join(tempDir, "detector.mjs");
  await bundle("src/detector.ts", outfile);
  const { detectSensitiveData } = await importFresh(outfile);

  const cases = [
    {
      name: "AWS keys",
      text: "Use AKIAIOSFODNN7EXAMPLE for the deployment.",
      finding: "AWS Key",
      score: 90,
      severity: "critical",
    },
    {
      name: "emails",
      text: "Contact ada@example.com for access.",
      finding: "Email Address",
      score: 25,
      severity: "low",
    },
    {
      name: "passwords",
      text: "password=SuperSecret123!",
      finding: "Password",
      score: 75,
      severity: "critical",
    },
    {
      name: "phone numbers",
      text: "Call me at +1 415-555-2671.",
      finding: "Phone Number",
      score: 30,
      severity: "low",
    },
    {
      name: "API keys",
      text: "api_key=abcdefghijklmnopqrstuvwx",
      finding: "API Key",
      score: 80,
      severity: "critical",
    },
  ];

  for (const testCase of cases) {
    const result = detectSensitiveData(testCase.text);
    assert.equal(result.findings[0]?.type, testCase.finding, testCase.name);
    assert.equal(result.riskScore, testCase.score, `${testCase.name} score`);
    assert.equal(result.severity, testCase.severity, `${testCase.name} severity`);
    assert.match(result.sanitizedText, /\[REDACTED\]/, `${testCase.name} redaction`);
    assert.doesNotMatch(
      result.sanitizedText,
      new RegExp(escapeRegex(testCase.text.split(/(?:at |Use |Contact |password=|api_key=)/).at(-1).replace(/[.!]$/, ""))),
      `${testCase.name} secret removed`,
    );
    pass(`detects and sanitizes ${testCase.name}`);
  }

  const combined = detectSensitiveData(
    "Email ada@example.com and call 415-555-2671.",
  );
  assert.equal(combined.riskScore, 55);
  assert.equal(combined.severity, "medium");
  pass("combines findings into a medium risk score");

  const repeated = detectSensitiveData(
    "Email a@example.com, b@example.com, c@example.com, d@example.com.",
  );
  assert.equal(repeated.riskScore, 45);
  assert.equal(repeated.severity, "medium");
  pass("caps repeated-match bonus and applies severity thresholds");

  const internationalPhone = detectSensitiveData("Call +91 98765 43210.");
  assert.equal(internationalPhone.findings[0]?.type, "Phone Number");
  assert.equal(internationalPhone.riskScore, 30);
  pass("detects international phone number formats");

  const awsSecret = detectSensitiveData(
    "aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  );
  assert.equal(awsSecret.findings[0]?.type, "AWS Key");
  assert.doesNotMatch(awsSecret.sanitizedText, /wJalrXUtnFEMI/);
  pass("detects labeled AWS secret access keys");

  const clean = detectSensitiveData("Explain the principle of least privilege.");
  assert.equal(clean.riskScore, 0);
  assert.equal(clean.severity, "low");
  assert.equal(clean.findings.length, 0);
  pass("allows clean prompts with zero risk");
}

async function testContentInterception() {
  const outfile = path.join(tempDir, "content.mjs");
  await bundle("src/content.ts", outfile);

  const dom = new JSDOM(
    `<!doctype html><html><body>
      <form id="prompt-form">
        <textarea id="prompt-textarea"></textarea>
        <button data-testid="send-button" type="submit">Send</button>
      </form>
    </body></html>`,
    {
      pretendToBeVisual: true,
      url: "https://chatgpt.com/",
    },
  );
  installDomGlobals(dom.window);

  const loggedMessages = [];
  globalThis.chrome = {
    runtime: {
      sendMessage: async (message) => {
        loggedMessages.push(message);
        return { ok: true };
      },
    },
  };

  const editor = document.querySelector("#prompt-textarea");
  const form = document.querySelector("#prompt-form");
  const sendButton = document.querySelector("[data-testid='send-button']");
  Object.defineProperty(editor, "getBoundingClientRect", {
    value: () => ({ width: 500, height: 80 }),
  });
  Object.defineProperty(sendButton, "getBoundingClientRect", {
    value: () => ({ width: 40, height: 40 }),
  });
  let submitted = 0;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitted += 1;
  });

  await importFresh(outfile);
  editor.value = "Email ada@example.com and password=SuperSecret123!";
  editor.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    }),
  );
  await tick();

  const host = document.querySelector("#veil-warning-host");
  assert.ok(host, "warning modal host exists before submission");
  assert.equal(submitted, 0, "prompt was blocked");
  assert.match(host.shadowRoot.textContent, /Risk score/i);
  assert.match(host.shadowRoot.textContent, /Critical/i);
  assert.match(host.shadowRoot.textContent, /Password/i);
  assert.match(host.shadowRoot.textContent, /Email Address/i);
  pass("blocks submission and displays score, severity, and findings");

  host.shadowRoot.querySelector("[data-action='sanitize']").click();
  await tick();
  assert.equal(document.querySelector("#veil-warning-host"), null);
  assert.match(editor.value, /\[REDACTED\]/);
  assert.doesNotMatch(editor.value, /ada@example\.com|SuperSecret123/);
  assert.equal(submitted, 0);
  pass("Sanitize replaces sensitive values without submitting");

  assert.equal(loggedMessages.length, 1);
  assert.equal(loggedMessages[0].type, "VEIL_LOG_INCIDENT");
  assert.equal(loggedMessages[0].payload.website, "chatgpt.com");
  assert.doesNotMatch(
    loggedMessages[0].payload.prompt_preview,
    /ada@example\.com|SuperSecret123/,
  );
  pass("content script logs only a sanitized incident preview");

  editor.value = "api_key=abcdefghijklmnopqrstuvwx";
  editor.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    }),
  );
  await tick();
  const continueHost = document.querySelector("#veil-warning-host");
  continueHost.shadowRoot.querySelector("[data-action='continue']").click();
  await tick();
  assert.equal(submitted, 1);
  assert.equal(document.querySelector("#veil-warning-host"), null);
  pass("Continue permits the complete click and form submission chain");
}

async function testBackgroundLogging() {
  const outfile = path.join(tempDir, "background.mjs");
  await bundle("src/background.ts", outfile, {
    __SUPABASE_URL__: JSON.stringify("https://fallback.supabase.co"),
    __SUPABASE_ANON_KEY__: JSON.stringify("fallback-key"),
  });

  let messageListener;
  let fetchCall;
  globalThis.chrome = {
    action: {
      setBadgeBackgroundColor: () => {},
      setBadgeText: () => {},
    },
    runtime: {
      onInstalled: { addListener: () => {} },
      onMessage: {
        addListener: (listener) => {
          messageListener = listener;
        },
      },
    },
    storage: {
      local: {
        get: async () => ({
          supabaseUrl: "https://test.supabase.co",
          supabaseAnonKey: "test-anon-key",
        }),
      },
    },
  };
  globalThis.fetch = async (url, options) => {
    fetchCall = { url, options };
    return new Response(null, { status: 201 });
  };

  await importFresh(outfile);
  assert.equal(typeof messageListener, "function");

  const payload = {
    website: "chatgpt.com",
    severity: "critical",
    risk_score: 90,
    findings: ["AWS Key (1)"],
    prompt_preview: "Use [REDACTED]",
  };
  const response = await new Promise((resolve) => {
    const keepAlive = messageListener(
      { type: "VEIL_LOG_INCIDENT", payload },
      {},
      resolve,
    );
    assert.equal(keepAlive, true);
  });

  assert.deepEqual(response, { ok: true });
  assert.equal(fetchCall.url, "https://test.supabase.co/rest/v1/incidents");
  assert.equal(fetchCall.options.method, "POST");
  assert.equal(fetchCall.options.headers.apikey, "test-anon-key");
  assert.deepEqual(JSON.parse(fetchCall.options.body), payload);
  pass("background worker writes incidents to Supabase REST with anon auth");

  const distDir = path.join(extensionRoot, "dist");
  for (const file of [
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
  ]) {
    await access(path.join(distDir, file));
  }
  pass("build output contains every Chrome-loadable extension file");
}

async function bundle(entry, outfile, define = {}) {
  await build({
    entryPoints: [path.join(extensionRoot, entry)],
    bundle: true,
    define,
    format: "esm",
    outfile,
    platform: "browser",
    target: "chrome120",
  });
}

function installDomGlobals(window) {
  for (const name of [
    "document",
    "location",
    "Element",
    "HTMLElement",
    "HTMLTextAreaElement",
    "HTMLFormElement",
    "Event",
    "MouseEvent",
    "KeyboardEvent",
    "InputEvent",
    "SubmitEvent",
    "getComputedStyle",
  ]) {
    globalThis[name] = window[name];
  }
  globalThis.window = window;
}

async function importFresh(filename) {
  return import(`${pathToFileURL(filename).href}?v=${Date.now()}-${Math.random()}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function pass(message) {
  passed += 1;
  console.log(`PASS ${message}`);
}
