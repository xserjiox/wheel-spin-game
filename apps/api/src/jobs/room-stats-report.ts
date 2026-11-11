import type {
  WeeklyExperimentStats,
  WeeklyRoomStats,
} from "../shared/database/room-stats";

function percent(part: number, total: number): string {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : "-";
}

function countWithShare(part: number, total: number): string {
  return `${part} (${percent(part, total)})`;
}

export function readableWeekRow(row: WeeklyRoomStats) {
  return {
    week: row.week,
    rooms: row.rooms,
    withGuests: percent(row.roomsWithGuests, row.rooms),
    live: row.liveRooms,
    soloSpun: percent(row.soloSpunRooms, row.rooms),
    abandoned: percent(row.abandonedRooms, row.rooms),
    withPassword: percent(row.passwordRooms, row.rooms),
    passwordWithGuests: percent(row.passwordRoomsWithGuests, row.passwordRooms),
    guests: row.guests,
    maxGuests: row.maxGuests,
    "p:1": row.participants1,
    "p:2-4": row.participants2to4,
    "p:5-11": row.participants5to11,
    "p:12-31": row.participants12to31,
    "p:32-49": row.participants32to49,
    "p:50+": row.participants50plus,
  };
}

// Weekly rows per group, then one total per group: single weeks are usually too small to compare.
export function readableExperimentRows(rows: WeeklyExperimentStats[]) {
  const totals = (["A", "B"] as const).map((experiment) =>
    rows
      .filter((row) => row.experiment === experiment)
      .reduce<WeeklyExperimentStats>(
        (sum, row) => ({
          ...sum,
          rooms: sum.rooms + row.rooms,
          roomsWithGuests: sum.roomsWithGuests + row.roomsWithGuests,
          liveRooms: sum.liveRooms + row.liveRooms,
          abandonedRooms: sum.abandonedRooms + row.abandonedRooms,
          untouchedRooms: sum.untouchedRooms + row.untouchedRooms,
        }),
        {
          week: "total",
          experiment,
          rooms: 0,
          roomsWithGuests: 0,
          liveRooms: 0,
          abandonedRooms: 0,
          untouchedRooms: 0,
        },
      ),
  );

  return [...rows, ...totals].map((row) => ({
    week: row.week,
    group: row.experiment,
    rooms: row.rooms,
    withGuests: countWithShare(row.roomsWithGuests, row.rooms),
    live: countWithShare(row.liveRooms, row.rooms),
    abandoned: countWithShare(row.abandonedRooms, row.rooms),
    untouched: countWithShare(row.untouchedRooms, row.rooms),
  }));
}
