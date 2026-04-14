import { useEffect, useState } from "react";

// Calls our own Vercel serverless function (/api/visitors) which proxies
// counterapi.dev server-side — avoids any CORS issues in the browser.
const API_BASE = "/api/visitors";

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function trackVisit() {
      try {
        // Only increment once per browser session (not on every re-render / HMR reload)
        const sessionKey = "mfpp_visit_counted";
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        const url = alreadyCounted
          ? API_BASE                               // read only
          : `${API_BASE}?action=increment`;        // increment + read

        if (!alreadyCounted) {
          sessionStorage.setItem(sessionKey, "1");
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Visitor API error");
        const data = await res.json();

        if (!cancelled) {
          setCount(data.count ?? null);
        }
      } catch {
        // Silently fail — visitor counter is non-critical
        if (!cancelled) setCount(null);
      }
    }

    trackVisit();
    return () => { cancelled = true; };
  }, []);

  return { count };
}
