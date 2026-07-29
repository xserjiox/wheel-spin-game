// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  readSavedHostRooms,
  removeSavedHostRoom,
  saveHostRoom,
  SAVED_HOST_ROOM_STORAGE_KEY,
} from "./saved-room-storage";

const room = {
  code: "Ab7xK2pQ",
  title: "Friday lunch",
  expiresAt: "2026-08-05T12:00:00.000Z",
};

describe("saved host room storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores and updates a host room", () => {
    saveHostRoom(window.localStorage, room, new Date("2026-07-29T10:00:00.000Z"));
    const rooms = saveHostRoom(
      window.localStorage,
      { ...room, title: "Dinner" },
      new Date("2026-07-29T11:00:00.000Z"),
    );

    expect(rooms).toEqual([
      {
        code: room.code,
        title: "Dinner",
        createdAt: "2026-07-29T10:00:00.000Z",
        lastOpenedAt: "2026-07-29T11:00:00.000Z",
        expiresAt: room.expiresAt,
      },
    ]);
  });

  it("removes expired, invalid, and explicitly forgotten rooms", () => {
    window.localStorage.setItem(
      SAVED_HOST_ROOM_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        rooms: [
          {
            code: "Expired1",
            title: "Expired",
            createdAt: "2026-07-20T10:00:00.000Z",
            lastOpenedAt: "2026-07-20T10:00:00.000Z",
            expiresAt: "2026-07-28T10:00:00.000Z",
          },
          {
            code: "Valid123",
            title: "Valid room",
            createdAt: "2026-07-28T10:00:00.000Z",
            lastOpenedAt: "2026-07-29T10:00:00.000Z",
            expiresAt: "2026-08-05T10:00:00.000Z",
          },
          { code: "", title: "Broken" },
        ],
      }),
    );

    expect(
      readSavedHostRooms(window.localStorage, Date.parse("2026-07-29")),
    ).toHaveLength(1);
    expect(
      removeSavedHostRoom(window.localStorage, "Valid123", Date.parse("2026-07-29")),
    ).toEqual([]);
  });

  it("ignores unsupported stored data", () => {
    window.localStorage.setItem(
      SAVED_HOST_ROOM_STORAGE_KEY,
      JSON.stringify({ version: 2, rooms: [] }),
    );

    expect(readSavedHostRooms(window.localStorage)).toEqual([]);
  });
});
