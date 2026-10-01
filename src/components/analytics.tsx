import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { getPublicSettings } from "@/lib/public.functions";
import { loadGa4 } from "@/lib/analytics";

/** Loads GA4 using the measurement ID configured in the admin settings screen and Vercel Web Analytics. */
export function Analytics() {
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => getPublicSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const measurementId = data?.settings?.ga4_measurement_id ?? "";

  useEffect(() => {
    if (measurementId) loadGa4(measurementId);
  }, [measurementId]);

  return <VercelAnalytics />;
}
