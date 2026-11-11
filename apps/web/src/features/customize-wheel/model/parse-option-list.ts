// Mirrors the server limits so the host's list is never rejected after they press Done.
export const MAX_WHEEL_OPTIONS = 100;
export const MAX_OPTION_LENGTH = 80;
// Long lists usually mean people's names, where nobody should be picked twice.
export const NO_REPEAT_SUGGESTION_THRESHOLD = 8;

// Bullets and numbering that notes apps and documents add when a list is copied.
const LIST_MARKER = /^(?:[-*•–—]|\d{1,3}[.)])\s+(?=\S)/u;

export function cleanOption(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, MAX_OPTION_LENGTH).trim();
}

// Turns a pasted column or row from a note or spreadsheet into separate options.
export function splitPastedList(text: string): string[] {
  return text
    .split(/\r?\n|\t/)
    .map((line) => cleanOption(line.trim().replace(LIST_MARKER, "")))
    .filter(Boolean);
}

// Keeps the first spelling of each option and flags later repeats so the field can say why it is skipped.
// wheelPositions match the segment order (and colour) each field will get on the wheel.
export function reviewOptions(values: string[]): {
  options: string[];
  duplicates: boolean[];
  wheelPositions: Array<number | null>;
} {
  const seen = new Set<string>();
  const options: string[] = [];
  const duplicates: boolean[] = [];
  const wheelPositions: Array<number | null> = [];
  for (const value of values) {
    const option = cleanOption(value);
    const key = option.toLocaleLowerCase();
    const repeat = Boolean(option) && seen.has(key);
    duplicates.push(repeat);
    if (!option || repeat) {
      wheelPositions.push(null);
      continue;
    }
    seen.add(key);
    wheelPositions.push(options.length);
    options.push(option);
  }
  return { options, duplicates, wheelPositions };
}
