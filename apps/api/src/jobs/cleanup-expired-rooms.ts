import { PrismaClient } from "@prisma/client";
import { deleteExpiredRoomsBatch } from "../shared/database/storage-maintenance";

function batchSize(): number {
  const argument = process.argv.find((value) => value.startsWith("--batch-size="));
  const parsed = Number(argument?.split("=")[1] ?? process.env.CLEANUP_BATCH_SIZE);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 2_000) : 500;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const size = batchSize();
  let total = 0;
  const startedAt = Date.now();

  try {
    while (true) {
      const deleted = await deleteExpiredRoomsBatch(prisma, size);
      total += deleted;
      if (deleted < size) break;
    }
    console.log(
      JSON.stringify({
        job: "cleanup-expired-rooms",
        deletedRooms: total,
        durationMs: Date.now() - startedAt,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
