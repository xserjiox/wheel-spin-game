// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSavedRooms,
  LEGACY_SAVED_HOST_ROOM_STORAGE_KEY,
  readSavedRooms,
  removeSavedRoom,
  saveRoom,
  SAVED_ROOM_STORAGE_KEY,
} from "./saved-room-storage";

const room = {
  code: "Ab7xK2pQ",
  title: "Friday lunch",
  role: "HOST" as const,
  expiresAt: "2026-08-05T12:00:00.000Z",
};

describe("saved room storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores rooms for hosts and guests", () => {
    saveRoom(window.localStorage, room, new Date("2026-07-29T10:00:00.000Z"));
    const rooms = saveRoom(
      window.localStorage,
      {
        ...room,
        code: "Guest123",
        title: "Dinner",
        role: "GUEST",
      },
      new Date("2026-07-29T11:00:00.000Z"),
    );

    expect(rooms).toEqual([
      {
        code: "Guest123",
        title: "Dinner",
        role: "GUEST",
        createdAt: "2026-07-29T11:00:00.000Z",
        lastOpenedAt: "2026-07-29T11:00:00.000Z",
        expiresAt: room.expiresAt,
      },
      {
        code: room.code,
        title: room.title,
        role: "HOST",
        createdAt: "2026-07-29T10:00:00.000Z",
        lastOpenedAt: "2026-07-29T10:00:00.000Z",
        expiresAt: room.expiresAt,
      },
    ]);
  });

  it("removes expired, invalid, and explicitly forgotten rooms", () => {
    window.localStorage.setItem(
      SAVED_ROOM_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        rooms: [
          {
            code: "Expired1",
            title: "Expired",
            role: "GUEST",
            createdAt: "2026-07-20T10:00:00.000Z",
            lastOpenedAt: "2026-07-20T10:00:00.000Z",
            expiresAt: "2026-07-28T10:00:00.000Z",
          },
          {
            code: "Valid123",
            title: "Valid room",
            role: "HOST",
            createdAt: "2026-07-28T10:00:00.000Z",
            lastOpenedAt: "2026-07-29T10:00:00.000Z",
            expiresAt: "2026-08-05T10:00:00.000Z",
          },
          { code: "", title: "Broken" },
        ],
      }),
    );

    expect(readSavedRooms(window.localStorage, Date.parse("2026-07-29"))).toHaveLength(
      1,
    );
    expect(
      removeSavedRoom(window.localStorage, "Valid123", Date.parse("2026-07-29")),
    ).toEqual([]);
  });

  it("migrates existing host rooms to the role-aware store", () => {
    window.localStorage.setItem(
      LEGACY_SAVED_HOST_ROOM_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        rooms: [
          {
            code: room.code,
            title: room.title,
            createdAt: "2026-07-29T10:00:00.000Z",
            lastOpenedAt: "2026-07-29T10:00:00.000Z",
            expiresAt: room.expiresAt,
          },
        ],
      }),
    );

    expect(readSavedRooms(window.localStorage, Date.parse("2026-07-29"))).toEqual([
      {
        code: room.code,
        title: room.title,
        role: "HOST",
        createdAt: "2026-07-29T10:00:00.000Z",
        lastOpenedAt: "2026-07-29T10:00:00.000Z",
        expiresAt: room.expiresAt,
      },
    ]);
    expect(window.localStorage.getItem(LEGACY_SAVED_HOST_ROOM_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(SAVED_ROOM_STORAGE_KEY)).not.toBeNull();
  });

  it("ignores unsupported stored data", () => {
    window.localStorage.setItem(
      SAVED_ROOM_STORAGE_KEY,
      JSON.stringify({ version: 3, rooms: [] }),
    );

    expect(readSavedRooms(window.localStorage)).toEqual([]);
  });

  it("clears current and legacy saved-room keys", () => {
    window.localStorage.setItem(SAVED_ROOM_STORAGE_KEY, "current");
    window.localStorage.setItem(LEGACY_SAVED_HOST_ROOM_STORAGE_KEY, "legacy");

    clearSavedRooms(window.localStorage);

    expect(window.localStorage.getItem(SAVED_ROOM_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_SAVED_HOST_ROOM_STORAGE_KEY)).toBeNull();
  });
});
