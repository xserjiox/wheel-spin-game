// Keeps the first spelling of each label; repeats differing only in case or spacing are dropped.
export function uniqueOptionLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const label of labels) {
    const clean = label.trim().replace(/\s+/g, " ");
    const key = clean.toLocaleLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    unique.push(clean);
  }
  return unique;
}
