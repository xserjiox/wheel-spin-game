import { PrismaClient } from "@prisma/client";
import {
  deleteOldSpinsBatch,
  deleteProcessedProposalsBatch,
  estimateStorageCleanup,
} from "../shared/database/storage-maintenance";

function batchSize(): number {
  const argument = process.argv.find((value) => value.startsWith("--batch-size="));
  const parsed = Number(argument?.split("=")[1] ?? process.env.CLEANUP_BATCH_SIZE);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 2_000) : 500;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const dryRun = process.argv.includes("--dry-run");
  const size = batchSize();

  try {
    const estimate = await estimateStorageCleanup(prisma);
    if (dryRun) {
      console.log(
        JSON.stringify({ job: "cleanup-storage", dryRun: true, ...estimate }),
      );
      return;
    }

    const startedAt = Date.now();
    let processedProposals = 0;
    let oldSpins = 0;

    while (true) {
      const deleted = await deleteProcessedProposalsBatch(prisma, size);
      processedProposals += deleted;
      if (deleted < size) break;
    }
    while (true) {
      const deleted = await deleteOldSpinsBatch(prisma, size);
      oldSpins += deleted;
      if (deleted < size) break;
    }

    console.log(
      JSON.stringify({
        job: "cleanup-storage",
        dryRun: false,
        deletedProcessedProposals: processedProposals,
        deletedOldSpins: oldSpins,
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
