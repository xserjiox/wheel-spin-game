import { PrismaClient } from "@prisma/client";
import {
  loadWeeklyExperimentStats,
  loadWeeklyRoomStats,
} from "../shared/database/room-stats";
import { readableExperimentRows, readableWeekRow } from "./room-stats-report";

function weeks(): number {
  const argument = process.argv.find((value) => value.startsWith("--weeks="));
  const parsed = Number(argument?.split("=")[1] ?? 8);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 104) : 8;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const weekCount = weeks();
    const [rows, experimentRows] = await Promise.all([
      loadWeeklyRoomStats(prisma, weekCount),
      loadWeeklyExperimentStats(prisma, weekCount),
    ]);
    if (process.argv.includes("--json")) {
      console.log(
        JSON.stringify({ weeks: rows, startingWheelTest: experimentRows }, null, 2),
      );
      return;
    }
    console.log("Weeks start on Monday (UTC). Participants include the host.");
    console.table(rows.map(readableWeekRow));
    console.log(
      "\nStarting wheel test: A = standard options, B = neutral placeholders." +
        "\nuntouched = the options were never changed. Rooms with a template are not included.",
    );
    if (experimentRows.length) console.table(readableExperimentRows(experimentRows));
    else console.log("No rooms in the test yet.");
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
