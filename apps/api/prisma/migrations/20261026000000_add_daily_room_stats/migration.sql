-- CreateTable
CREATE TABLE "DailyRoomStat" (
    "day" DATE NOT NULL,
    "hasPassword" BOOLEAN NOT NULL,
    "rooms" INTEGER NOT NULL DEFAULT 0,
    "roomsWithGuests" INTEGER NOT NULL DEFAULT 0,
    "liveRooms" INTEGER NOT NULL DEFAULT 0,
    "soloSpunRooms" INTEGER NOT NULL DEFAULT 0,
    "abandonedRooms" INTEGER NOT NULL DEFAULT 0,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "maxGuests" INTEGER NOT NULL DEFAULT 0,
    "participants1" INTEGER NOT NULL DEFAULT 0,
    "participants2to4" INTEGER NOT NULL DEFAULT 0,
    "participants5to11" INTEGER NOT NULL DEFAULT 0,
    "participants12to31" INTEGER NOT NULL DEFAULT 0,
    "participants32to49" INTEGER NOT NULL DEFAULT 0,
    "participants50plus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyRoomStat_pkey" PRIMARY KEY ("day","hasPassword")
);

