import type { PrismaClient } from "@prisma/client";
import { HISTORY_LIMIT } from "../config/room.config";
import { roomSummaryColumns, roomTotalsColumns } from "./room-stats";

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
    ),
    summaries AS (
      SELECT ${roomSummaryColumns}
      FROM "Room" AS room
      INNER JOIN candidates ON candidates.id = room.id
    ),
    -- Runs in the same snapshot as the DELETE, so participants and spins are still visible.
    recorded_stats AS (
      INSERT INTO "DailyRoomStat" (
        day, "hasPassword", rooms, "roomsWithGuests", "liveRooms", "soloSpunRooms",
        "abandonedRooms", guests, "maxGuests", "participants1", "participants2to4",
        "participants5to11", "participants12to31", "participants32to49",
        "participants50plus"
      )
      SELECT day, has_password, ${roomTotalsColumns}
      FROM summaries
      GROUP BY day, has_password
      ON CONFLICT (day, "hasPassword") DO UPDATE SET
        rooms = "DailyRoomStat".rooms + EXCLUDED.rooms,
        "roomsWithGuests" = "DailyRoomStat"."roomsWithGuests" + EXCLUDED."roomsWithGuests",
        "liveRooms" = "DailyRoomStat"."liveRooms" + EXCLUDED."liveRooms",
        "soloSpunRooms" = "DailyRoomStat"."soloSpunRooms" + EXCLUDED."soloSpunRooms",
        "abandonedRooms" = "DailyRoomStat"."abandonedRooms" + EXCLUDED."abandonedRooms",
        guests = "DailyRoomStat".guests + EXCLUDED.guests,
        "maxGuests" = GREATEST("DailyRoomStat"."maxGuests", EXCLUDED."maxGuests"),
        "participants1" = "DailyRoomStat"."participants1" + EXCLUDED."participants1",
        "participants2to4" = "DailyRoomStat"."participants2to4" + EXCLUDED."participants2to4",
        "participants5to11" =
          "DailyRoomStat"."participants5to11" + EXCLUDED."participants5to11",
        "participants12to31" =
          "DailyRoomStat"."participants12to31" + EXCLUDED."participants12to31",
        "participants32to49" =
          "DailyRoomStat"."participants32to49" + EXCLUDED."participants32to49",
        "participants50plus" =
          "DailyRoomStat"."participants50plus" + EXCLUDED."participants50plus"
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
