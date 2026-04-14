import { useEffect, useState } from "react";

const NAMESPACE = "mf-portfolio-planner-aravindan";
const KEY = "visitor-count";
// Using counterapi.dev V1 — free, no-auth, no-backend visitor counter
const API_BASE = "https://api.counterapi.dev/v1";

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function trackVisit() {
      try {
        // Only increment once per browser session (not on every re-render / HMR reload)
        const sessionKey = "mfpp_visit_counted";
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        let url: string;
        if (alreadyCounted) {
          // Just read the current count without incrementing
          url = `${API_BASE}/${NAMESPACE}/${KEY}/get`;
        } else {
          // Increment + read
          url = `${API_BASE}/${NAMESPACE}/${KEY}/up`;
          sessionStorage.setItem(sessionKey, "1");
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("CounterAPI error");
        const data = await res.json();

        if (!cancelled) {
          // counterapi.dev returns { value: number }
          setCount(data.value ?? data.count ?? null);
        }
      } catch {
        // Silently fail — visitor counter is non-critical
        if (!cancelled) setCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    trackVisit();
    return () => { cancelled = true; };
  }, []);

  return { count, loading };
}
