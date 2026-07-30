import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/home";

export const router = createBrowserRouter([
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
    path: "*",
    lazy: async () => {
      const { NotFoundPage } = await import("@/pages/not-found");
      return { Component: NotFoundPage };
    },
  },
]);
