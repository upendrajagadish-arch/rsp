"use client";

import { useState, type ReactNode } from "react";
import { initials } from "@/lib/utils";
import type { LookingFor } from "@/lib/journey/types";

export type EditProfileValues = {
  headline: string;
  phone: string;
  location: string;
  bio: string;
  degree: string;
  branch: string;
  graduationYear: string;
  rollNumber: string;
  cgpa: string;
  experienceLevel: string;
  lookingFor: LookingFor;
  preferredRoles: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  leetcodeUrl: string;
  technologies: string;
};

const EXPERIENCE = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LOOKING = [
  { value: "internship", label: "Internship" },
  { value: "full_time", label: "Full-time" },
  { value: "both", label: "Internship or full-time" },
  { value: "not_looking", label: "Not looking" },
];

const inputClass =
  "mt-1.5 w-full border-b border-white/20 bg-transparent py-1.5 text-[14px] tracking-tight text-white outline-none placeholder:text-white/30 focus:border-[var(--lime)]";
const labelClass = "text-[12px] uppercase tracking-[0.12em] text-white/40";

export function EditProfileForm({
  fullName,
  email,
  avatarUrl,
  initial,
  onSaved,
}: {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  initial: EditProfileValues;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditProfileValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EditProfileValues>(key: K, value: EditProfileValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setError(null);
    const digits = form.rollNumber.replace(/\D/g, "");
    if (!form.rollNumber.trim() || digits.length < 4) {
      setError("Roll number needs at least 4 digits");
      return;
    }
    if (!form.degree.trim() || !form.branch.trim()) {
      setError("Degree and branch are required");
      return;
    }

    setSaving(true);
    try {
      const technologies = form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/journey/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: form.headline,
          phone: form.phone,
          location: form.location,
          bio: form.bio,
          degree: form.degree,
          branch: form.branch,
          graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
          rollNumber: form.rollNumber.trim(),
          cgpa: form.cgpa,
          experienceLevel: form.experienceLevel,
          lookingFor: form.lookingFor,
          preferredRoles: form.preferredRoles,
          linkedinUrl: form.linkedinUrl,
          githubUrl: form.githubUrl,
          portfolioUrl: form.portfolioUrl,
          leetcodeUrl: form.leetcodeUrl,
          technologies,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save profile");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover ring-1 ring-white/15"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-[var(--lime)]">
            {initials(fullName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[17px] font-medium tracking-tight text-white">{fullName}</p>
          <p className="truncate text-[13px] tracking-tight text-white/50">{email}</p>
          <p className="mt-0.5 text-[11px] tracking-tight text-white/35">
            Photo syncs from LinkedIn when connected
          </p>
        </div>
      </div>

      <Section title="Professional">
        <Field label="Headline">
          <input
            className={inputClass}
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="e.g. Full-stack developer · React & Node"
          />
        </Field>
        <Field label="Preferred roles">
          <input
            className={inputClass}
            value={form.preferredRoles}
            onChange={(e) => set("preferredRoles", e.target.value)}
            placeholder="SDE Intern, Backend Engineer, …"
          />
        </Field>
        <Field label="Looking for">
          <select
            className={`${inputClass} appearance-none`}
            value={form.lookingFor}
            onChange={(e) => set("lookingFor", e.target.value as LookingFor)}
          >
            {LOOKING.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0a0e1c]">
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Experience">
          <select
            className={`${inputClass} appearance-none`}
            value={form.experienceLevel}
            onChange={(e) => set("experienceLevel", e.target.value)}
          >
            {EXPERIENCE.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0a0e1c]">
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="About" className="sm:col-span-2">
          <textarea
            className={`${inputClass} min-h-[64px] resize-none`}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Short bio for recruiters — stack, interests, what you’re building"
            rows={3}
          />
        </Field>
        <Field label="Tech stack" className="sm:col-span-2">
          <input
            className={inputClass}
            value={form.technologies}
            onChange={(e) => set("technologies", e.target.value)}
            placeholder="React, TypeScript, Node, PostgreSQL (comma-separated)"
          />
        </Field>
      </Section>

      <Section title="Contact">
        <Field label="Phone">
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 …"
          />
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City, Country"
          />
        </Field>
        <Field label="LinkedIn">
          <input
            className={inputClass}
            value={form.linkedinUrl}
            onChange={(e) => set("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
        </Field>
        <Field label="GitHub">
          <input
            className={inputClass}
            value={form.githubUrl}
            onChange={(e) => set("githubUrl", e.target.value)}
            placeholder="https://github.com/…"
          />
        </Field>
        <Field label="Portfolio">
          <input
            className={inputClass}
            value={form.portfolioUrl}
            onChange={(e) => set("portfolioUrl", e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="LeetCode / coding">
          <input
            className={inputClass}
            value={form.leetcodeUrl}
            onChange={(e) => set("leetcodeUrl", e.target.value)}
            placeholder="https://leetcode.com/u/…"
          />
        </Field>
      </Section>

      <Section title="Academics">
        <Field label="Degree">
          <input
            className={inputClass}
            value={form.degree}
            onChange={(e) => set("degree", e.target.value)}
            placeholder="B.Tech"
          />
        </Field>
        <Field label="Branch">
          <input
            className={inputClass}
            value={form.branch}
            onChange={(e) => set("branch", e.target.value)}
            placeholder="Computer Science"
          />
        </Field>
        <Field label="Graduation year">
          <input
            className={inputClass}
            value={form.graduationYear}
            onChange={(e) => set("graduationYear", e.target.value)}
            placeholder="2026"
            inputMode="numeric"
          />
        </Field>
        <Field label="CGPA">
          <input
            className={inputClass}
            value={form.cgpa}
            onChange={(e) => set("cgpa", e.target.value)}
            placeholder="8.5"
          />
        </Field>
        <Field label="Roll number" className="sm:col-span-2">
          <input
            className={inputClass}
            value={form.rollNumber}
            onChange={(e) => set("rollNumber", e.target.value)}
            placeholder="e.g. CSE21001"
          />
          <p className="mt-1 text-[11px] tracking-tight text-white/35">
            Watermark uses last 4 digits
            {form.rollNumber.replace(/\D/g, "").length >= 4
              ? `: ${form.rollNumber.replace(/\D/g, "").slice(-4)}`
              : "."}
          </p>
        </Field>
      </Section>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="text-sm font-medium text-[var(--lime)] hover:underline disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">{title}</p>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
