import { z } from "zod";

const cleanText = (max: number) => z.string().trim().min(1).max(max);

export const createRoomSchema = z.object({
  hostName: cleanText(32),
  title: cleanText(60).default("Кому повезёт?"),
  password: z.string().max(72).optional().default(""),
  options: z.array(cleanText(80)).min(2).max(100).optional(),
});

export const joinRoomSchema = z.object({
  name: cleanText(32),
  password: z.string().max(72).optional().default(""),
});

export const roomCodeSchema = z.string().trim().min(6).max(16);

export const titleSchema = z.object({ title: cleanText(60) });
export const passwordSchema = z.object({ password: z.string().max(72) });
export const optionSchema = z.object({ label: cleanText(80) });
export const optionRemoveSchema = z.object({ optionId: z.string().uuid() });
export const proposalReviewSchema = z.object({
  proposalId: z.string().uuid(),
  decision: z.enum(["accept", "reject"]),
});
export const proposalUpdateSchema = z.object({
  proposalId: z.string().uuid(),
  label: cleanText(80),
});
export const proposalRemoveSchema = z.object({
  proposalId: z.string().uuid(),
});
export const participantKickSchema = z.object({
  participantId: z.string().uuid(),
});
export const participantSpinPermissionSchema = z.object({
  participantId: z.string().uuid(),
  canSpin: z.boolean(),
});
export const spinSchema = z.object({
  requestId: z.string().uuid(),
  durationMs: z.number().int().min(5_000).max(120_000),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

export type PublicRoomState = {
  code: string;
  title: string;
  status: "LOBBY" | "SPINNING" | "CLOSED";
  version: number;
  role: "HOST" | "GUEST";
  canSpin: boolean;
  displayName: string;
  participantCount: number;
  participants: Array<{
    id: string;
    displayName: string;
    role: "HOST" | "GUEST";
    canSpin: boolean;
    online: boolean;
  }>;
  options: Array<{ id: string; label: string; position: number }>;
  proposals: Array<{ id: string; label: string; createdAt: string }>;
  myProposals: Array<{ id: string; label: string; createdAt: string }>;
  history: Array<{
    id: string;
    winnerLabel: string;
    createdAt: string;
  }>;
  activeSpin: null | {
    id: string;
    optionsSnapshot: Array<{ id: string; label: string; position: number }>;
    winnerIndex: number;
    winnerLabel: string;
    startedAt: string;
    durationMs: number;
    finalRotation: number;
  };
  hasPassword: boolean;
  expiresAt: string;
};
