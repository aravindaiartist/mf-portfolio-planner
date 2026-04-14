import { useEffect, useState } from "react";

// counterapi.dev V1 — free, no-auth, CORS-enabled counter API
const COUNTER_URL =
  "https://api.counterapi.dev/v1/mf-portfolio-planner-aravindan/visitor-count";

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function trackVisit() {
      try {
        // Only increment once per browser session
        const sessionKey = "mfpp_visit_counted";
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        const action = alreadyCounted ? "get" : "up";
        if (!alreadyCounted) {
          sessionStorage.setItem(sessionKey, "1");
        }

        const res = await fetch(`${COUNTER_URL}/${action}`);
        if (!res.ok) throw new Error("CounterAPI error");
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
