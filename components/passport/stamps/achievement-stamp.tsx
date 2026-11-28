"use client";

import type { AchievementStatus } from "@/lib/passport/types";

type Props = {
  title: string;
  colour: string;
  status: AchievementStatus;
  size?: number;
  monochrome?: boolean;
  className?: string;
};

export function AchievementStamp({
  title,
  colour,
  status,
  size = 112,
  monochrome = false,
  className = "",
}: Props) {
  const stroke = monochrome ? "#17283D" : colour;
  const fill =
    status === "verified"
      ? monochrome
        ? "rgba(23,40,61,0.06)"
        : `${colour}22`
      : status === "submitted"
        ? "rgba(182,154,89,0.12)"
        : "transparent";
  const opacity = status === "locked" || status === "revoked" ? 0.35 : 1;
  const short =
    title.length > 28 ? `${title.slice(0, 26)}…` : title;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={{ opacity }}
      aria-hidden={status === "locked"}
    >
      <circle cx="60" cy="60" r="56" fill={fill} stroke={stroke} strokeWidth="2.2" />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray={status === "locked" ? "3 3" : undefined}
      />
      <circle cx="60" cy="60" r="38" fill="none" stroke={stroke} strokeWidth="0.75" />
      {/* crest mark */}
      <path
        d="M60 32 L72 42 L68 58 L60 66 L52 58 L48 42 Z"
        fill={status === "verified" ? stroke : "none"}
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <text
        x="60"
        y="88"
        textAnchor="middle"
        fill={stroke}
        style={{ fontSize: 7.2, fontFamily: "Georgia, serif", letterSpacing: "0.04em" }}
      >
        {short.toUpperCase()}
      </text>
      {status === "submitted" ? (
        <text
          x="60"
          y="98"
          textAnchor="middle"
          fill="#B69A59"
          style={{ fontSize: 6, fontFamily: "system-ui, sans-serif" }}
        >
          PENDING
        </text>
      ) : null}
    </svg>
  );
}
