import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { HomePage } from "@/pages/home";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    hydrateFallbackElement: (
      <main className="loading-screen" aria-live="polite">
        Loading…
      </main>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/ru/",
        element: <HomePage />,
      },
      {
        path: "/uk/",
        element: <HomePage />,
      },
      {
        path: "/de/",
        element: <HomePage />,
      },
      {
        path: "/zh/",
        element: <HomePage />,
      },
      {
        path: "/r/:code",
        lazy: async () => {
          const { RoomRoute } = await import("@/pages/room");
          return { Component: RoomRoute };
        },
      },
      {
        path: "/privacy",
        lazy: async () => {
          const { LegalPage } = await import("@/pages/legal");
          return { Component: () => <LegalPage kind="privacy" /> };
        },
      },
      {
        path: "/cookies",
        lazy: async () => {
          const { LegalPage } = await import("@/pages/legal");
          return { Component: () => <LegalPage kind="cookies" /> };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundPage } = await import("@/pages/not-found");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
