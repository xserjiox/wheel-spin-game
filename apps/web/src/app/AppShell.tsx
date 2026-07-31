import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ConsentBanner, ConsentProvider, useConsent } from "@/features/manage-consent";
import { trackAnalyticsPageView } from "@/shared/lib/analytics";

function AnalyticsPageTracker() {
  const location = useLocation();
  const { choice } = useConsent();

  useEffect(() => {
    if (choice === "granted") trackAnalyticsPageView(location.pathname);
  }, [choice, location.pathname]);

  return null;
}

function RouteScrollReset() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export function AppShell() {
  return (
    <ConsentProvider>
      <AnalyticsPageTracker />
      <RouteScrollReset />
      <Outlet />
      <ConsentBanner />
    </ConsentProvider>
  );
}
