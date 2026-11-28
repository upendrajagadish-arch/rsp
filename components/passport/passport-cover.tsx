"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  organizationName: string;
  passportNumber: string;
  batchLabel: string;
  opening?: boolean;
  onRequestOpen: () => void;
  onOpened: () => void;
};

export function PassportCover({
  organizationName,
  passportNumber,
  batchLabel,
  opening = false,
  onRequestOpen,
  onOpened,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="sp-cover-stage">
      <motion.div
        data-sp-motion
        className="skill-passport-cover skill-passport-page-shadow sp-cover-board relative mx-auto flex aspect-[3/4] w-full max-w-md flex-col justify-between overflow-hidden rounded-sm p-8 sm:p-10"
        style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
        initial={false}
        animate={
          opening && !reduce
            ? {
                rotateY: -112,
                opacity: 0.12,
                boxShadow: "-20px 18px 48px rgba(8,24,45,0.28)",
              }
            : {
                rotateY: 0,
                opacity: 1,
                boxShadow: "0 16px 44px rgba(8,24,45,0.2)",
              }
        }
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        onAnimationComplete={() => {
          if (opening) onOpened();
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(216,195,152,0.35) 11px, rgba(216,195,152,0.35) 12px)",
          }}
        />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#D8C398]/80">
            {organizationName}
          </p>
          <div className="mt-6 flex justify-center">
            <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
              <circle cx="36" cy="36" r="34" fill="none" stroke="#B69A59" strokeWidth="1.5" />
              <circle cx="36" cy="36" r="26" fill="none" stroke="#D8C398" strokeWidth="0.8" />
              <path
                d="M36 16 L48 28 L44 44 L36 52 L28 44 L24 28 Z"
                fill="none"
                stroke="#B69A59"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="sp-serif mt-6 text-center text-3xl tracking-wide text-[#D8C398] sm:text-4xl">
            Skill Passport
          </h1>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.22em] text-[#B69A59]">
            Smart Skill Passport
          </p>
        </div>

        <div className="relative space-y-4 text-center">
          <p className="sp-serif text-sm italic leading-relaxed text-[#D8C398]/90">
            Every skill earns a stamp. Every stamp tells your story.
          </p>
          <div className="mx-auto h-px w-24 bg-[#B69A59]/50" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#D8C398]/70">
            Academic batch · {batchLabel}
          </p>
          <p className="font-mono text-xs tracking-wider text-[#B69A59]">{passportNumber}</p>
          <button
            type="button"
            onClick={onRequestOpen}
            disabled={opening}
            className="mt-2 inline-flex items-center justify-center border border-[#B69A59] bg-transparent px-6 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#D8C398] transition hover:bg-[#B69A59]/15 disabled:opacity-50"
          >
            Open Passport
          </button>
        </div>
      </motion.div>
      <motion.div
        className="sp-cover-shadow"
        aria-hidden
        animate={opening && !reduce ? { opacity: 0, scaleX: 0.55 } : { opacity: 0.65, scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </div>
  );
}
