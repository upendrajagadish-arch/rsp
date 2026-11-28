"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PassportPageContent } from "@/components/passport/passport-page-content";
import type { PassportPageDef } from "@/lib/passport/page-map";
import type { PassportAchievement, SkillPassportBundle } from "@/lib/passport/types";
import { cn } from "@/lib/utils";

type Spread = { left: PassportPageDef; right?: PassportPageDef };

type Props = {
  spreads: Spread[];
  spreadIndex: number;
  bundle: SkillPassportBundle;
  onOpenAchievement: (a: PassportAchievement | null, lockedCode?: string) => void;
  onSpreadChange: (index: number) => void;
};

/**
 * Reliable open-book spread: always mounts the current left/right pages so
 * identity, stamps, and QR details stay visible. Soft paper-turn motion on change.
 */
export function PassportBook({
  spreads,
  spreadIndex,
  bundle,
  onOpenAchievement,
  onSpreadChange,
}: Props) {
  const reduce = useReducedMotion();
  const [turning, setTurning] = useState(false);
  const touchX = useRef<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const prevIndex = useRef(spreadIndex);

  useEffect(() => {
    if (spreadIndex === prevIndex.current) return;
    dirRef.current = spreadIndex > prevIndex.current ? 1 : -1;
    prevIndex.current = spreadIndex;
    if (reduce) return;
    setTurning(true);
    const t = window.setTimeout(() => setTurning(false), 650);
    return () => window.clearTimeout(t);
  }, [spreadIndex, reduce]);

  function turn(dir: -1 | 1) {
    if (turning && !reduce) return;
    const next = Math.min(spreads.length - 1, Math.max(0, spreadIndex + dir));
    if (next !== spreadIndex) onSpreadChange(next);
  }

  const current = spreads[spreadIndex];

  return (
    <div
      className="sp-flip-stage"
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (dx < -48) turn(1);
        if (dx > 48) turn(-1);
        touchX.current = null;
      }}
    >
      {/* Desktop / tablet open book — exact current spread only */}
      <div className="sp-flip-desktop">
        <div className={cn("sp-spread-book", turning && "is-turning")}>
          <div className="sp-flip-spine" aria-hidden />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`spread-${spreadIndex}`}
              className="sp-spread-pages"
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0.35,
                      rotateY: dirRef.current > 0 ? -8 : 8,
                    }
              }
              animate={{ opacity: 1, rotateY: 0 }}
              exit={
                reduce
                  ? undefined
                  : {
                      opacity: 0,
                      rotateY: dirRef.current > 0 ? 10 : -10,
                      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                    }
              }
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="sp-spread-page sp-spread-page-left">
                <PassportPageContent
                  def={current.left}
                  bundle={bundle}
                  onOpenAchievement={onOpenAchievement}
                />
              </div>
              <div className="sp-spread-page sp-spread-page-right">
                {current.right ? (
                  <PassportPageContent
                    def={current.right}
                    bundle={bundle}
                    onOpenAchievement={onOpenAchievement}
                  />
                ) : (
                  <div className="sp-page-sheet skill-passport-paper h-full border border-[#D8C398]/40" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Decorative turning edge while paging */}
          {turning && !reduce ? (
            <div
              className={cn(
                "sp-turn-sheen",
                dirRef.current > 0 ? "sp-turn-sheen-next" : "sp-turn-sheen-prev",
              )}
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      {/* Mobile stacked sheets */}
      <div className="sp-flip-mobile">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={spreadIndex}
            className="sp-flip-mobile-sheet"
            initial={
              reduce
                ? false
                : {
                    opacity: 0.5,
                    x: dirRef.current > 0 ? 36 : -36,
                    rotate: dirRef.current > 0 ? 2 : -2,
                  }
            }
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={
              reduce
                ? undefined
                : {
                    opacity: 0,
                    x: dirRef.current > 0 ? -70 : 70,
                    rotate: dirRef.current > 0 ? -4 : 4,
                    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                  }
            }
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <PassportPageContent
              def={current.left}
              bundle={bundle}
              onOpenAchievement={onOpenAchievement}
            />
            {current.right ? (
              <div className="mt-3">
                <PassportPageContent
                  def={current.right}
                  bundle={bundle}
                  onOpenAchievement={onOpenAchievement}
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
