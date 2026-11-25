import { useEffect, useState } from "react";

function AnimatedNumber({ value = 0, duration = 650, suffix = "", prefix = "" }) {
  const target = Number(value) || 0;
  const isFloat = !Number.isInteger(target);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let frameId;
    const start = performance.now();

    const tick = (now) => {
      if (prefersReduced) {
        setDisplay(target);
        return;
      }
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target * eased;
      setDisplay(isFloat ? Number(next.toFixed(1)) : Math.round(next));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, isFloat]);

  const shown = target === 0 ? 0 : display;

  return (
    <span>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

export default AnimatedNumber;
