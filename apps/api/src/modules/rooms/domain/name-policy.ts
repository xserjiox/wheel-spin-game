export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru");
}

export function assignAvailableName(
  base: string,
  normalizedNames: string[],
  maxParticipants = 50,
): string {
  const cleanBase = base.trim().replace(/\s+/g, " ");
  const taken = new Set(normalizedNames);
  if (!taken.has(normalizeDisplayName(cleanBase))) return cleanBase;
  for (let suffix = 2; suffix <= maxParticipants + 1; suffix += 1) {
    const candidate = `${cleanBase} ${suffix}`;
    if (!taken.has(normalizeDisplayName(candidate))) return candidate;
  }
  return `${cleanBase} ${Date.now().toString().slice(-3)}`;
}
