"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/utils";

export type CircuitEvidence = {
  kind: "certificate" | "skill" | "project";
  title: string;
  detail?: string;
  submittedAt?: string | null;
  status?: string;
};

export type CircuitCheckpoint = {
  id: string;
  title: string;
  summary: string;
  status: string;
  progressPercent: number;
  evidence: CircuitEvidence[];
};

/** Wide horizontal circuit — grows sideways, stays short. */
const CIRCUIT_PATH =
  "M 36 118 C 90 118, 110 42, 180 42 C 250 42, 270 150, 340 150 C 410 150, 430 42, 500 42 C 570 42, 600 118, 656 118";

const CHECKPOINT_OFFSETS = [0.08, 0.26, 0.44, 0.62, 0.8, 0.94];
const SEGMENT_MS = 1000;

function statusColor(status: string, progress: number) {
  if (status === "completed" || progress >= 100) return "#c6ff2e";
  if (status === "in_progress" || progress > 0) return "#3fd8ff";
  return "rgba(255,255,255,0.72)";
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function JourneyCircuitMap({
  pathTitle,
  coveragePercent,
  checkpoints,
}: {
  pathTitle: string;
  coveragePercent: number;
  checkpoints: CircuitCheckpoint[];
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const stageRefIdx = useRef(0);
  const bumpRef = useRef(0);

  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [pathLen, setPathLen] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState({ x: 16, y: 8 });
  const [stageIndex, setStageIndex] = useState(0);
  const [traveler, setTraveler] = useState<{ x: number; y: number } | null>(null);
  const [drawnLen, setDrawnLen] = useState(0);
  const [running, setRunning] = useState(false);
  const [runEpoch, setRunEpoch] = useState(0);

  const nodes = useMemo(() => {
    return checkpoints.slice(0, CHECKPOINT_OFFSETS.length).map((cp, i) => ({
      ...cp,
      offset: CHECKPOINT_OFFSETS[i] ?? (i + 1) / (checkpoints.length + 1),
    }));
  }, [checkpoints]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setPathLen(total);
    setPoints(
      nodes.map((n) => {
        const p = path.getPointAtLength(total * n.offset);
        return { x: p.x, y: p.y };
      }),
    );
    if (nodes[0]) {
      const start = path.getPointAtLength(total * nodes[0].offset);
      setTraveler({ x: start.x, y: start.y });
      setDrawnLen(total * nodes[0].offset);
      stageRefIdx.current = 0;
    }
  }, [nodes]);

  const active = nodes.find((n) => n.id === activeId) ?? null;

  function placeTip(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const tipW = 260;
    const tipH = 140;
    setTipPos({
      x: Math.min(Math.max(8, localX + 14), rect.width - tipW - 8),
      y: Math.min(Math.max(6, localY - tipH - 8), rect.height - tipH - 6),
    });
  }

  const animateSegment = useCallback(
    (fromIdx: number, toIdx: number): Promise<void> => {
      const path = pathRef.current;
      if (!path || !nodes.length || pathLen <= 0) return Promise.resolve();

      if (animRef.current) cancelAnimationFrame(animRef.current);

      const fromOffset = nodes[fromIdx]?.offset ?? 0;
      const toOffset = nodes[toIdx]?.offset ?? 1;
      const wrapping = toIdx <= fromIdx && !(fromIdx === 0 && toIdx === 0);

      const move = (a: number, b: number) =>
        new Promise<void>((resolve) => {
          const start = performance.now();
          const tick = (now: number) => {
            if (bumpRef.current) {
              // Interrupted by a click-advance
              resolve();
              return;
            }
            const t = Math.min(1, (now - start) / SEGMENT_MS);
            const e = easeInOut(t);
            const len = a + (b - a) * e;
            const clamped = Math.min(Math.max(len, 0), pathLen);
            const pt = path.getPointAtLength(clamped);
            setTraveler({ x: pt.x, y: pt.y });
            setDrawnLen(clamped);
            if (t < 1) {
              animRef.current = requestAnimationFrame(tick);
            } else {
              resolve();
            }
          };
          animRef.current = requestAnimationFrame(tick);
        });

      if (wrapping) {
        return move(pathLen * fromOffset, pathLen * 0.998).then(() => {
          if (bumpRef.current) return;
          const startLen = pathLen * (nodes[0]?.offset ?? 0.08);
          const startPt = path.getPointAtLength(startLen);
          setTraveler({ x: startPt.x, y: startPt.y });
          setDrawnLen(startLen);
          return move(startLen, pathLen * toOffset);
        });
      }

      return move(pathLen * fromOffset, pathLen * toOffset);
    },
    [nodes, pathLen],
  );

  // Continuous stage-to-stage loop
  useEffect(() => {
    if (!running || !nodes.length || pathLen <= 0) return;

    let cancelled = false;

    const loop = async () => {
      while (!cancelled && runningRef.current) {
        bumpRef.current = 0;
        const from = stageRefIdx.current;
        const to = (from + 1) % nodes.length;
        setStageIndex(to);
        setActiveId(nodes[to]?.id ?? null);
        await animateSegment(from, to);
        if (cancelled || !runningRef.current) break;
        stageRefIdx.current = to;
        await new Promise((r) => setTimeout(r, 180));
      }
    };

    void loop();

    return () => {
      cancelled = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [running, runEpoch, nodes, pathLen, animateSegment]);

  function startOrAdvance() {
    if (!nodes.length) return;
    if (!running) {
      runningRef.current = true;
      setRunning(true);
      setRunEpoch((n) => n + 1);
      return;
    }
    // Click while running → skip ahead to next stage now
    bumpRef.current = 1;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = stageRefIdx.current;
    const to = (from + 1) % nodes.length;
    stageRefIdx.current = to;
    setStageIndex(to);
    setActiveId(nodes[to]?.id ?? null);
    const path = pathRef.current;
    if (path && pathLen) {
      const len = pathLen * (nodes[to]?.offset ?? 0);
      const pt = path.getPointAtLength(len);
      setTraveler({ x: pt.x, y: pt.y });
      setDrawnLen(len);
    }
    setRunEpoch((n) => n + 1);
  }

  function goToStage(index: number) {
    if (!nodes[index]) return;
    bumpRef.current = 1;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = stageRefIdx.current;
    stageRefIdx.current = index;
    setStageIndex(index);
    setActiveId(nodes[index].id);
    runningRef.current = true;
    setRunning(true);
    // Animate once then resume loop from there
    void animateSegment(from, index).then(() => {
      stageRefIdx.current = index;
      setRunEpoch((n) => n + 1);
    });
  }

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="truncate text-[13px] tracking-tight text-white/50">{pathTitle}</p>
        <p className="shrink-0 text-[13px] tracking-tight text-white/45">
          Coverage <span className="font-semibold text-[var(--lime)]">{coveragePercent}%</span>
          {running ? (
            <button
              type="button"
              className="ml-3 text-[12px] text-white/40 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                runningRef.current = false;
                setRunning(false);
                bumpRef.current = 1;
                if (animRef.current) cancelAnimationFrame(animRef.current);
              }}
            >
              Pause
            </button>
          ) : null}
        </p>
      </div>

      <div
        ref={stageRef}
        className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 pb-5 pt-3 backdrop-blur-md"
        onMouseLeave={() => setActiveId(null)}
        onClick={startOrAdvance}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startOrAdvance();
          }
        }}
        aria-label="Animate journey road between stages. Click to start or advance."
      >
        <svg
          viewBox="0 24 700 150"
          className="mx-auto h-[200px] w-full"
          role="img"
          aria-label="Student journey circuit"
        >
          <defs>
            <linearGradient id="circuitGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c6ff2e" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#3fd8ff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#079b83" stopOpacity="0.45" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="travelerGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={CIRCUIT_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="16"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d={CIRCUIT_PATH}
            fill="none"
            stroke="url(#circuitGlow)"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#softGlow)"
            opacity={0.28}
          />
          <path
            d={CIRCUIT_PATH}
            fill="none"
            stroke="url(#circuitGlow)"
            strokeWidth="4.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#softGlow)"
            strokeDasharray={pathLen || 1}
            strokeDashoffset={Math.max(0, (pathLen || 1) - drawnLen)}
          />

          <rect x="28" y="108" width="11" height="18" rx="2" fill="rgba(255,255,255,0.9)" />
          <text
            x="46"
            y="121"
            fill="rgba(255,255,255,0.55)"
            fontSize="11"
            fontWeight="600"
            letterSpacing="0.08em"
            fontFamily="Albert Sans, Manrope, sans-serif"
          >
            START
          </text>

          {nodes.map((node, index) => {
            const pt = points[index];
            if (!pt) return null;
            const color = statusColor(node.status, node.progressPercent);
            const isHover = activeId === node.id;
            const isCurrent = stageIndex === index;
            const r = isCurrent || isHover ? 15 : 13;
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  setActiveId(node.id);
                  placeTip(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => placeTip(e.clientX, e.clientY)}
                onClick={(e) => {
                  e.stopPropagation();
                  goToStage(index);
                }}
              >
                <circle cx={pt.x} cy={pt.y} r="24" fill="transparent" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={r}
                  fill="#0a0e1c"
                  stroke={isCurrent ? "#c6ff2e" : color}
                  strokeWidth={isCurrent || isHover ? 3 : 2.5}
                  style={{
                    filter:
                      isCurrent || isHover
                        ? "drop-shadow(0 0 8px rgba(198,255,46,0.7))"
                        : undefined,
                  }}
                />
                <text
                  x={pt.x}
                  y={pt.y + 5}
                  textAnchor="middle"
                  fill={isCurrent ? "#c6ff2e" : "#f4f6fa"}
                  fontSize="14"
                  fontWeight="700"
                  letterSpacing="-0.045em"
                  fontFamily="Albert Sans, Manrope, sans-serif"
                >
                  {index + 1}
                </text>
              </g>
            );
          })}

          {traveler ? (
            <g filter="url(#travelerGlow)">
              <circle cx={traveler.x} cy={traveler.y} r="8" fill="#c6ff2e" />
              <circle cx={traveler.x} cy={traveler.y} r="3.5" fill="#0a0e1c" />
            </g>
          ) : null}
        </svg>

        {active ? (
          <div
            className="pointer-events-none absolute z-20 w-[260px] overflow-hidden rounded-xl border border-white/15 bg-[#0a0e1c]/95 p-3 shadow-xl backdrop-blur-md"
            style={{ left: tipPos.x, top: tipPos.y }}
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--lime)]">
              Sector {nodes.findIndex((n) => n.id === active.id) + 1}
            </p>
            <p className="mt-1 text-[15px] font-semibold leading-tight tracking-[-0.03em] text-white">
              {active.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug tracking-tight text-white/50">
              {active.summary}
            </p>
            <p className="mt-1.5 text-[11px] capitalize tracking-tight text-white/35">
              {active.status.replaceAll("_", " ")} · {active.progressPercent}%
            </p>
            <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
              {(active.evidence.length ? active.evidence.slice(0, 2) : []).map((ev, i) => (
                <div key={`${ev.kind}-${ev.title}-${i}`} className="text-[11px] leading-snug">
                  <p className="line-clamp-1 font-medium tracking-tight text-white/85">
                    <span className="uppercase tracking-wide text-white/35">{ev.kind} · </span>
                    {ev.title}
                  </p>
                  {ev.submittedAt ? (
                    <p className="text-white/35">Submitted {formatDate(ev.submittedAt)}</p>
                  ) : null}
                </div>
              ))}
              {!active.evidence.length ? (
                <p className="text-[11px] text-white/40">No submissions yet.</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute bottom-2 left-4 right-4 flex justify-between text-[11px] tracking-tight text-white/40">
            <span>Foundations</span>
            <span className="text-[var(--lime)]">
              {running ? "Traveling…" : "Click road to race stages"}
            </span>
            <span>Evidence</span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] tracking-tight text-white/45">
        <LegendDot color="#c6ff2e" label="Completed" />
        <LegendDot color="#3fd8ff" label="In progress" />
        <LegendDot color="rgba(255,255,255,0.55)" label="Ahead" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
