const PRIVATE_PATH_PREFIXES = ["/r/", "/api/", "/socket.io"];
const PRIVATE_EXACT_PATHS = new Set(["/health", "/ready"]);

export function shouldPreventIndexing(requestUrl: string): boolean {
  const path = requestUrl.split("?")[0];
  return (
    PRIVATE_EXACT_PATHS.has(path) ||
    PRIVATE_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}
