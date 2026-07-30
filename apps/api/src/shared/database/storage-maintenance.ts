import type { PrismaClient } from "@prisma/client";
import { HISTORY_LIMIT } from "../config/room.config";

const EXPIRED_ROOMS_LOCK = 8_214_001_101;
const PROCESSED_PROPOSALS_LOCK = 8_214_001_102;
const SPIN_HISTORY_LOCK = 8_214_001_103;

type DeletedId = { id: string };
type CountResult = { count: number };

export type StorageCleanupEstimate = {
  processedProposals: number;
  oldSpins: number;
};

export async function deleteExpiredRoomsBatch(
  prisma: PrismaClient,
  batchSize: number,
): Promise<number> {
  const deleted = await prisma.$queryRaw<DeletedId[]>`
    WITH maintenance_lock AS (
      SELECT pg_try_advisory_xact_lock(${EXPIRED_ROOMS_LOCK}) AS acquired
    ),
    candidates AS (
      SELECT room.id
      FROM "Room" AS room
      WHERE room."expiresAt" < NOW()
        AND (SELECT acquired FROM maintenance_lock)
      ORDER BY room."expiresAt" ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    DELETE FROM "Room" AS room
    USING candidates
    WHERE room.id = candidates.id
    RETURNING room.id
  `;
  return deleted.length;
}

export async function estimateStorageCleanup(
  prisma: PrismaClient,
): Promise<StorageCleanupEstimate> {
  const [proposalResult, spinResult] = await Promise.all([
    prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*)::int AS count
      FROM "Proposal"
      WHERE status <> 'PENDING'::"ProposalStatus"
    `,
    prisma.$queryRaw<CountResult[]>`
      WITH ranked AS (
        SELECT
          spin.id,
          room."activeSpinId",
          ROW_NUMBER() OVER (
            PARTITION BY spin."roomId"
            ORDER BY spin."createdAt" DESC, spin.id DESC
          ) AS position
        FROM "Spin" AS spin
        INNER JOIN "Room" AS room ON room.id = spin."roomId"
      )
      SELECT COUNT(*)::int AS count
      FROM ranked
      WHERE id IS DISTINCT FROM "activeSpinId"
        AND position > ${HISTORY_LIMIT} +
          CASE WHEN "activeSpinId" IS NULL THEN 0 ELSE 1 END
    `,
  ]);

  return {
    processedProposals: Number(proposalResult[0]?.count ?? 0),
    oldSpins: Number(spinResult[0]?.count ?? 0),
  };
}

export async function deleteProcessedProposalsBatch(
  prisma: PrismaClient,
  batchSize: number,
): Promise<number> {
  const deleted = await prisma.$queryRaw<DeletedId[]>`
    WITH maintenance_lock AS (
      SELECT pg_try_advisory_xact_lock(${PROCESSED_PROPOSALS_LOCK}) AS acquired
    ),
    candidates AS (
      SELECT proposal.id
      FROM "Proposal" AS proposal
      WHERE proposal.status <> 'PENDING'::"ProposalStatus"
        AND (SELECT acquired FROM maintenance_lock)
      ORDER BY proposal."reviewedAt" ASC NULLS FIRST, proposal."createdAt" ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    )
    DELETE FROM "Proposal" AS proposal
    USING candidates
    WHERE proposal.id = candidates.id
    RETURNING proposal.id
  `;
  return deleted.length;
}

export async function deleteOldSpinsBatch(
  prisma: PrismaClient,
  batchSize: number,
): Promise<number> {
  const deleted = await prisma.$queryRaw<DeletedId[]>`
    WITH maintenance_lock AS (
      SELECT pg_try_advisory_xact_lock(${SPIN_HISTORY_LOCK}) AS acquired
    ),
    ranked AS (
      SELECT
        spin.id,
        room."activeSpinId",
        ROW_NUMBER() OVER (
          PARTITION BY spin."roomId"
          ORDER BY spin."createdAt" DESC, spin.id DESC
        ) AS position
      FROM "Spin" AS spin
      INNER JOIN "Room" AS room ON room.id = spin."roomId"
      WHERE (SELECT acquired FROM maintenance_lock)
    ),
    candidates AS (
      SELECT id
      FROM ranked
      WHERE id IS DISTINCT FROM "activeSpinId"
        AND position > ${HISTORY_LIMIT} +
          CASE WHEN "activeSpinId" IS NULL THEN 0 ELSE 1 END
      LIMIT ${batchSize}
    )
    DELETE FROM "Spin" AS spin
    USING candidates
    WHERE spin.id = candidates.id
    RETURNING spin.id
  `;
  return deleted.length;
}
