import type { SavedHostRoom, SavedHostRoomStore } from "./types";

export const SAVED_HOST_ROOM_LIMIT = 20;
export const SAVED_HOST_ROOM_STORAGE_KEY = "wheel-spin-host-rooms";

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value))
  );
}

function isSavedHostRoom(value: unknown): value is SavedHostRoom {
  if (!value || typeof value !== "object") return false;
  const room = value as Partial<SavedHostRoom>;

  return (
    typeof room.code === "string" &&
    room.code.length > 0 &&
    room.code.length <= 16 &&
    typeof room.title === "string" &&
    room.title.trim().length > 0 &&
    room.title.length <= 60 &&
    isIsoDate(room.createdAt) &&
    isIsoDate(room.lastOpenedAt) &&
    isIsoDate(room.expiresAt)
  );
}

function writeSavedHostRooms(storage: Storage, rooms: SavedHostRoom[]): void {
  try {
    const value: SavedHostRoomStore = { version: 1, rooms };
    storage.setItem(SAVED_HOST_ROOM_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Saving this convenience list must never block room creation or navigation.
  }
}

export function readSavedHostRooms(
  storage: Storage,
  now = Date.now(),
): SavedHostRoom[] {
  try {
    const raw = storage.getItem(SAVED_HOST_ROOM_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<SavedHostRoomStore>;
    if (parsed.version !== 1 || !Array.isArray(parsed.rooms)) return [];

    const rooms = parsed.rooms
      .filter(isSavedHostRoom)
      .filter((room) => Date.parse(room.expiresAt) > now)
      .sort(
        (first, second) =>
          Date.parse(second.lastOpenedAt) - Date.parse(first.lastOpenedAt),
      )
      .slice(0, SAVED_HOST_ROOM_LIMIT);

    if (rooms.length !== parsed.rooms.length) {
      writeSavedHostRooms(storage, rooms);
    }

    return rooms;
  } catch {
    return [];
  }
}

export function saveHostRoom(
  storage: Storage,
  state: { code: string; title: string; expiresAt: string },
  now = new Date(),
): SavedHostRoom[] {
  const rooms = readSavedHostRooms(storage, now.getTime());
  const existing = rooms.find((room) => room.code === state.code);
  const savedRoom: SavedHostRoom = {
    code: state.code,
    title: state.title.trim(),
    createdAt: existing?.createdAt ?? now.toISOString(),
    lastOpenedAt: now.toISOString(),
    expiresAt: state.expiresAt,
  };
  const nextRooms = [
    savedRoom,
    ...rooms.filter((room) => room.code !== state.code),
  ].slice(0, SAVED_HOST_ROOM_LIMIT);

  writeSavedHostRooms(storage, nextRooms);
  return nextRooms;
}

export function removeSavedHostRoom(
  storage: Storage,
  code: string,
  now = Date.now(),
): SavedHostRoom[] {
  const rooms = readSavedHostRooms(storage, now).filter((room) => room.code !== code);
  writeSavedHostRooms(storage, rooms);
  return rooms;
}
