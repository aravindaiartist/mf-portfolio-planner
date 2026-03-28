import { useState, useEffect, useRef } from "react";

/**
 * Animate a number from its previous value to a new value.
 * Returns the current animated value.
 * @param target The target number to animate to
 * @param duration Animation duration in ms (default 600)
 */
export function useAnimatedNumber(target: number, duration: number = 600): number {
  const [display, setDisplay] = useState(target);
  const prevTarget = useRef(target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    prevTarget.current = target;

    if (from === to) return;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(to);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}
