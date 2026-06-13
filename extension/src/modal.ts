import type { DetectionResult, ModalAction } from "./types";

const severityColor = {
  low: "#19e6c7",
  medium: "#f7c948",
  critical: "#fb7185",
};

export function showWarningModal(
  result: DetectionResult,
): Promise<ModalAction> {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    host.id = "veil-warning-host";
    host.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;display:block;";
    const root = host.attachShadow({ mode: "open" });
    const color = severityColor[result.severity];

    root.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        .backdrop {
          position: fixed; inset: 0; display: grid; place-items: center; padding: 20px;
          background: rgba(2, 5, 9, .78); backdrop-filter: blur(8px);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
          color: #edf8f6;
        }
        .modal {
          position: relative; width: min(520px, 100%); overflow: hidden;
          border: 1px solid rgba(148, 169, 181, .18); border-radius: 18px;
          background: linear-gradient(145deg, #0c141f, #070c13);
          box-shadow: 0 32px 100px rgba(0,0,0,.6), 0 0 60px ${color}12;
        }
        .scan { position: absolute; inset: 0 0 auto; height: 1px; background: linear-gradient(90deg, transparent, ${color}, transparent); }
        .body { padding: 26px; }
        .top { display: flex; gap: 16px; align-items: center; }
        .shield {
          display: grid; width: 48px; height: 48px; flex: 0 0 auto; place-items: center;
          border: 1px solid ${color}40; border-radius: 14px; background: ${color}12;
          color: ${color}; font-size: 23px;
        }
        .eyebrow { margin: 0 0 6px; color: ${color}; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
        h2 { margin: 0; font-size: 21px; font-weight: 650; }
        .summary {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 22px 0;
        }
        .metric { border: 1px solid #1a2632; border-radius: 11px; background: #090f17; padding: 14px; }
        .label { color: #607080; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; }
        .value { margin-top: 6px; color: ${color}; font: 600 24px ui-monospace, SFMono-Regular, monospace; }
        .severity { font-size: 16px; text-transform: uppercase; }
        .findings { margin: 0; padding: 0; list-style: none; border: 1px solid #17222d; border-radius: 11px; overflow: hidden; }
        .findings li { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid #141f29; color: #b8c6cf; font-size: 12px; }
        .findings li:last-child { border-bottom: 0; }
        .finding-dot { display: inline-block; width: 6px; height: 6px; margin-right: 9px; border-radius: 50%; background: ${color}; box-shadow: 0 0 8px ${color}; }
        .count { color: #647484; font: 11px ui-monospace, SFMono-Regular, monospace; }
        .note { margin: 16px 0 0; color: #637282; font-size: 11px; line-height: 1.55; }
        .actions { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 10px; border-top: 1px solid #17212b; background: #070b11; padding: 16px 26px 20px; }
        button { border-radius: 9px; padding: 11px 12px; cursor: pointer; font: 700 11px Inter, ui-sans-serif, system-ui; letter-spacing: .06em; }
        .cancel { border: 1px solid #24313d; background: transparent; color: #8998a5; }
        .continue { border: 1px solid #3a2b31; background: #191014; color: #f49aaa; }
        .sanitize { border: 0; background: #19e6c7; color: #03110e; }
        button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
      </style>
      <div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="veil-title">
        <section class="modal">
          <div class="scan"></div>
          <div class="body">
            <div class="top">
              <div class="shield">V</div>
              <div>
                <p class="eyebrow">Sensitive data detected</p>
                <h2 id="veil-title">Veil blocked this prompt</h2>
              </div>
            </div>
            <div class="summary">
              <div class="metric"><div class="label">Risk score</div><div class="value">${result.riskScore}<span style="font-size:12px;color:#5d6c79"> / 100</span></div></div>
              <div class="metric"><div class="label">Severity</div><div class="value severity">${result.severity}</div></div>
            </div>
            <ul class="findings">
              ${result.findings
                .map(
                  (finding) =>
                    `<li><span><span class="finding-dot"></span>${finding.type}</span><span class="count">${finding.count} match${finding.count === 1 ? "" : "es"}</span></li>`,
                )
                .join("")}
            </ul>
            <p class="note">Sanitize replaces every detected secret with [REDACTED]. Your original prompt is not uploaded by Veil.</p>
          </div>
          <div class="actions">
            <button class="cancel" data-action="cancel">CANCEL</button>
            <button class="continue" data-action="continue">CONTINUE</button>
            <button class="sanitize" data-action="sanitize">SANITIZE</button>
          </div>
        </section>
      </div>
    `;

    const finish = (action: ModalAction) => {
      console.log(`[VEIL] ${action.charAt(0).toUpperCase() + action.slice(1)} Clicked`);
      document.removeEventListener("keydown", handleEscape, true);
      host.remove();
      console.log("[VEIL] Modal Closed");
      resolve(action);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish("cancel");
    };

    const buttons = root.querySelectorAll<HTMLButtonElement>("button[data-action]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        finish(button.dataset.action as ModalAction);
      });
    });
    console.log("[VEIL] Modal Opened", "Buttons attached:", buttons.length);
    root.querySelector<HTMLButtonElement>(".sanitize")?.focus();
    document.addEventListener("keydown", handleEscape, true);
    document.documentElement.append(host);
  });
}
