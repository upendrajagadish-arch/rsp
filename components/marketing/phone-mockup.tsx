"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function PhoneMockup({
  children,
  className = "",
  contentH = 844,
}: {
  children: ReactNode;
  className?: string;
  contentH?: number;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(w / 390);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="phone-frame relative rounded-[clamp(30px,4vw,54px)] bg-black p-[clamp(6px,1vw,12px)] shadow-2xl shadow-black/60">
        <div className="pointer-events-none absolute inset-0 rounded-[clamp(30px,4vw,54px)] ring-1 ring-white/15" />

        {/* Side buttons */}
        <div className="absolute left-[-2px] top-[19%] h-[4.5%] w-[3px] rounded-r-sm bg-neutral-700" />
        <div className="absolute left-[-2px] top-[26%] h-[7.3%] w-[3px] rounded-r-sm bg-neutral-700" />
        <div className="absolute left-[-2px] top-[35.5%] h-[7.3%] w-[3px] rounded-r-sm bg-neutral-700" />
        <div className="absolute right-[-2px] top-[30.8%] h-[11.4%] w-[3px] rounded-l-sm bg-neutral-700" />

        <div
          ref={screenRef}
          className="relative h-full w-full overflow-hidden rounded-[clamp(24px,3.2vw,44px)] bg-[#0a0e1c]"
        >
          <div className="absolute left-1/2 top-[3%] z-50 h-[4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: 390,
              height: contentH,
              transform: `scale(${scale})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
