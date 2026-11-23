"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { AdminStudentRow } from "@/lib/admin/types";
import { studentPhoto } from "@/lib/admin/student-photos";
import { AdminGlass, AdminPageTitle } from "@/components/admin/admin-theme-shell";
import { cn } from "@/lib/utils";

type Facets = {
  branches: string[];
  academicYears: string[];
  graduationYears: number[];
  skills: string[];
  technologyCategories: string[];
  placementStatuses: string[];
};

export function StudentDirectory({
  rows,
  total,
  page,
  pageSize,
  facets,
}: {
  rows: AdminStudentRow[];
  total: number;
  page: number;
  pageSize: number;
  facets: Facets;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [expanded, setExpanded] = useState<string | null>(null);

  const current = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  function update(next: Record<string, string | undefined>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    if (resetPage) params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function sortBy(key: string) {
    const prev = current.sort;
    const prevOrder = current.order === "desc" ? "desc" : "asc";
    const order = prev === key && prevOrder === "asc" ? "desc" : "asc";
    update({ sort: key, order }, false);
  }

  function toggleChip(key: string, value: string) {
    update({ [key]: current[key] === value ? undefined : value });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const exportQuery = searchParams.toString();
  const selectClass =
    "mt-1 w-full rounded-2xl border border-[#898989]/25 bg-white/70 px-3 py-2.5 text-sm text-[#303030] outline-none focus:ring-2 focus:ring-[#FFD85F]";

  return (
    <div className={cn("space-y-4 text-[#303030]", pending && "opacity-70")}>
      <AdminPageTitle
        title="Student directory"
        description="Filter by year, skill, branch, and placement. Interactive roster with live counts."
        actions={
          <div className="flex rounded-full border border-[#898989]/20 bg-white/60 p-1 backdrop-blur-xl">
            {(["cards", "table"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                  view === mode ? "bg-[#303030] text-white" : "text-[#898989]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#303030] px-3 py-1.5 text-xs text-white">
          {total} students
        </span>
        {facets.academicYears.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => toggleChip("academicYear", y)}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              current.academicYear === y
                ? "bg-[#FFD85F] text-[#303030]"
                : "border border-[#898989]/25 bg-white/60 text-[#898989] hover:text-[#303030]"
            }`}
          >
            {y}
          </button>
        ))}
        {facets.skills.slice(0, 8).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggleChip("skill", s)}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              current.skill === s
                ? "bg-[#FFD85F] text-[#303030]"
                : "border border-[#898989]/25 bg-white/60 text-[#898989] hover:text-[#303030]"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggleChip("needsSupport", "true")}
          className={`rounded-full px-3 py-1.5 text-xs transition ${
            current.needsSupport === "true"
              ? "bg-[#FFD85F] text-[#303030]"
              : "border border-[#898989]/25 bg-white/60 text-[#898989]"
          }`}
        >
          Needs support
        </button>
      </div>

      <AdminGlass className="p-4">
        <form
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            update({
              q: String(fd.get("q") || "") || undefined,
              branch: String(fd.get("branch") || "") || undefined,
              academicYear: String(fd.get("academicYear") || "") || undefined,
              graduationYear: String(fd.get("graduationYear") || "") || undefined,
              minCgpa: String(fd.get("minCgpa") || "") || undefined,
              academicEligible: String(fd.get("academicEligible") || "") || undefined,
              skill: String(fd.get("skill") || "") || undefined,
              technologyCategory: String(fd.get("technologyCategory") || "") || undefined,
              verificationStatus: String(fd.get("verificationStatus") || "") || undefined,
              training: String(fd.get("training") || "") || undefined,
              assessment: String(fd.get("assessment") || "") || undefined,
              placementStatus: String(fd.get("placementStatus") || "") || undefined,
              needsSupport: String(fd.get("needsSupport") || "") || undefined,
            });
          }}
        >
          <div className="md:col-span-2">
            <label className="text-xs text-[#898989]" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={current.q ?? ""}
              placeholder="Name / roll / passport"
              className={selectClass}
            />
          </div>
          <div>
            <label className="text-xs text-[#898989]" htmlFor="branch">
              Branch
            </label>
            <select id="branch" name="branch" defaultValue={current.branch ?? ""} className={selectClass}>
              <option value="">All</option>
              {facets.branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#898989]" htmlFor="placementStatus">
              Placement
            </label>
            <select
              id="placementStatus"
              name="placementStatus"
              defaultValue={current.placementStatus ?? ""}
              className={selectClass}
            >
              <option value="">All</option>
              {facets.placementStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#898989]" htmlFor="academicYear">
              Academic year
            </label>
            <select
              id="academicYear"
              name="academicYear"
              defaultValue={current.academicYear ?? ""}
              className={selectClass}
            >
              <option value="">All</option>
              {facets.academicYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#898989]" htmlFor="skill">
              Skill
            </label>
            <select id="skill" name="skill" defaultValue={current.skill ?? ""} className={selectClass}>
              <option value="">All</option>
              {facets.skills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#898989]" htmlFor="graduationYear">
              Batch
            </label>
            <select
              id="graduationYear"
              name="graduationYear"
              defaultValue={current.graduationYear ?? ""}
              className={selectClass}
            >
              <option value="">All</option>
              {facets.graduationYears.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#898989]" htmlFor="minCgpa">
              Min CGPA
            </label>
            <input
              id="minCgpa"
              name="minCgpa"
              type="number"
              step="0.1"
              min="0"
              max="10"
              defaultValue={current.minCgpa ?? ""}
              className={selectClass}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-4">
            <button
              type="submit"
              className="rounded-full bg-[#303030] px-5 py-2.5 text-sm text-white transition hover:bg-black"
            >
              Apply filters
            </button>
            <button
              type="button"
              className="rounded-full border border-[#898989]/30 bg-white/70 px-5 py-2.5 text-sm"
              onClick={() => router.push(pathname)}
            >
              Reset
            </button>
            <a
              href={`/api/admin/students/export?format=csv&${exportQuery}`}
              className="ml-auto rounded-full border border-[#898989]/30 bg-white/70 px-4 py-2.5 text-sm"
            >
              Export CSV
            </a>
            <a
              href={`/api/admin/students/export?format=xlsx&${exportQuery}`}
              className="rounded-full bg-[#FFD85F] px-4 py-2.5 text-sm text-[#303030]"
            >
              Export Excel
            </a>
          </div>
        </form>
      </AdminGlass>

      {view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {!rows.length ? (
            <AdminGlass className="col-span-full p-10 text-center text-sm text-[#898989]">
              No students match these filters.
            </AdminGlass>
          ) : (
            rows.map((row, i) => {
              const open = expanded === row.id;
              return (
                <AdminGlass key={row.id} className="overflow-hidden transition hover:bg-white/80">
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 p-4 text-left"
                    onClick={() => setExpanded(open ? null : row.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={studentPhoto(row, i)}
                      alt=""
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="truncate text-xs text-[#898989]">
                        {row.academicYear} · {row.branch}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {row.needsSupport ? (
                          <span className="rounded-full bg-[#FFD85F] px-2 py-0.5 text-[10px]">
                            Support
                          </span>
                        ) : null}
                        {row.activeLearner ? (
                          <span className="rounded-full bg-[#303030] px-2 py-0.5 text-[10px] text-white">
                            Active
                          </span>
                        ) : null}
                        <span className="rounded-full border border-[#898989]/25 px-2 py-0.5 text-[10px] capitalize">
                          {row.placementStatus.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg">{row.cgpa.toFixed(1)}</p>
                      <p className="text-[10px] text-[#898989]">CGPA</p>
                    </div>
                  </button>
                  {open ? (
                    <div className="space-y-3 border-t border-[#898989]/15 px-4 py-3">
                      <p className="text-xs text-[#898989]">
                        {row.rollNumber} · {row.passportId} · Class of {row.graduationYear}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {row.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-[#898989]/10 px-2 py-1 text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-[#898989]">
                        <span>Training {row.trainingCompletionPercent}%</span>
                        <span>
                          Certs {row.certificateStats.total}
                          {row.certificateStats.pending
                            ? ` · ${row.certificateStats.pending} pending`
                            : ""}
                        </span>
                        {row.assessmentAverage != null ? (
                          <span>Assessment {row.assessmentAverage}</span>
                        ) : null}
                      </div>
                      <Link
                        href={`/admin/students/${row.id}`}
                        className="inline-flex rounded-full bg-[#303030] px-4 py-2 text-xs text-white"
                      >
                        Open 360° profile
                      </Link>
                    </div>
                  ) : null}
                </AdminGlass>
              );
            })
          )}
        </div>
      ) : (
        <AdminGlass className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#898989]/15 text-xs uppercase tracking-wide text-[#898989]">
              <tr>
                {[
                  ["name", "Student"],
                  ["branch", "Branch"],
                  ["graduationYear", "Batch"],
                  ["cgpa", "CGPA"],
                  ["placementStatus", "Placement"],
                  ["trainingCompletionPercent", "Training"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-medium">
                    <button type="button" onClick={() => sortBy(key)}>
                      {label}
                      {current.sort === key ? (current.order === "desc" ? " ↓" : " ↑") : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!rows.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#898989]">
                    No students match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#898989]/10 transition hover:bg-white/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/students/${row.id}`}
                        className="flex items-center gap-3 font-medium hover:underline"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={studentPhoto(row, i)}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span>
                          {row.name}
                          <span className="block text-xs font-normal text-[#898989]">
                            {row.academicYear}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{row.branch}</td>
                    <td className="px-4 py-3">{row.graduationYear}</td>
                    <td className="px-4 py-3">{row.cgpa.toFixed(1)}</td>
                    <td className="px-4 py-3 capitalize">
                      {row.placementStatus.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3">{row.trainingCompletionPercent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminGlass>
      )}

      <div className="flex items-center justify-between text-sm text-[#898989]">
        <p>
          Showing {rows.length ? (page - 1) * pageSize + 1 : 0}–
          {Math.min(page * pageSize, total)} of {total}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-[#898989]/30 bg-white/70 px-4 py-2 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) }, false)}
          >
            Previous
          </button>
          <span className="px-2 py-2">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-full bg-[#303030] px-4 py-2 text-white disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => update({ page: String(page + 1) }, false)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
