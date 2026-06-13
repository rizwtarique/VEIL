import type { DetectionResult, Finding, FindingType, Severity } from "./types";

interface DetectionRule {
  type: FindingType;
  weight: number;
  pattern: RegExp;
  confidence: "low" | "medium" | "high";
  replace: string | ((substring: string, ...args: string[]) => string);
}

const rules: DetectionRule[] = [
  {
    type: "Private Key",
    weight: 100,
    confidence: "high",
    pattern: /-----BEGIN(?:[A-Z\s]+)?PRIVATE KEY-----[\s\S]+?-----END(?:[A-Z\s]+)?PRIVATE KEY-----/gi,
    replace: "[REDACTED PRIVATE KEY]",
  },
  {
    type: "JWT Token",
    weight: 80,
    confidence: "high",
    pattern: /\beyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\b/g,
    replace: "[REDACTED JWT]",
  },
  {
    type: "OpenAI Key",
    weight: 90,
    confidence: "high",
    pattern: /\b(?:sk-[A-Za-z0-9]{48}|sk-proj-[A-Za-z0-9-_]{48,})\b/g,
    replace: "[REDACTED OPENAI KEY]",
  },
  {
    type: "Anthropic Key",
    weight: 90,
    confidence: "high",
    pattern: /\bsk-ant-api[0-9]{2}-[A-Za-z0-9-_]{80,}\b/g,
    replace: "[REDACTED ANTHROPIC KEY]",
  },
  {
    type: "Database URI",
    weight: 95,
    confidence: "high",
    pattern: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\/\s]+:[^@\/\s]+@[^:\/\s]+(?::\d+)?\/(?:[a-zA-Z0-9_.-]+)?\b/gi,
    replace: "[REDACTED DATABASE URI]",
  },
  {
    type: "Supabase Key",
    weight: 85,
    confidence: "medium",
    pattern: /\b(?:supabase_key|sbp_[A-Za-z0-9]{40,})\b/gi,
    replace: "[REDACTED SUPABASE KEY]",
  },
  {
    type: "SSH Key",
    weight: 100,
    confidence: "high",
    pattern: /\bssh-(?:rsa|ed25519|dss)\s+AAAA[0-9A-Za-z+/]+[=]{0,3}(?:\s+[a-zA-Z0-9.-]+)?\b/g,
    replace: "[REDACTED SSH KEY]",
  },
  {
    type: "IP Address",
    weight: 15,
    confidence: "low",
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    replace: "[REDACTED IP]",
  },
  {
    type: "Internal URL",
    weight: 20,
    confidence: "medium",
    pattern: /\bhttps?:\/\/[a-zA-Z0-9.-]+\.(?:internal|local|corp|vpc|dev|test|stage|staging)\b/gi,
    replace: "[REDACTED INTERNAL URL]",
  },
  {
    type: "GitHub Token",
    weight: 90,
    confidence: "high",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b/g,
    replace: "[REDACTED GITHUB TOKEN]",
  },
  {
    type: "Google API Key",
    weight: 80,
    confidence: "high",
    pattern: /\bAIza[0-9A-Za-z\\-_]{35}\b/g,
    replace: "[REDACTED GOOGLE API KEY]",
  },
  {
    type: "AWS Key",
    weight: 90,
    confidence: "high",
    pattern: /\b(?:(?:AKIA|ASIA|AIDA|AROA|AIPA|ANPA|ANVA)[A-Z0-9]{12,40}|(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*["']?[A-Za-z0-9/+]{40}["']?)/gi,
    replace: "[REDACTED AWS KEY]",
  },
  {
    type: "Azure Secret",
    weight: 85,
    confidence: "medium",
    pattern: /(?:azure|az)[_\-\s]?(?:secret|key)\s*[:=]\s*["']?([A-Za-z0-9+/=]{30,})["']?/gi,
    replace: (_match, group) => _match.replace(group, "[REDACTED AZURE SECRET]"),
  },
  {
    type: "Generic API Key",
    weight: 75,
    confidence: "medium",
    pattern: /\b(?:api[_-]?key|token|bearer|secret)\s*[:=]\s*["']?([A-Za-z0-9._-]{16,})["']?/gi,
    replace: (_match, group) => _match.replace(group, "[REDACTED API KEY]"),
  },
  {
    type: "Credit Card",
    weight: 95,
    confidence: "high",
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    replace: "[REDACTED CREDIT CARD]",
  },
  {
    type: "Password",
    weight: 75,
    confidence: "medium",
    pattern: /\b(password|passwd|pwd)\s*[:=]\s*["']?([^\s"',;]{6,})["']?/gi,
    replace: (_match, label: string) => `${label}: [REDACTED PASSWORD]`,
  },
  {
    type: "Email Address",
    weight: 25,
    confidence: "high",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replace: "[REDACTED EMAIL]",
  },
  {
    type: "Phone Number",
    weight: 30,
    confidence: "low",
    pattern: /(?<!\d)(?:\+\d{1,3}[-.\s]?)?(?:\d{5}[-.\s]?\d{5}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})(?!\d)/g,
    replace: "[REDACTED PHONE]",
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
    let matchCount = 0;
    
    sanitizedText = sanitizedText.replace(rule.pattern, (substring, ...args) => {
      matchCount++;
      if (typeof rule.replace === 'function') {
        return rule.replace(substring, ...args);
      }
      return rule.replace;
    });

    if (matchCount === 0) continue;

    findings.push({
      type: rule.type,
      count: matchCount,
      weight: rule.weight,
      confidence: rule.confidence,
    });
    riskScore += rule.weight + Math.min((matchCount - 1) * 10, 20);
  }

  riskScore = Math.min(riskScore, 100);

  return {
    findings,
    riskScore,
    sanitizedText,
    severity: getSeverity(riskScore),
  };
}
