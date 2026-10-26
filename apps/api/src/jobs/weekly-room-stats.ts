import { PrismaClient } from "@prisma/client";
import {
  loadWeeklyRoomStats,
  type WeeklyRoomStats,
} from "../shared/database/room-stats";

function weeks(): number {
  const argument = process.argv.find((value) => value.startsWith("--weeks="));
  const parsed = Number(argument?.split("=")[1] ?? 8);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 104) : 8;
}

function percent(part: number, total: number): string {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : "-";
}

function readableRow(row: WeeklyRoomStats) {
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
    "p:50": row.participants50plus,
  };
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const rows = await loadWeeklyRoomStats(prisma, weeks());
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }
    console.log("Weeks start on Monday (UTC). Participants include the host.");
    console.table(rows.map(readableRow));
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
