import { Prisma, type PrismaClient } from "@prisma/client";

// One row per room with counts only: no codes, titles, names, or wheel content.
// The caller must expose the rooms as `room` (aliased "Room" rows).
export const roomSummaryColumns = Prisma.sql`
  room."createdAt"::date AS day,
  room."passwordHash" IS NOT NULL AS has_password,
  (
    SELECT COUNT(*)::int
    FROM "Participant" AS participant
    WHERE participant."roomId" = room.id
      AND participant.role = 'GUEST'::"ParticipantRole"
  ) AS guests,
  (
    SELECT COUNT(*)::int
    FROM "Participant" AS participant
    WHERE participant."roomId" = room.id
  ) AS participants,
  EXISTS (SELECT 1 FROM "Spin" AS spin WHERE spin."roomId" = room.id) AS has_spins
`;

// Aggregates rows produced by roomSummaryColumns into the DailyRoomStat columns.
export const roomTotalsColumns = Prisma.sql`
  COUNT(*)::int AS rooms,
  COUNT(*) FILTER (WHERE guests > 0)::int AS "roomsWithGuests",
  COUNT(*) FILTER (WHERE guests > 0 AND has_spins)::int AS "liveRooms",
  COUNT(*) FILTER (WHERE guests = 0 AND has_spins)::int AS "soloSpunRooms",
  COUNT(*) FILTER (WHERE guests = 0 AND NOT has_spins)::int AS "abandonedRooms",
  COALESCE(SUM(guests), 0)::int AS guests,
  COALESCE(MAX(guests), 0)::int AS "maxGuests",
  COUNT(*) FILTER (WHERE participants <= 1)::int AS "participants1",
  COUNT(*) FILTER (WHERE participants BETWEEN 2 AND 4)::int AS "participants2to4",
  COUNT(*) FILTER (WHERE participants BETWEEN 5 AND 11)::int AS "participants5to11",
  COUNT(*) FILTER (WHERE participants BETWEEN 12 AND 31)::int AS "participants12to31",
  COUNT(*) FILTER (WHERE participants BETWEEN 32 AND 49)::int AS "participants32to49",
  COUNT(*) FILTER (WHERE participants >= 50)::int AS "participants50plus"
`;

export type WeeklyRoomStats = {
  week: string;
  rooms: number;
  roomsWithGuests: number;
  liveRooms: number;
  soloSpunRooms: number;
  abandonedRooms: number;
  passwordRooms: number;
  passwordRoomsWithGuests: number;
  guests: number;
  maxGuests: number;
  participants1: number;
  participants2to4: number;
  participants5to11: number;
  participants12to31: number;
  participants32to49: number;
  participants50plus: number;
};

// Combines totals of already deleted rooms with rooms that still exist.
export async function loadWeeklyRoomStats(
  prisma: PrismaClient,
  weeks: number,
): Promise<WeeklyRoomStats[]> {
  return prisma.$queryRaw<WeeklyRoomStats[]>`
    WITH current_totals AS (
      SELECT day, has_password AS "hasPassword", ${roomTotalsColumns}
      FROM (SELECT ${roomSummaryColumns} FROM "Room" AS room) AS summaries
      GROUP BY day, has_password
    ),
    combined AS (
      SELECT
        day, "hasPassword", rooms, "roomsWithGuests", "liveRooms", "soloSpunRooms",
        "abandonedRooms", guests, "maxGuests", "participants1", "participants2to4",
        "participants5to11", "participants12to31", "participants32to49",
        "participants50plus"
      FROM "DailyRoomStat"
      UNION ALL
      SELECT
        day, "hasPassword", rooms, "roomsWithGuests", "liveRooms", "soloSpunRooms",
        "abandonedRooms", guests, "maxGuests", "participants1", "participants2to4",
        "participants5to11", "participants12to31", "participants32to49",
        "participants50plus"
      FROM current_totals
    )
    SELECT
      to_char(date_trunc('week', day::timestamp), 'YYYY-MM-DD') AS week,
      SUM(rooms)::int AS rooms,
      SUM("roomsWithGuests")::int AS "roomsWithGuests",
      SUM("liveRooms")::int AS "liveRooms",
      SUM("soloSpunRooms")::int AS "soloSpunRooms",
      SUM("abandonedRooms")::int AS "abandonedRooms",
      COALESCE(SUM(rooms) FILTER (WHERE "hasPassword"), 0)::int AS "passwordRooms",
      COALESCE(SUM("roomsWithGuests") FILTER (WHERE "hasPassword"), 0)::int
        AS "passwordRoomsWithGuests",
      SUM(guests)::int AS guests,
      MAX("maxGuests")::int AS "maxGuests",
      SUM("participants1")::int AS "participants1",
      SUM("participants2to4")::int AS "participants2to4",
      SUM("participants5to11")::int AS "participants5to11",
      SUM("participants12to31")::int AS "participants12to31",
      SUM("participants32to49")::int AS "participants32to49",
      SUM("participants50plus")::int AS "participants50plus"
    FROM combined
    WHERE day >= date_trunc('week', CURRENT_DATE::timestamp)
      - make_interval(weeks => ${weeks - 1}::int)
    GROUP BY 1
    ORDER BY 1
  `;
}
