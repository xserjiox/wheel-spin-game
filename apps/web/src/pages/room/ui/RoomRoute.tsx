import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getRoomMeta,
  joinRoom,
  restoreRoom,
  type RoomMeta,
  type RoomNavigationState,
  type RoomState,
} from "@/entities/room";
import { removeSavedRoom } from "@/entities/saved-room";
import { ApiRequestError } from "@/shared/api/http";
import { trackAnalyticsEvent } from "@/shared/lib/analytics";
import { LoadingScreen } from "@/shared/ui/loading-screen";
import { UnavailableScreen } from "@/shared/ui/unavailable-screen";
import { JoinRoomPage } from "./JoinRoomPage";
import { RoomPage } from "./RoomPage";

type RoomView =
  | { kind: "loading" }
  | { kind: "join"; meta: RoomMeta }
  | { kind: "room"; state: RoomState }
  | { kind: "missing"; message: string };

export function RoomRoute() {
  const { code = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as RoomNavigationState | null;
  const initialRoomState = navigationState?.initialRoomState;
  const [view, setView] = useState<RoomView>(() =>
    initialRoomState?.code === code
      ? { kind: "room", state: initialRoomState }
      : { kind: "loading" },
  );

  useEffect(() => {
    if (!code) {
      setView({ kind: "missing", message: "" });
      return;
    }

    if (initialRoomState?.code === code) {
      setView({ kind: "room", state: initialRoomState });
      return;
    }

    let cancelled = false;
    setView({ kind: "loading" });

    void (async () => {
      try {
        const restored = await restoreRoom(code);
        if (!cancelled) setView({ kind: "room", state: restored.state });
      } catch (restoreError) {
        if (
          restoreError instanceof ApiRequestError &&
          [401, 403, 404].includes(restoreError.status)
        ) {
          removeSavedRoom(window.localStorage, code);
        }
        try {
          const meta = await getRoomMeta(code);
          if (!cancelled) setView({ kind: "join", meta });
        } catch (error) {
          if (!cancelled) {
            setView({
              kind: "missing",
              message: error instanceof Error ? error.message : "",
            });
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, initialRoomState]);

  const goHome = () => navigate("/");

  if (view.kind === "loading") return <LoadingScreen />;
  if (view.kind === "missing") {
    return <UnavailableScreen message={view.message} onHome={goHome} />;
  }

  if (view.kind === "join") {
    return (
      <JoinRoomPage
        meta={view.meta}
        onBack={goHome}
        onJoin={async (input) => {
          const result = await joinRoom(code, input);
          trackAnalyticsEvent("room_join");
          setView({ kind: "room", state: result.state });
        }}
      />
    );
  }

  return <RoomPage code={code} initialState={view.state} onExit={goHome} />;
}
