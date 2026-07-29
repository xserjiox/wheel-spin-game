import { ParticipantRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RoomsGateway } from "../src/modules/rooms/presentation/ws/rooms.gateway";
import type { RoomsService } from "../src/modules/rooms/application/rooms.service";
import { SessionService } from "../src/shared/security/session.service";

const hostId = "a4cd0eba-24be-4b1a-af94-6b43ff48ce62";
const guestId = "8b6a2f28-58d2-438b-b4f3-f8d90ccf5b31";
const hostParticipant = {
  id: hostId,
  roomId: "room-id",
  displayName: "Maya",
  normalizedName: "maya",
  role: ParticipantRole.HOST,
  sessionHash: "host-session",
};

describe("participant gateway", () => {
  it("disconnects every socket of a kicked guest and updates the room", async () => {
    const rooms = {
      kickParticipant: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockResolvedValue({ code: "Room1234" }),
    } as unknown as RoomsService;
    const gateway = new RoomsGateway(rooms, new SessionService());
    const hostSocket = {
      data: { participant: hostParticipant },
      emit: vi.fn(),
      disconnect: vi.fn(),
    };
    const guestSocket = {
      data: { participant: { ...hostParticipant, id: guestId } },
      emit: vi.fn(),
      disconnect: vi.fn(),
    };
    const fetchSockets = vi
      .fn()
      .mockResolvedValueOnce([hostSocket, guestSocket])
      .mockResolvedValueOnce([hostSocket]);
    Reflect.set(gateway, "server", {
      in: vi.fn().mockReturnValue({ fetchSockets }),
    });
    const client = {
      data: { code: "Room1234", participant: hostParticipant },
    } as unknown as Parameters<RoomsGateway["kickParticipant"]>[0];

    await expect(
      gateway.kickParticipant(client, { participantId: guestId }),
    ).resolves.toEqual({ ok: true });
    expect(rooms.kickParticipant).toHaveBeenCalledWith(hostParticipant, guestId);
    expect(guestSocket.emit).toHaveBeenCalledWith("participant.kicked");
    expect(guestSocket.disconnect).toHaveBeenCalledWith(true);
    expect(hostSocket.disconnect).not.toHaveBeenCalled();
    expect(hostSocket.emit).toHaveBeenCalledWith(
      "room.state",
      expect.objectContaining({ code: "Room1234" }),
    );
  });
});
