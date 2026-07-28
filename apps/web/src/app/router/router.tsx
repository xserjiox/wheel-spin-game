import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/not-found";
import { RoomRoute } from "@/pages/room";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/r/:code",
    element: <RoomRoute />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
