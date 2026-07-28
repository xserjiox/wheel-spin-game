CREATE TYPE "RoomStatus" AS ENUM ('LOBBY', 'SPINNING', 'CLOSED');
CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'GUEST');
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE "Room" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "passwordHash" TEXT,
  "status" "RoomStatus" NOT NULL DEFAULT 'LOBBY',
  "version" INTEGER NOT NULL DEFAULT 1,
  "currentRotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "activeSpinId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Participant" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "normalizedName" TEXT NOT NULL,
  "role" "ParticipantRole" NOT NULL,
  "sessionHash" TEXT NOT NULL,
  "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Option" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Proposal" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Spin" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "optionsSnapshot" JSONB NOT NULL,
  "winnerOptionId" TEXT NOT NULL,
  "winnerIndex" INTEGER NOT NULL,
  "winnerLabel" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "finalRotation" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Spin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
CREATE INDEX "Room_expiresAt_idx" ON "Room"("expiresAt");
CREATE UNIQUE INDEX "Participant_sessionHash_key" ON "Participant"("sessionHash");
CREATE INDEX "Participant_roomId_idx" ON "Participant"("roomId");
CREATE UNIQUE INDEX "Participant_roomId_normalizedName_key" ON "Participant"("roomId", "normalizedName");
CREATE UNIQUE INDEX "Option_roomId_position_key" ON "Option"("roomId", "position");
CREATE INDEX "Option_roomId_idx" ON "Option"("roomId");
CREATE INDEX "Proposal_roomId_status_idx" ON "Proposal"("roomId", "status");
CREATE INDEX "Proposal_participantId_status_idx" ON "Proposal"("participantId", "status");
CREATE UNIQUE INDEX "Spin_roomId_requestId_key" ON "Spin"("roomId", "requestId");
CREATE INDEX "Spin_roomId_createdAt_idx" ON "Spin"("roomId", "createdAt");

ALTER TABLE "Participant" ADD CONSTRAINT "Participant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Option" ADD CONSTRAINT "Option_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Spin" ADD CONSTRAINT "Spin_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
