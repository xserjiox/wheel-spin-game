import { useNavigate } from "react-router-dom";
import { UnavailableScreen } from "@/shared/ui/unavailable-screen";

export function NotFoundPage({ message = "" }: { message?: string }) {
  const navigate = useNavigate();

  return <UnavailableScreen message={message} onHome={() => navigate("/")} />;
}
