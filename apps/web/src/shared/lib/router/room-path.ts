export function roomPath(code: string): string {
  return `/r/${encodeURIComponent(code.trim())}`;
}
