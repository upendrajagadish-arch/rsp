"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, delayMs: number, durationMs = 2200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    let startAt = 0;
    const timeout = window.setTimeout(() => {
      startAt = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - startAt) / durationMs);
        setValue(Math.round(easeOutCubic(t) * target));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, delayMs, durationMs]);

  return value;
}
