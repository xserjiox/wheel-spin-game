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

export function AppShell() {
  return (
    <ConsentProvider>
      <AnalyticsPageTracker />
      <Outlet />
      <ConsentBanner />
    </ConsentProvider>
  );
}
