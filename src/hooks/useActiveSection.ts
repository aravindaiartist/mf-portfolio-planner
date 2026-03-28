import { useState, useEffect, useRef } from "react";

/**
 * Track which section is currently in view using IntersectionObserver.
 * Returns the id of the currently active section.
 */
export function useActiveSection(sectionIds: readonly string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const entries = new Map<string, IntersectionObserverEntry>();

    observer.current = new IntersectionObserver(
      (observedEntries) => {
        observedEntries.forEach((entry) => {
          entries.set(entry.target.id, entry);
        });

        // Find the topmost visible section
        let topId = activeId;
        let topY = Infinity;
        entries.forEach((entry, id) => {
          if (entry.isIntersecting && entry.boundingClientRect.top < topY) {
            topY = entry.boundingClientRect.top;
            topId = id;
          }
        });

        if (topId !== activeId) {
          setActiveId(topId);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.current?.observe(el));

    return () => {
      observer.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds]);

  return activeId;
}
