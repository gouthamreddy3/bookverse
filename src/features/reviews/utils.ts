const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "week", seconds: 604800 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = (Date.now() - d.getTime()) / 1000;
  if (seconds < 60) return "just now";

  for (const { unit, seconds: unitSeconds } of RELATIVE_TIME_UNITS) {
    const value = Math.floor(seconds / unitSeconds);
    if (value >= 1) return relativeTimeFormatter.format(-value, unit);
  }
  return "just now";
}

interface TiptapNode {
  type?: string;
  content?: TiptapNode[];
  text?: string;
}

/** A doc with only empty paragraphs (no text, no other node types) counts as empty. */
export function isEmptyTiptapDoc(doc: TiptapNode): boolean {
  const CONTAINER_TYPES = new Set(["doc", "paragraph", "text"]);
  const hasContent = (node: TiptapNode): boolean => {
    if (node.text?.trim()) return true;
    if (node.type && !CONTAINER_TYPES.has(node.type)) return true;
    return node.content?.some(hasContent) ?? false;
  };
  return !hasContent(doc);
}

export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
