import type { SavedRoom, SavedRoomStore } from "./types";

export const SAVED_ROOM_LIMIT = 20;
export const SAVED_ROOM_STORAGE_KEY = "wheel-spin-rooms";
export const LEGACY_SAVED_HOST_ROOM_STORAGE_KEY = "wheel-spin-host-rooms";

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value))
  );
}

function hasValidRoomFields(
  value: unknown,
): value is Omit<SavedRoom, "role"> & { role?: unknown } {
  if (!value || typeof value !== "object") return false;
  const room = value as Partial<SavedRoom>;

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

function isSavedRoom(value: unknown): value is SavedRoom {
  return hasValidRoomFields(value) && (value.role === "HOST" || value.role === "GUEST");
}

function writeSavedRooms(storage: Storage, rooms: SavedRoom[]): void {
  try {
    const value: SavedRoomStore = { version: 2, rooms };
    storage.setItem(SAVED_ROOM_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Saving this convenience list must never block room creation or navigation.
  }
}

function migrateLegacyHostRooms(storage: Storage): SavedRoom[] {
  try {
    const raw = storage.getItem(LEGACY_SAVED_HOST_ROOM_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { version?: unknown; rooms?: unknown };
    if (parsed.version !== 1 || !Array.isArray(parsed.rooms)) return [];

    const rooms = parsed.rooms.filter(hasValidRoomFields).map((room) => ({
      code: room.code,
      title: room.title,
      role: "HOST" as const,
      createdAt: room.createdAt,
      lastOpenedAt: room.lastOpenedAt,
      expiresAt: room.expiresAt,
    }));
    writeSavedRooms(storage, rooms);
    storage.removeItem(LEGACY_SAVED_HOST_ROOM_STORAGE_KEY);
    return rooms;
  } catch {
    return [];
  }
}

export function readSavedRooms(storage: Storage, now = Date.now()): SavedRoom[] {
  try {
    const raw = storage.getItem(SAVED_ROOM_STORAGE_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as Partial<SavedRoomStore>)
      : ({
          version: 2,
          rooms: migrateLegacyHostRooms(storage),
        } satisfies SavedRoomStore);
    if (parsed.version !== 2 || !Array.isArray(parsed.rooms)) return [];

    const rooms = parsed.rooms
      .filter(isSavedRoom)
      .filter((room) => Date.parse(room.expiresAt) > now)
      .sort(
        (first, second) =>
          Date.parse(second.lastOpenedAt) - Date.parse(first.lastOpenedAt),
      )
      .slice(0, SAVED_ROOM_LIMIT);

    if (rooms.length !== parsed.rooms.length) {
      writeSavedRooms(storage, rooms);
    }

    return rooms;
  } catch {
    return [];
  }
}

export function saveRoom(
  storage: Storage,
  state: {
    code: string;
    title: string;
    role: SavedRoom["role"];
    expiresAt: string;
  },
  now = new Date(),
): SavedRoom[] {
  const rooms = readSavedRooms(storage, now.getTime());
  const existing = rooms.find((room) => room.code === state.code);
  const savedRoom: SavedRoom = {
    code: state.code,
    title: state.title.trim(),
    role: state.role,
    createdAt: existing?.createdAt ?? now.toISOString(),
    lastOpenedAt: now.toISOString(),
    expiresAt: state.expiresAt,
  };
  const nextRooms = [
    savedRoom,
    ...rooms.filter((room) => room.code !== state.code),
  ].slice(0, SAVED_ROOM_LIMIT);

  writeSavedRooms(storage, nextRooms);
  return nextRooms;
}

export function removeSavedRoom(
  storage: Storage,
  code: string,
  now = Date.now(),
): SavedRoom[] {
  const rooms = readSavedRooms(storage, now).filter((room) => room.code !== code);
  writeSavedRooms(storage, rooms);
  return rooms;
}
