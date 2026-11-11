import { describe, expect, it } from "vitest";
import { readableExperimentRows } from "../src/jobs/room-stats-report";

describe("starting wheel test report", () => {
  it("shows every group per week and a total per group", () => {
    const rows = readableExperimentRows([
      {
        week: "2026-11-09",
        experiment: "A",
        rooms: 10,
        roomsWithGuests: 5,
        liveRooms: 4,
        abandonedRooms: 3,
        untouchedRooms: 6,
      },
      {
        week: "2026-11-09",
        experiment: "B",
        rooms: 8,
        roomsWithGuests: 6,
        liveRooms: 6,
        abandonedRooms: 1,
        untouchedRooms: 2,
      },
      {
        week: "2026-11-16",
        experiment: "A",
        rooms: 10,
        roomsWithGuests: 5,
        liveRooms: 2,
        abandonedRooms: 3,
        untouchedRooms: 2,
      },
    ]);

    expect(rows.slice(-2)).toEqual([
      {
        week: "total",
        group: "A",
        rooms: 20,
        withGuests: "10 (50%)",
        live: "6 (30%)",
        abandoned: "6 (30%)",
        untouched: "8 (40%)",
      },
      {
        week: "total",
        group: "B",
        rooms: 8,
        withGuests: "6 (75%)",
        live: "6 (75%)",
        abandoned: "1 (13%)",
        untouched: "2 (25%)",
      },
    ]);
    expect(rows).toHaveLength(5);
  });
});
