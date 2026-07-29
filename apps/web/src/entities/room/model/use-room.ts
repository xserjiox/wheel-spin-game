import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { translateError, useI18n } from "@/shared/lib/i18n";
import type { Ack, RoomState } from "./types";

type Command =
  | "room.updateTitle"
  | "room.updatePassword"
  | "option.add"
  | "option.remove"
  | "proposal.create"
  | "proposal.update"
  | "proposal.remove"
  | "proposal.review"
  | "participant.kick"
  | "participant.spinPermission"
  | "spin.start"
  | "spin.cancel";

export function useRoom(code: string, initialState: RoomState) {
  const { t } = useI18n();
  const [state, setState] = useState(initialState);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [canceledSpinId, setCanceledSpinId] = useState<string | null>(null);
  const [wasKicked, setWasKicked] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 600,
      reconnectionDelayMax: 4_000,
    });
    socketRef.current = socket;

    const enter = () => {
      socket.emit("room.join", { code }, (ack: Ack<{ state: RoomState }>) => {
        if (ack.ok) {
          setState(ack.state);
          setError("");
          setConnected(true);
        } else {
          setConnected(false);
          setError(ack.error);
        }
      });
    };
    socket.on("connect", enter);
    socket.on("disconnect", (reason) => {
      setConnected(false);
      if (reason === "io server disconnect") {
        setWasKicked(true);
      }
    });
    socket.on("room.state", (nextState: RoomState) => {
      setState(nextState);
      setError("");
    });
    socket.on("spin.canceled", ({ spinId }: { spinId: string }) => {
      setCanceledSpinId(spinId);
    });
    socket.on("participant.kicked", () => {
      setWasKicked(true);
      setConnected(false);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [code]);

  const command = useCallback(
    <T extends Record<string, unknown>>(event: Command, payload: T) =>
      new Promise<Ack>((resolve) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
          const result: Ack = { ok: false, error: "NO_ROOM_CONNECTION" };
          setError(result.error);
          resolve(result);
          return;
        }
        socket.emit(event, payload, (ack: Ack) => {
          if (!ack.ok) setError(ack.error);
          else setError("");
          resolve(ack);
        });
      }),
    [],
  );

  return {
    state,
    connected,
    error: error ? translateError(error, t) : "",
    clearError: () => setError(""),
    canceledSpinId,
    wasKicked,
    command,
  };
}
