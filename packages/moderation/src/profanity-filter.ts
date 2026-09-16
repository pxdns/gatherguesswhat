export type FilterLevel = "off" | "low" | "medium" | "strict";
export type FilterAction = "allow" | "mask" | "warn" | "block";

interface WordEntry {
  word: string;
  severity: Exclude<FilterLevel, "off">;
}

// Word list kept intentionally small/generic here; extend via ops without redeploying logic.
const WORD_LIST: WordEntry[] = [
  { word: "damn", severity: "low" },
  { word: "hell", severity: "low" },
  { word: "crap", severity: "low" },
  { word: "ass", severity: "medium" },
  { word: "bitch", severity: "medium" },
  { word: "bastard", severity: "medium" },
  { word: "shit", severity: "medium" },
  { word: "fuck", severity: "strict" },
  { word: "nigger", severity: "strict" },
  { word: "faggot", severity: "strict" },
  { word: "retard", severity: "strict" },
];

const LEVEL_ORDER: Record<FilterLevel, number> = {
  off: 0,
  low: 1,
  medium: 2,
  strict: 3,
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPattern(level: FilterLevel): RegExp | null {
  if (level === "off") return null;
  const active = WORD_LIST.filter((w) => LEVEL_ORDER[w.severity] <= LEVEL_ORDER[level]);
  if (active.length === 0) return null;
  // Word boundaries prevent flagging substrings inside unrelated words (e.g. "classic" vs "ass").
  const pattern = active.map((w) => `\\b${escapeRegExp(w.word)}\\b`).join("|");
  return new RegExp(pattern, "gi");
}

export interface FilterResult {
  content: string;
  matched: string[];
  blocked: boolean;
}

export function filterMessage(
  content: string,
  level: FilterLevel,
  action: FilterAction = "mask"
): FilterResult {
  if (level === "off" || action === "allow") {
    return { content, matched: [], blocked: false };
  }

  const pattern = buildPattern(level);
  if (!pattern) {
    return { content, matched: [], blocked: false };
  }

  const matched: string[] = [];
  const hasMatch = pattern.test(content);
  pattern.lastIndex = 0;

  if (!hasMatch) {
    return { content, matched: [], blocked: false };
  }

  if (action === "block") {
    content.replace(pattern, (m) => {
      matched.push(m);
      return m;
    });
    return { content, matched, blocked: true };
  }

  // mask (default) and warn both return masked content; warn additionally flags matches for UI banner.
  const masked = content.replace(pattern, (m) => {
    matched.push(m);
    return m[0] + "*".repeat(Math.max(m.length - 1, 1));
  });

  return { content: masked, matched, blocked: false };
}
