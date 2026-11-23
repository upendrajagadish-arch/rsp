"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  GraduationCap,
  Monitor,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminOverviewMetrics, AdminStudentRow } from "@/lib/admin/types";
import { studentPhoto } from "@/lib/admin/student-photos";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function placementLabel(status: string) {
  return status.replaceAll("_", " ");
}

function CardShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-white/60 p-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-3xl ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminHrDashboard({
  metrics,
  userName,
  orgName,
  demo,
  roster,
}: {
  metrics: AdminOverviewMetrics;
  userName: string;
  orgName: string;
  demo?: boolean;
  roster: AdminStudentRow[];
}) {
  const [cohortOpen, setCohortOpen] = useState(false);
  const [chartMode, setChartMode] = useState<"year" | "skill" | "branch">("year");
  const cohortScrollRef = useRef<HTMLDivElement>(null);
  const firstName = userName.split(" ")[0] || userName;

  function scrollCohort(direction: "up" | "down") {
    cohortScrollRef.current?.scrollBy({
      top: direction === "down" ? 160 : -160,
      behavior: "smooth",
    });
  }

  const yearChart = useMemo(
    () =>
      metrics.byAcademicYear.map((row, i) => ({
        day: row.label.replace(" Year", ""),
        full: row.label,
        hours: row.count,
        highlight: i === metrics.byAcademicYear.length - 1,
      })),
    [metrics.byAcademicYear],
  );

  const skillChart = useMemo(
    () =>
      metrics.bySkill.slice(0, 7).map((row, i) => ({
        day: row.label.length > 8 ? `${row.label.slice(0, 7)}…` : row.label,
        full: row.label,
        hours: row.count,
        highlight: i === 0,
      })),
    [metrics.bySkill],
  );

  const branchChart = useMemo(
    () =>
      metrics.byBranch.slice(0, 7).map((row, i) => ({
        day: row.label.split(" ")[0],
        full: row.label,
        hours: row.count,
        highlight: i === 0,
      })),
    [metrics.byBranch],
  );

  const chartData =
    chartMode === "year" ? yearChart : chartMode === "skill" ? skillChart : branchChart;

  const maxSkill = Math.max(1, ...metrics.bySkill.map((s) => s.count));
  const verifiedRate = metrics.registeredStudents
    ? Math.round(
        ((metrics.certificatesInstitutionReviewed + metrics.certificatesIssuerVerified) /
          Math.max(1, metrics.registeredStudents)) *
          100,
      )
    : 0;

  const passportStamps = metrics.certificatesTotal ?? 0;
  const totalStudents = metrics.registeredStudents ?? roster.length;

  const profileCard = (
    <CardShell className="flex h-full min-h-[220px] flex-col justify-between gap-4 overflow-hidden lg:min-h-0">
      <div>
        <h3 className="text-lg text-[#303030]">Campus totals</h3>
        <p className="mt-1 text-xs text-[#898989]">
          Registered students and Skill Passport stamps
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 content-center sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="flex flex-col justify-center rounded-3xl bg-[#303030] px-5 py-6 text-white">
          <p className="text-xs uppercase tracking-wide text-white/55">Total students</p>
          <p className="mt-2 text-5xl leading-none tracking-tight">{totalStudents}</p>
        </div>
        <div className="flex flex-col justify-center rounded-3xl bg-[#FFD85F] px-5 py-6 text-[#303030]">
          <p className="text-xs uppercase tracking-wide text-[#303030]/65">
            Passport stamps
          </p>
          <p className="mt-2 text-5xl leading-none tracking-tight">{passportStamps}</p>
        </div>
      </div>
    </CardShell>
  );

  const activityCard = (
    <CardShell className="flex h-full min-h-[280px] flex-col gap-3 overflow-hidden lg:min-h-0">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h3 className="text-lg text-[#303030]">
          {chartMode === "year"
            ? "Year-wise"
            : chartMode === "skill"
              ? "Skill-wise"
              : "Branch-wise"}
        </h3>
        <div className="flex rounded-full border border-[#898989]/20 bg-white/70 p-0.5 text-[10px]">
          {(
            [
              ["year", "Year"],
              ["skill", "Skill"],
              ["branch", "Branch"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChartMode(id)}
              className={`rounded-full px-2.5 py-1 transition ${
                chartMode === id ? "bg-[#303030] text-white" : "text-[#898989]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3">
        <div>
          <p className="text-3xl leading-none text-[#303030]">{totalStudents}</p>
          <p className="mt-1 text-xs text-[#898989]">Total students</p>
        </div>
        <div>
          <p className="text-3xl leading-none text-[#303030]">{passportStamps}</p>
          <p className="mt-1 text-xs text-[#898989]">Passport stamps</p>
        </div>
      </div>
      <div className="h-44 min-h-[11rem] w-full min-w-0 flex-1 lg:h-auto">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <BarChart
            data={chartData}
            barCategoryGap="22%"
            margin={{ top: 12, right: 4, left: -8, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              tick={{ fill: "#898989", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fill: "#898989", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const v = payload[0].payload as {
                  full: string;
                  hours: number;
                };
                return (
                  <div className="rounded-full bg-[#FFD85F] px-3 py-1 text-xs text-[#303030] shadow-md">
                    {v.full}: {v.hours}
                  </div>
                );
              }}
            />
            <Bar dataKey="hours" radius={[6, 6, 6, 6]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`${entry.day}-${index}`}
                  fill={entry.highlight ? "#FFD85F" : "#303030"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );

  const skillsCard = (
    <CardShell className="flex h-full min-h-[280px] flex-col gap-3 overflow-hidden lg:min-h-0">
      <div className="flex shrink-0 items-center justify-between">
        <h3 className="text-lg text-[#303030]">Top skills</h3>
        <Link
          href="/admin/students"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
        >
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="shrink-0">
        <p className="text-4xl leading-none text-[#303030]">{metrics.bySkill.length}</p>
        <p className="mt-1 text-xs text-[#898989]">Distinct skills · scroll list</p>
      </div>
      <div className="admin-scroll mt-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {metrics.bySkill.map((skill) => (
          <div key={skill.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[#303030]">{skill.label}</span>
              <span className="text-[#898989]">{skill.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#898989]/15">
              <div
                className="h-full rounded-full bg-[#FFD85F]"
                style={{ width: `${(skill.count / Math.max(1, maxSkill)) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {!metrics.bySkill.length ? (
          <p className="text-sm text-[#898989]">No skills recorded yet.</p>
        ) : null}
      </div>
    </CardShell>
  );

  const actionsCard = (
    <CardShell className="flex h-full min-h-[320px] flex-col gap-3 overflow-hidden lg:min-h-0">
      <div className="flex shrink-0 items-end justify-between">
        <h3 className="text-lg text-[#303030]">Ops pulse</h3>
        <p className="text-4xl text-[#303030]">{verifiedRate}%</p>
      </div>
      <p className="shrink-0 text-xs text-[#898989]">
        Review coverage vs {totalStudents} students · {passportStamps} stamps
      </p>
      <div className="shrink-0">
        <div className="mb-1 flex gap-2 text-xs text-[#898989]">
          <span className="basis-[30%]">Pending</span>
          <span className="basis-[35%]">Active</span>
          <span className="basis-[35%]">Eligible</span>
        </div>
        <div className="flex gap-2">
          <div className="flex h-10 basis-[30%] items-center justify-center rounded-xl bg-[#FFD85F] text-sm">
            {metrics.certificatesPending}
          </div>
          <div className="flex h-10 basis-[35%] items-center justify-center rounded-xl bg-[#303030] text-sm text-white">
            {metrics.activeLearners}
          </div>
          <div className="flex h-10 basis-[35%] items-center justify-center rounded-xl bg-[#898989] text-sm text-white">
            {metrics.placementEligible}
          </div>
        </div>
      </div>
      <div className="admin-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-3xl bg-[#303030] p-4">
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <p className="text-base text-white">Pending actions</p>
          <Sparkles size={14} className="text-[#FFD85F]" />
        </div>
        {[
          {
            href: "/admin/verification-queue",
            title: "Certificate queue",
            meta: `${metrics.certificatesPending} pending`,
            done: metrics.certificatesPending === 0,
          },
          {
            href: "/admin/students?needsSupport=true",
            title: "Students needing support",
            meta: `${metrics.needingSupport} flagged`,
            done: metrics.needingSupport === 0,
          },
          {
            href: "/admin/students?placementStatus=eligible",
            title: "Placement-ready students",
            meta: `${metrics.placementEligible} eligible`,
            done: false,
          },
          {
            href: "/admin/analytics",
            title: "Training & assessments",
            meta: `${metrics.trainingCompleting} trained · ${metrics.assessmentCompleted} assessed`,
            done: false,
          },
        ].map((task) => (
          <Link
            key={task.title}
            href={task.href}
            className="flex items-center gap-3 border-b border-white/5 py-2.5 last:border-0"
          >
            <span className="min-w-0 flex-1">
              <p
                className={`truncate text-sm ${
                  task.done ? "text-white/30 line-through" : "text-white"
                }`}
              >
                {task.title}
              </p>
              <p className="text-xs text-white/35">{task.meta}</p>
            </span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                task.done ? "bg-[#FFD85F]" : "border border-white/20"
              }`}
            >
              {task.done ? <Check size={10} className="text-[#303030]" /> : null}
            </span>
          </Link>
        ))}
      </div>
    </CardShell>
  );

  const accordionCard = (
    <>
      <button
        type="button"
        onClick={() => setCohortOpen(true)}
        className="flex h-full min-h-[220px] w-full flex-col justify-between gap-4 rounded-3xl bg-white/60 p-5 text-left shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-3xl transition hover:bg-white/80 lg:min-h-0"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg text-[#303030]">Year & cohort breakdown</h3>
            <p className="mt-1 text-xs text-[#898989]">
              {totalStudents} students · click to open full detail
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#303030] text-white">
            <ArrowUpRight size={14} />
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {metrics.byAcademicYear.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-[#898989]/15 bg-white/80 px-2 py-3 text-center"
            >
              <p className="text-[10px] uppercase tracking-wide text-[#898989]">
                {row.label.replace(" Year", "")}
              </p>
              <p className="mt-1 text-2xl leading-none text-[#303030]">{row.count}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-[#303030] px-2 py-2.5 text-white">
            <p className="text-[10px] text-white/55">Skills</p>
            <p className="text-lg leading-none">{metrics.bySkill.length}</p>
          </div>
          <div className="rounded-2xl bg-[#FFD85F] px-2 py-2.5 text-[#303030]">
            <p className="text-[10px] text-[#303030]/65">Batches</p>
            <p className="text-lg leading-none">{metrics.byBatch.length}</p>
          </div>
          <div className="rounded-2xl border border-[#898989]/25 bg-white/70 px-2 py-2.5">
            <p className="text-[10px] text-[#898989]">Support</p>
            <p className="text-lg leading-none text-[#303030]">{metrics.needingSupport}</p>
          </div>
        </div>
      </button>

      <Dialog open={cohortOpen} onOpenChange={setCohortOpen}>
        <DialogContent
          className="flex max-h-[min(82vh,640px)] w-[min(94vw,560px)] flex-col overflow-hidden border border-[#898989]/20 p-0 text-[#303030] shadow-[0_30px_80px_rgba(0,0,0,0.25)] [&_button[aria-label=Close]]:bg-black/10 [&_button[aria-label=Close]]:text-[#303030]"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 0%, #fff7d6 0%, #f4f5f6 55%, #e8eaeb 100%)",
          }}
        >
          <DialogHeader className="shrink-0 border-b border-[#898989]/15 pb-3">
            <DialogTitle className="text-[#303030]">Year & cohort breakdown</DialogTitle>
            <DialogDescription className="text-[#898989]">
              Compact counts · use scroll buttons for more
            </DialogDescription>
          </DialogHeader>

          <div className="relative min-h-0 flex-1">
            <div
              ref={cohortScrollRef}
              className="admin-scroll max-h-[min(58vh,440px)] space-y-4 overflow-y-auto px-6 py-3 pr-14"
            >
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-[#303030]">Years</h4>
                  <span className="text-xs text-[#898989]">{totalStudents} total</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {metrics.byAcademicYear.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl border border-[#898989]/15 bg-white/85 px-2 py-2.5 text-center"
                    >
                      <p className="text-[10px] text-[#898989]">
                        {row.label.replace(" Year", "")}
                      </p>
                      <p className="mt-1 text-xl leading-none text-[#303030]">{row.count}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-[#303030]">Top skills</h4>
                  <span className="text-xs text-[#898989]">
                    {Math.min(6, metrics.bySkill.length)} of {metrics.bySkill.length}
                  </span>
                </div>
                <div className="space-y-1.5 rounded-xl border border-[#898989]/15 bg-white/85 p-3">
                  {metrics.bySkill.slice(0, 6).map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[6.5rem_1fr_1.75rem] items-center gap-2 text-xs"
                    >
                      <span className="truncate text-[#303030]">{row.label}</span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#898989]/15">
                        <div
                          className="h-full rounded-full bg-[#303030]"
                          style={{
                            width: `${(row.count / Math.max(1, maxSkill)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-right font-medium text-[#303030]">{row.count}</span>
                    </div>
                  ))}
                  {!metrics.bySkill.length ? (
                    <p className="text-xs text-[#898989]">No skill data yet.</p>
                  ) : null}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-3">
                <section>
                  <h4 className="mb-2 text-sm font-medium text-[#303030]">Batches</h4>
                  <div className="space-y-1 rounded-xl border border-[#898989]/15 bg-white/85 p-3">
                    {metrics.byBatch.slice(0, 4).map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-[#898989]">{row.label}</span>
                        <span className="font-medium text-[#303030]">{row.count}</span>
                      </div>
                    ))}
                    {!metrics.byBatch.length ? (
                      <p className="text-xs text-[#898989]">No batches</p>
                    ) : null}
                  </div>
                </section>

                <section>
                  <h4 className="mb-2 text-sm font-medium text-[#303030]">Placement</h4>
                  <div className="space-y-1 rounded-xl border border-[#898989]/15 bg-white/85 p-3">
                    {metrics.byPlacement.slice(0, 5).map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate capitalize text-[#898989]">
                          {placementLabel(row.label)}
                        </span>
                        <span className="font-medium text-[#303030]">{row.count}</span>
                      </div>
                    ))}
                    {!metrics.byPlacement.length ? (
                      <p className="text-xs text-[#898989]">No placement</p>
                    ) : null}
                  </div>
                </section>
              </div>
            </div>

            <div className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col gap-2">
              <button
                type="button"
                onClick={() => scrollCohort("up")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#898989]/25 bg-white/95 text-[#303030] shadow-md transition hover:bg-[#FFD85F]"
                aria-label="Scroll up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCohort("down")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#898989]/25 bg-[#303030] text-white shadow-md transition hover:bg-[#FFD85F] hover:text-[#303030]"
                aria-label="Scroll down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <DialogBody className="shrink-0 border-t border-[#898989]/15 py-3">
            <p className="text-center text-[11px] text-[#898989]">
              Showing condensed counts · scroll for the rest of the panel
            </p>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );

  const rosterCard = (
    <CardShell className="flex h-full min-h-[320px] flex-col overflow-hidden lg:min-h-0">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <h3 className="text-lg text-[#303030]">Student roster</h3>
          <p className="text-xs text-[#898989]">
            {roster.length || totalStudents} students · scroll to browse all
          </p>
        </div>
        <Link
          href="/admin/students"
          className="rounded-full border border-[#898989]/25 px-4 py-1 text-sm"
        >
          Directory
        </Link>
      </div>
      <div className="admin-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {(roster.length ? roster : []).map((student, i) => (
          <Link
            key={student.id}
            href={`/admin/students/${student.id}`}
            className="flex items-center gap-3 rounded-2xl border border-[#898989]/15 bg-white/50 px-3 py-2.5 transition hover:bg-white/90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={studentPhoto(student, i)}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-[#303030]">{student.name}</p>
                {student.needsSupport ? (
                  <span className="rounded-full bg-[#FFD85F] px-2 py-0.5 text-[10px] text-[#303030]">
                    Support
                  </span>
                ) : null}
              </div>
              <p className="truncate text-xs text-[#898989]">
                {student.academicYear} · {student.branch} · Class of{" "}
                {student.graduationYear}
              </p>
              <p className="truncate text-[11px] text-[#898989]/80">
                {student.skills.slice(0, 4).join(" · ") || "No skills listed"}
                {" · "}
                {student.certificateStats.total} stamps
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm text-[#303030]">{student.cgpa.toFixed(1)}</p>
              <p className="text-[10px] capitalize text-[#898989]">
                {placementLabel(student.placementStatus)}
              </p>
            </div>
          </Link>
        ))}
        {!roster.length ? (
          <p className="py-8 text-center text-sm text-[#898989]">
            No roster rows in this mode yet.
          </p>
        ) : null}
      </div>
      {demo ? (
        <p className="mt-2 shrink-0 text-[11px] text-[#898989]">
          Demo roster · {orgName} · issuer-verified stays 0 without adapters
        </p>
      ) : null}
    </CardShell>
  );

  const welcome = (
    <div className="mb-3 flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-[3]">
        <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#898989]">{orgName} · student intelligence</p>
        <div className="mt-3 flex w-full gap-2">
          <div className="min-w-0 flex-[22]">
            <p className="mb-1 text-xs">Total students</p>
            <div className="rounded-full bg-[#303030] px-2 py-2 text-center text-xs text-white sm:text-sm">
              {totalStudents}
            </div>
          </div>
          <div className="min-w-0 flex-[22]">
            <p className="mb-1 text-xs">Passport stamps</p>
            <div className="rounded-full bg-[#FFD85F] px-2 py-2 text-center text-xs sm:text-sm">
              {passportStamps} certs
            </div>
          </div>
          <div className="min-w-0 flex-[36]">
            <p className="mb-1 text-xs">All 4 years</p>
            <div
              className="truncate rounded-full border border-[#ddd] px-2 py-2 text-center text-xs sm:text-sm"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, #e5e5e5 0px, #e5e5e5 2px, #f5f5f5 2px, #f5f5f5 10px)",
              }}
            >
              {metrics.byAcademicYear
                .map((y) => `${y.label.split(" ")[0]}:${y.count}`)
                .join(" · ") || "1st:0 · 2nd:0 · 3rd:0 · 4th:0"}
            </div>
          </div>
          <div className="min-w-0 flex-[20]">
            <p className="mb-1 text-xs">Support</p>
            <div className="rounded-full border border-[#898989]/40 bg-white/60 px-2 py-2 text-center text-xs sm:text-sm">
              {metrics.needingSupport}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-[2] flex-wrap gap-4 sm:gap-5">
        <div>
          <div className="mb-1 w-fit rounded-lg bg-[#898989]/15 p-1.5 text-[#898989]">
            <Users size={14} />
          </div>
          <p className="text-3xl leading-none sm:text-4xl">{totalStudents}</p>
          <p className="text-xs">Total students</p>
        </div>
        <div>
          <div className="mb-1 w-fit rounded-lg bg-[#898989]/15 p-1.5 text-[#898989]">
            <FileCheck2 size={14} />
          </div>
          <p className="text-3xl leading-none sm:text-4xl">{passportStamps}</p>
          <p className="text-xs">Skill Passport stamps</p>
        </div>
        <div>
          <div className="mb-1 w-fit rounded-lg bg-[#898989]/15 p-1.5 text-[#898989]">
            <GraduationCap size={14} />
          </div>
          <p className="text-3xl leading-none sm:text-4xl">{metrics.activeLearners}</p>
          <p className="text-xs">Active learners</p>
        </div>
        <div>
          <div className="mb-1 w-fit rounded-lg bg-[#898989]/15 p-1.5 text-[#898989]">
            <Monitor size={14} />
          </div>
          <p className="text-3xl leading-none sm:text-4xl">
            {metrics.bySkill[0]?.count ?? 0}
          </p>
          <p className="max-w-[7rem] truncate text-xs">
            Top skill · {metrics.bySkill[0]?.label ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col text-[#303030]">
      <div className="hidden h-full min-h-0 flex-col lg:flex">
        {welcome}
        <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-2">
          <div className="min-h-0 overflow-hidden">{profileCard}</div>
          <div className="min-h-0 overflow-hidden">{activityCard}</div>
          <div className="min-h-0 overflow-hidden">{skillsCard}</div>
          <div className="row-span-2 min-h-0 overflow-hidden">{actionsCard}</div>
          <div className="min-h-0 overflow-hidden">{accordionCard}</div>
          <div className="col-span-2 min-h-0 overflow-hidden">{rosterCard}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {welcome}
        <div className="flex flex-col gap-3 md:hidden">
          <div className="max-h-[420px]">{profileCard}</div>
          <div className="max-h-[420px]">{activityCard}</div>
          <div className="max-h-[360px]">{skillsCard}</div>
          <div className="max-h-[420px]">{actionsCard}</div>
          <div className="max-h-[420px]">{accordionCard}</div>
          <div className="max-h-[480px]">{rosterCard}</div>
        </div>
        <div className="hidden grid-cols-2 gap-3 md:grid lg:hidden">
          <div className="max-h-[420px]">{profileCard}</div>
          <div className="max-h-[420px]">{activityCard}</div>
          <div className="max-h-[360px]">{skillsCard}</div>
          <div className="max-h-[420px]">{accordionCard}</div>
          <div className="col-span-2 max-h-[480px]">{rosterCard}</div>
          <div className="col-span-2 max-h-[420px]">{actionsCard}</div>
        </div>
      </div>
    </div>
  );
}
