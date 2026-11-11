-- AlterTable
ALTER TABLE "DailyRoomStat" DROP CONSTRAINT "DailyRoomStat_pkey",
ADD COLUMN     "experiment" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "untouchedRooms" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "DailyRoomStat_pkey" PRIMARY KEY ("day", "hasPassword", "experiment");

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "experiment" TEXT,
ADD COLUMN     "starterOptionsHash" TEXT;
