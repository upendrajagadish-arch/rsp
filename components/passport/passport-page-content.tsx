"use client";

import { AchievementStampSlot } from "@/components/passport/stamps/achievement-stamp-slot";
import { PassportQrCard } from "@/components/passport/passport-qr-card";
import {
  PASSPORT_PAGES,
  SLOTS_PER_ACHIEVEMENT_PAGE,
  type PassportPageDef,
} from "@/lib/passport/page-map";
import { stampsByPageGroup } from "@/lib/passport/stamp-categories";
import type { PassportAchievement, SkillPassportBundle } from "@/lib/passport/types";

type Props = {
  def: PassportPageDef;
  bundle: SkillPassportBundle;
  onOpenAchievement: (a: PassportAchievement | null, lockedCode?: string) => void;
};

export function PassportPageContent({ def, bundle, onOpenAchievement }: Props) {
  return (
    <article className="skill-passport-paper sp-page-sheet flex h-full flex-col border border-[#D8C398]/50 p-4 sm:p-5">
      <header className="mb-3 flex shrink-0 items-start justify-between gap-2 border-b border-[#D8C398]/60 pb-2">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#B69A59]">
            {bundle.identity.organizationName}
          </p>
          <h2 className="sp-serif mt-0.5 text-lg leading-snug text-[#08182D] sm:text-xl">
            {def.title}
          </h2>
        </div>
        <p className="shrink-0 text-[11px] text-[#78828E]">p. {def.page}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {def.kind === "identity" ? <IdentityPage bundle={bundle} /> : null}
        {def.kind === "instructions" ? <InstructionsPage /> : null}
        {def.kind === "achievements" ? (
          <AchievementsPage
            def={def}
            bundle={bundle}
            onOpenAchievement={onOpenAchievement}
          />
        ) : null}
        {def.kind === "summary" ? <SummaryPage bundle={bundle} /> : null}
        {def.kind === "verification" ? <VerificationPage bundle={bundle} /> : null}
      </div>

      <footer className="mt-3 flex shrink-0 justify-between gap-2 border-t border-[#D8C398]/50 pt-2 text-[9px] uppercase tracking-wider text-[#78828E]">
        <span>Skill Passport</span>
        <span className="truncate text-right">{bundle.identity.passportNumber}</span>
      </footer>
    </article>
  );
}

function IdentityPage({ bundle }: { bundle: SkillPassportBundle }) {
  const id = bundle.identity;
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="shrink-0 self-start">
          {id.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={id.photoUrl}
              alt={id.fullName}
              className="object-cover object-top"
              style={{ width: 96, height: 120, border: "1px solid #D8C398" }}
            />
          ) : (
            <div
              className="flex items-center justify-center border border-[#D8C398] bg-[#FFFEFA] text-[10px] text-[#78828E]"
              style={{ width: 96, height: 120 }}
            >
              Photo
            </div>
          )}
        </div>
        <dl className="grid min-w-0 flex-1 grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <Field label="Full name" value={id.fullName} />
          <Field label="Roll number" value={id.rollNumber ?? "—"} />
          <Field label="Department / Degree" value={id.degree ?? "—"} />
          <Field label="Branch" value={id.branch ?? "—"} />
          <Field label="Academic year" value={id.academicYear ?? "—"} />
          <Field label="Batch" value={id.graduationYear ? String(id.graduationYear) : "—"} />
          <Field label="Passport ID" value={id.passportId} />
          <Field label="Booklet No." value={id.passportNumber} />
          <Field label="Date of issue" value={id.issuedAt.slice(0, 10)} />
          <Field label="Academic status" value={id.academicStatus} />
          <Field label="Institution status" value={id.verificationStatus} />
          <Field label="Email" value={id.email ?? "—"} />
        </dl>
      </div>

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#B69A59]">
          Verification QR
        </p>
        <PassportQrCard bundle={bundle} qrSize={96} compact />
      </div>
    </div>
  );
}

function InstructionsPage() {
  return (
    <div className="space-y-3 text-xs leading-relaxed text-[#17283D] sm:text-sm">
      <p className="sp-serif text-base text-[#08182D] sm:text-lg">Institutional message</p>
      <p>
        This Skill Passport is an institution-issued record of verified academic, technical, and
        extracurricular accomplishments. Stamps are awarded only after authorized review of supporting
        evidence.
      </p>
      <ol className="list-decimal space-y-1.5 pl-4 text-[#78828E]">
        <li>Keep digital and physical passports aligned through official issuance.</li>
        <li>Present the verification QR only when sharing permitted public information.</li>
        <li>Report lost physical booklets to your department coordinator.</li>
        <li>Revoked achievements will not appear on public verification.</li>
      </ol>
    </div>
  );
}

function AchievementsPage({
  def,
  bundle,
  onOpenAchievement,
}: {
  def: PassportPageDef;
  bundle: SkillPassportBundle;
  onOpenAchievement: (a: PassportAchievement | null, lockedCode?: string) => void;
}) {
  const group = def.pageGroup ?? "certifications";
  const groupPages = PASSPORT_PAGES.filter(
    (p) => p.kind === "achievements" && p.pageGroup === group,
  );
  const pageIndexInGroup = groupPages.findIndex((p) => p.page === def.page);
  const start = Math.max(0, pageIndexInGroup) * SLOTS_PER_ACHIEVEMENT_PAGE;

  const earned = bundle.achievements.filter(
    (a) =>
      a.pageGroup === group &&
      (a.status === "verified" || a.status === "submitted" || a.status === "rejected"),
  );
  const pageItems = earned.slice(start, start + SLOTS_PER_ACHIEVEMENT_PAGE);
  const categories = stampsByPageGroup(group);
  const emptySlots = Math.max(0, SLOTS_PER_ACHIEVEMENT_PAGE - pageItems.length);

  return (
    <div className="grid grid-cols-2 gap-2">
      {pageItems.map((a) => (
        <AchievementStampSlot
          key={a.id}
          achievement={a}
          onOpen={() => onOpenAchievement(a)}
        />
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => {
        const cat = categories[i % Math.max(1, categories.length)];
        return (
          <AchievementStampSlot
            key={`locked-${def.page}-${i}`}
            lockedCategoryCode={cat?.code}
            onOpen={() => onOpenAchievement(null, cat?.code)}
          />
        );
      })}
    </div>
  );
}

function SummaryPage({ bundle }: { bundle: SkillPassportBundle }) {
  const o = bundle.overview;
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {[
        ["Verified stamps", o.verifiedCount],
        ["Certifications", o.certificationCount],
        ["Projects", o.projectCount],
        ["Internships", o.internshipCount],
        ["Pending review", o.pendingVerification],
        ["Passport level", o.levelLabel],
      ].map(([label, value]) => (
        <div key={String(label)} className="border border-[#D8C398]/60 bg-[#FFFEFA] p-2.5">
          <p className="text-[9px] uppercase tracking-wide text-[#78828E]">{label}</p>
          <p className="sp-serif mt-1 text-xl text-[#08182D]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function VerificationPage({ bundle }: { bundle: SkillPassportBundle }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="sp-serif text-base text-[#08182D] sm:text-lg">
          Digital verification & endorsement
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#78828E]">
          Endorsed by {bundle.identity.organizationName}. Scanners receive the Skill Passport identity,
          programme, level, and verified achievement titles below.
        </p>
      </div>
      <PassportQrCard bundle={bundle} qrSize={112} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase tracking-wide text-[#78828E]">{label}</dt>
      <dd className="mt-0.5 break-words text-[#17283D]">{value}</dd>
    </div>
  );
}
