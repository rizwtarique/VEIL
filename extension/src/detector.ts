import type { DetectionResult, Finding, FindingType, Severity } from "./types";

interface DetectionRule {
  type: FindingType;
  weight: number;
  pattern: RegExp;
  replace: string | ((substring: string, ...args: string[]) => string);
}

const rules: DetectionRule[] = [
  {
    type: "AWS Key",
    weight: 90,
    pattern:
      /\b(?:(?:AKIA|ASIA|AIDA|AROA|AIPA|ANPA|ANVA)[A-Z0-9]{16}|(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*["']?[A-Za-z0-9/+]{40}["']?)/gi,
    replace: "[REDACTED]",
  },
  {
    type: "Password",
    weight: 75,
    pattern:
      /\b(password|passwd|pwd)\s*[:=]\s*["']?([^\s"',;]{6,})["']?/gi,
    replace: (_match, label: string) => `${label}: [REDACTED]`,
  },
  {
    type: "API Key",
    weight: 80,
    pattern:
      /\b(?:sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{30,}|(?:api[_-]?key|token|bearer)\s*[:=]\s*["']?[A-Za-z0-9._-]{16,}["']?)/gi,
    replace: "[REDACTED]",
  },
  {
    type: "Email Address",
    weight: 25,
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replace: "[REDACTED]",
  },
  {
    type: "Phone Number",
    weight: 30,
    pattern:
      /(?<!\d)(?:\+\d{1,3}[-.\s]?)?(?:\d{5}[-.\s]?\d{5}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})(?!\d)/g,
    replace: "[REDACTED]",
  },
];

function getSeverity(score: number): Severity {
  if (score >= 71) return "critical";
  if (score >= 31) return "medium";
  return "low";
}

export function detectSensitiveData(text: string): DetectionResult {
  const findings: Finding[] = [];
  let riskScore = 0;
  let sanitizedText = text;

  for (const rule of rules) {
    const matches = Array.from(text.matchAll(rule.pattern));
    if (matches.length === 0) continue;

    findings.push({
      type: rule.type,
      count: matches.length,
      weight: rule.weight,
    });
    riskScore += rule.weight + Math.min((matches.length - 1) * 10, 20);
    sanitizedText = sanitizedText.replace(rule.pattern, rule.replace as never);
  }

  riskScore = Math.min(riskScore, 100);

  return {
    findings,
    riskScore,
    sanitizedText,
    severity: getSeverity(riskScore),
  };
}
