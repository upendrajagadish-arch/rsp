"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminOverviewMetrics, AdminStudentRow } from "@/lib/admin/types";
import { ACADEMIC_YEARS } from "@/lib/demo/admin-intelligence";
import { AdminGlass, AdminPageTitle } from "@/components/admin/admin-theme-shell";
import { cn } from "@/lib/utils";

const COLORS = ["#303030", "#FFD85F", "#898989", "#5c5c5c", "#f0c94a", "#E3E5E6", "#6b6b6b"];

type Tab = "overview" | "cohort" | "skills" | "certs" | "placement";
type ChartStyle = "bars" | "area" | "radar" | "donut";

function tipStyle(dark = false) {
  return {
    borderRadius: 16,
    border: "none",
    background: dark ? "#303030" : "#FFD85F",
    color: dark ? "#fff" : "#303030",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    fontSize: 12,
  };
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-[#303030] text-white"
          : "border border-[#898989]/25 bg-white/70 text-[#898989] hover:text-[#303030]",
      )}
    >
      {children}
    </button>
  );
}

export function AdminAnalytics({
  metrics,
  students,
  verificationSeries,
  pipelineSeries,
}: {
  metrics: AdminOverviewMetrics;
  students: AdminStudentRow[];
  verificationSeries: { status: string; count: number }[];
  pipelineSeries: { stage: string; count: number }[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [supportOnly, setSupportOnly] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [chartStyle, setChartStyle] = useState<ChartStyle>("bars");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activePie, setActivePie] = useState<number | undefined>(undefined);

  const branches = useMemo(() => {
    const fromStudents = [...new Set(students.map((s) => s.branch))].sort();
    return fromStudents.length
      ? fromStudents
      : metrics.byBranch.map((b) => b.label);
  }, [students, metrics.byBranch]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (yearFilter !== "all" && s.academicYear !== yearFilter) return false;
      if (branchFilter !== "all" && s.branch !== branchFilter) return false;
      if (supportOnly && !s.needsSupport) return false;
      if (eligibleOnly && !s.academicEligible) return false;
      if (activeSkill && !s.skills.includes(activeSkill)) return false;
      return true;
    });
  }, [students, yearFilter, branchFilter, supportOnly, eligibleOnly, activeSkill]);

  const hasRoster = students.length > 0;
  const scope = hasRoster ? filtered : [];

  const yearData = useMemo(() => {
    if (!hasRoster) {
      return metrics.byAcademicYear.map((r) => ({
        name: r.label.replace(" Year", ""),
        full: r.label,
        students: r.count,
        stamps: 0,
        support: 0,
      }));
    }
    return ACADEMIC_YEARS.map((label) => {
      const rows = scope.filter((s) => s.academicYear === label);
      return {
        name: label.replace(" Year", ""),
        full: label,
        students: rows.length,
        stamps: rows.reduce((n, s) => n + s.certificateStats.total, 0),
        support: rows.filter((s) => s.needsSupport).length,
      };
    });
  }, [hasRoster, scope, metrics.byAcademicYear]);

  const skillData = useMemo(() => {
    const map = new Map<string, number>();
    if (hasRoster) {
      for (const s of scope) {
        for (const skill of s.skills) {
          map.set(skill, (map.get(skill) ?? 0) + 1);
        }
      }
    } else {
      for (const r of metrics.bySkill) map.set(r.label, r.count);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [hasRoster, scope, metrics.bySkill]);

  const branchChart = useMemo(() => {
    if (!hasRoster) {
      return metrics.byBranch.map((r) => ({ name: r.label, value: r.count }));
    }
    const map = new Map<string, number>();
    for (const s of scope) map.set(s.branch, (map.get(s.branch) ?? 0) + 1);
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [hasRoster, scope, metrics.byBranch]);

  const placementData = useMemo(() => {
    if (!hasRoster) {
      return metrics.byPlacement.map((r) => ({
        name: r.label.replaceAll("_", " "),
        value: r.count,
      }));
    }
    const map = new Map<string, number>();
    for (const s of scope) {
      map.set(s.placementStatus, (map.get(s.placementStatus) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, value]) => ({
        name: name.replaceAll("_", " "),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [hasRoster, scope, metrics.byPlacement]);

  const radarData = useMemo(
    () =>
      skillData.slice(0, 6).map((s) => ({
        skill: s.name.length > 10 ? `${s.name.slice(0, 9)}…` : s.name,
        full: s.name,
        coverage: s.value,
      })),
    [skillData],
  );

  const readinessTrend = useMemo(() => {
    return yearData.map((y) => ({
      name: y.name,
      students: y.students,
      stamps: y.stamps,
      support: y.support,
      ready: Math.max(0, y.students - y.support),
    }));
  }, [yearData]);

  const certBars = useMemo(() => {
    const liveTotal = verificationSeries.reduce((n, r) => n + r.count, 0);
    if (liveTotal > 0) return verificationSeries.map((r) => ({ name: r.status, count: r.count }));
    if (hasRoster) {
      return [
        {
          name: "pending",
          count: scope.reduce((n, s) => n + s.certificateStats.pending, 0),
        },
        {
          name: "institution reviewed",
          count: scope.reduce((n, s) => n + s.certificateStats.institutionReviewed, 0),
        },
        {
          name: "issuer verified",
          count: scope.reduce((n, s) => n + s.certificateStats.issuerVerified, 0),
        },
        {
          name: "rejected",
          count: scope.reduce((n, s) => n + s.certificateStats.rejected, 0),
        },
      ];
    }
    return [
      { name: "pending", count: metrics.certificatesPending },
      { name: "institution reviewed", count: metrics.certificatesInstitutionReviewed },
      { name: "issuer verified", count: metrics.certificatesIssuerVerified },
    ];
  }, [verificationSeries, hasRoster, scope, metrics]);

  const pipelineBars = useMemo(() => {
    const live = pipelineSeries.filter((p) => p.count > 0);
    if (live.length) return pipelineSeries.map((p) => ({ name: p.stage, count: p.count }));
    return [
      { name: "uploaded", count: Math.max(1, Math.round((metrics.certificatesTotal ?? 0) * 0.2)) },
      { name: "needs_review", count: metrics.certificatesPending },
      {
        name: "confirmed",
        count: metrics.certificatesInstitutionReviewed,
      },
      { name: "complete", count: metrics.certificatesIssuerVerified },
    ];
  }, [pipelineSeries, metrics]);

  const filteredCount = hasRoster ? scope.length : metrics.registeredStudents;
  const filteredStamps = hasRoster
    ? scope.reduce((n, s) => n + s.certificateStats.total, 0)
    : metrics.certificatesTotal ?? 0;
  const filteredSupport = hasRoster
    ? scope.filter((s) => s.needsSupport).length
    : metrics.needingSupport;
  const filteredEligible = hasRoster
    ? scope.filter((s) => s.academicEligible).length
    : metrics.placementEligible;

  const maxSkill = Math.max(1, ...skillData.map((s) => s.value));

  function clearFilters() {
    setYearFilter("all");
    setBranchFilter("all");
    setSupportOnly(false);
    setEligibleOnly(false);
    setActiveSkill(null);
  }

  const filtersActive =
    yearFilter !== "all" ||
    branchFilter !== "all" ||
    supportOnly ||
    eligibleOnly ||
    Boolean(activeSkill);

  return (
    <div className="space-y-5 text-[#303030]">
      <AdminPageTitle
        title="Analytics"
        description="Interactive charts with live filters across years, branches, skills, certificates, and placement."
        actions={
          filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#898989]/30 bg-white/70 px-4 py-2 text-sm text-[#898989] hover:text-[#303030]"
            >
              Clear filters
            </button>
          ) : null
        }
      />

      <AdminGlass className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Interactive filters</p>
          <p className="text-xs text-[#898989]">
            Showing {filteredCount} students · {filteredStamps} stamps
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={yearFilter === "all"} onClick={() => setYearFilter("all")}>
            All years
          </FilterChip>
          {ACADEMIC_YEARS.map((y) => (
            <FilterChip
              key={y}
              active={yearFilter === y}
              onClick={() => setYearFilter(yearFilter === y ? "all" : y)}
            >
              {y}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={branchFilter === "all"} onClick={() => setBranchFilter("all")}>
            All branches
          </FilterChip>
          {(branches.length ? branches : metrics.byBranch.map((b) => b.label)).map((b) => (
            <FilterChip
              key={b}
              active={branchFilter === b}
              onClick={() => setBranchFilter(branchFilter === b ? "all" : b)}
            >
              {b}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={supportOnly} onClick={() => setSupportOnly((v) => !v)}>
            Needs support
          </FilterChip>
          <FilterChip active={eligibleOnly} onClick={() => setEligibleOnly((v) => !v)}>
            Academically eligible
          </FilterChip>
          {(["bars", "area", "radar", "donut"] as const).map((style) => (
            <FilterChip
              key={style}
              active={chartStyle === style}
              onClick={() => setChartStyle(style)}
            >
              {style === "bars"
                ? "Bar charts"
                : style === "area"
                  ? "Area / trend"
                  : style === "radar"
                    ? "Radar"
                    : "Donut"}
            </FilterChip>
          ))}
        </div>
      </AdminGlass>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["overview", "Overview"],
            ["cohort", "Years"],
            ["skills", "Skills"],
            ["certs", "Certificates"],
            ["placement", "Placement"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              tab === id
                ? "bg-[#303030] text-white"
                : "border border-[#898989]/25 bg-white/60 text-[#898989]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Students in view", filteredCount],
          ["Passport stamps", filteredStamps],
          ["Eligible", filteredEligible],
          ["Needs support", filteredSupport],
        ].map(([label, value]) => (
          <AdminGlass key={label as string} className="p-4">
            <p className="text-xs text-[#898989]">{label}</p>
            <p className="mt-1 text-3xl">{value}</p>
          </AdminGlass>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminGlass className="p-5">
            <p className="mb-1 text-lg">Cohort readiness trend</p>
            <p className="mb-3 text-xs text-[#898989]">
              Students, stamps, and support flags by year
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={readinessTrend}>
                  <defs>
                    <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#303030" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#303030" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gStamps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD85F" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#FFD85F" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#89898922" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tipStyle()} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#303030"
                    fill="url(#gStudents)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="stamps"
                    stroke="#c9a012"
                    fill="url(#gStamps)"
                    strokeWidth={2}
                  />
                  <Line type="monotone" dataKey="support" stroke="#898989" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AdminGlass>

          <AdminGlass className="p-5">
            <p className="mb-1 text-lg">Placement mix</p>
            <p className="mb-3 text-xs text-[#898989]">Click a slice to highlight</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={placementData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={100}
                    paddingAngle={3}
                    activeIndex={activePie}
                    onMouseEnter={(_, i) => setActivePie(i)}
                    onClick={(_, i) => setActivePie(i)}
                  >
                    {placementData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={activePie === i ? 3 : 1}
                        style={{ cursor: "pointer", opacity: activePie == null || activePie === i ? 1 : 0.45 }}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tipStyle(true)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </AdminGlass>

          <AdminGlass className="p-5 lg:col-span-2">
            <p className="mb-1 text-lg">Year vs stamps (stacked)</p>
            <p className="mb-3 text-xs text-[#898989]">Interactive bars update with filters above</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData} barCategoryGap="28%">
                  <CartesianGrid stroke="#89898922" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tipStyle()} />
                  <Legend />
                  <Bar dataKey="students" stackId="a" fill="#303030" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="stamps" stackId="a" fill="#FFD85F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminGlass>
        </div>
      ) : null}

      {tab === "cohort" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminGlass className="p-5">
            <p className="mb-3 text-lg">Year-wise students</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === "area" ? (
                  <AreaChart data={yearData}>
                    <defs>
                      <linearGradient id="yearArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFD85F" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#FFD85F" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#89898922" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle()} />
                    <Area type="monotone" dataKey="students" stroke="#303030" fill="url(#yearArea)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={yearData}>
                    <CartesianGrid stroke="#89898922" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle()} />
                    <Bar dataKey="students" radius={[10, 10, 0, 0]}>
                      {yearData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            yearFilter !== "all" && yearData[i]?.full === yearFilter
                              ? "#FFD85F"
                              : i % 2
                                ? "#FFD85F"
                                : "#303030"
                          }
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            const full = yearData[i]?.full;
                            if (full) setYearFilter(yearFilter === full ? "all" : full);
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-[#898989]">Click a year bar to filter the whole page</p>
          </AdminGlass>

          <AdminGlass className="p-5">
            <p className="mb-3 text-lg">Branch distribution</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === "donut" ? (
                  <PieChart>
                    <Pie
                      data={branchChart}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={95}
                      paddingAngle={2}
                      onClick={(_, i) => {
                        const name = branchChart[i]?.name;
                        if (name) setBranchFilter(branchFilter === name ? "all" : name);
                      }}
                    >
                      {branchChart.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ cursor: "pointer" }} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tipStyle(true)} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={branchChart} layout="vertical" margin={{ left: 8 }}>
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fill: "#898989", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tipStyle()} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {branchChart.map((row, i) => (
                        <Cell
                          key={row.name}
                          fill={branchFilter === row.name ? "#FFD85F" : "#303030"}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setBranchFilter(branchFilter === row.name ? "all" : row.name)
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </AdminGlass>
        </div>
      ) : null}

      {tab === "skills" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminGlass className="p-5">
            <p className="mb-1 text-lg">Skill coverage</p>
            <p className="mb-3 text-xs text-[#898989]">
              Click a skill chip or bar to focus · {activeSkill ?? "all skills"}
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {skillData.map((s) => (
                <FilterChip
                  key={s.name}
                  active={activeSkill === s.name}
                  onClick={() => setActiveSkill(activeSkill === s.name ? null : s.name)}
                >
                  {s.name} · {s.value}
                </FilterChip>
              ))}
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === "radar" ? (
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#89898944" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#898989", fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: "#898989", fontSize: 10 }} />
                    <Radar
                      dataKey="coverage"
                      stroke="#303030"
                      fill="#FFD85F"
                      fillOpacity={0.55}
                    />
                    <Tooltip contentStyle={tipStyle()} />
                  </RadarChart>
                ) : chartStyle === "area" ? (
                  <AreaChart data={skillData}>
                    <CartesianGrid stroke="#89898922" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle()} />
                    <Area type="monotone" dataKey="value" stroke="#303030" fill="#FFD85F" fillOpacity={0.45} />
                  </AreaChart>
                ) : (
                  <BarChart data={skillData} layout="vertical" margin={{ left: 8 }}>
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fill: "#898989", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tipStyle()} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {skillData.map((s) => (
                        <Cell
                          key={s.name}
                          fill={
                            activeSkill === s.name
                              ? "#FFD85F"
                              : activeSkill
                                ? "#89898955"
                                : "#303030"
                          }
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setActiveSkill(activeSkill === s.name ? null : s.name)
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </AdminGlass>

          <AdminGlass className="p-5">
            <p className="mb-3 text-lg">Skill intensity</p>
            <div className="space-y-3">
              {skillData.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActiveSkill(activeSkill === s.name ? null : s.name)}
                  className="w-full text-left"
                >
                  <div className="mb-1 flex justify-between text-sm">
                    <span className={activeSkill === s.name ? "font-medium" : ""}>{s.name}</span>
                    <span className="text-[#898989]">{s.value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#898989]/15">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(s.value / maxSkill) * 100}%`,
                        background: activeSkill === s.name ? "#FFD85F" : "#303030",
                      }}
                    />
                  </div>
                </button>
              ))}
              {!skillData.length ? (
                <p className="text-sm text-[#898989]">No skills in current filter.</p>
              ) : null}
            </div>
          </AdminGlass>
        </div>
      ) : null}

      {tab === "certs" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminGlass className="p-5">
            <p className="mb-1 text-lg">Verification status</p>
            <p className="mb-3 text-xs text-[#898989]">
              Filtered stamp pipeline for the current cohort view
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === "donut" ? (
                  <PieChart>
                    <Pie
                      data={certBars}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {certBars.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tipStyle(true)} />
                    <Legend />
                  </PieChart>
                ) : chartStyle === "area" ? (
                  <AreaChart data={certBars}>
                    <CartesianGrid stroke="#89898922" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle()} />
                    <Area type="monotone" dataKey="count" stroke="#303030" fill="#FFD85F" fillOpacity={0.5} />
                  </AreaChart>
                ) : (
                  <BarChart data={certBars}>
                    <CartesianGrid stroke="#89898922" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle()} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {certBars.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </AdminGlass>

          <AdminGlass className="p-5">
            <p className="mb-3 text-lg">Pipeline stages</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pipelineBars}>
                  <CartesianGrid stroke="#89898922" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tipStyle()} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#303030"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#FFD85F", stroke: "#303030" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AdminGlass>
        </div>
      ) : null}

      {tab === "placement" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminGlass className="p-5">
            <p className="mb-3 text-lg">Placement status</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === "radar" ? (
                  <RadarChart
                    data={placementData.map((p) => ({
                      skill: p.name.length > 12 ? `${p.name.slice(0, 11)}…` : p.name,
                      coverage: p.value,
                    }))}
                  >
                    <PolarGrid stroke="#89898944" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "#898989", fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: "#898989", fontSize: 10 }} />
                    <Radar dataKey="coverage" stroke="#303030" fill="#FFD85F" fillOpacity={0.5} />
                    <Tooltip contentStyle={tipStyle()} />
                  </RadarChart>
                ) : chartStyle === "donut" || chartStyle === "area" ? (
                  <PieChart>
                    <Pie
                      data={placementData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={chartStyle === "donut" ? 55 : 0}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {placementData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tipStyle(true)} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={placementData}>
                    <CartesianGrid stroke="#89898922" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#898989", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#898989", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle()} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {placementData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </AdminGlass>

          <AdminGlass className="space-y-3 p-5">
            <p className="text-lg">Branch × placement snapshot</p>
            {branchChart.map((b) => (
              <button
                key={b.name}
                type="button"
                className="w-full text-left"
                onClick={() => setBranchFilter(branchFilter === b.name ? "all" : b.name)}
              >
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="text-[#898989]">{b.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#898989]/15">
                  <div
                    className="h-full rounded-full bg-[#FFD85F] transition-all"
                    style={{
                      width: `${(b.value / Math.max(1, filteredCount)) * 100}%`,
                      opacity: branchFilter === "all" || branchFilter === b.name ? 1 : 0.35,
                    }}
                  />
                </div>
              </button>
            ))}
            {!branchChart.length ? (
              <p className="text-sm text-[#898989]">No branch rows for this filter.</p>
            ) : null}
          </AdminGlass>
        </div>
      ) : null}

    </div>
  );
}
