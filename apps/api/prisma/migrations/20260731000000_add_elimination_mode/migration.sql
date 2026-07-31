CREATE TYPE "SelectionMode" AS ENUM ('REPEAT', 'ELIMINATION');

ALTER TABLE "Room"
ADD COLUMN "selectionMode" "SelectionMode" NOT NULL DEFAULT 'REPEAT';

ALTER TABLE "Option"
ADD COLUMN "excludedAt" TIMESTAMP(3);

CREATE INDEX "Option_roomId_excludedAt_idx" ON "Option"("roomId", "excludedAt");
