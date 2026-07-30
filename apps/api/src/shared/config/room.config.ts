export const ROOM_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_PARTICIPANTS = 50;
export const MAX_OPTIONS = 100;
export const MAX_PENDING_PROPOSALS = 10;
export const HISTORY_LIMIT = 10;
export const SESSION_COOKIE_PREFIX = "gatherwheel_session_";
export const DEFAULT_OPTIONS = ["Пицца", "Суши", "Бургеры", "Паста", "Салат"];

export function roomCookieName(code: string): string {
  return `${SESSION_COOKIE_PREFIX}${code.toLowerCase()}`;
}
