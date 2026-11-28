import Link from "next/link";
import { getDemoSkillPassport } from "@/lib/demo/skill-passport";
import { demoAdminStudents } from "@/lib/demo/admin-intelligence";
import { publicPassportSummary } from "@/services/skill-passport";
import { PassportVerificationQR } from "@/components/passport/passport-verification-qr";

export default async function PublicPassportVerifyPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const decoded = decodeURIComponent(number);
  const student =
    demoAdminStudents.find((s) => `SSP-BOOK-${s.rollNumber}` === decoded) ??
    demoAdminStudents[0];
  const bundle = getDemoSkillPassport(student.id);
  if (!bundle) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-[#78828E]">
        Passport not found.
      </div>
    );
  }
  const summary = publicPassportSummary(bundle);
  const id = bundle.identity;
  const o = bundle.overview;

  return (
    <div className="skill-passport min-h-screen bg-[#FAF7EF] px-4 py-10">
      <div className="mx-auto max-w-2xl overflow-hidden border border-[#D8C398] bg-[#FFFEFA] shadow-[0_18px_50px_rgba(8,24,45,0.08)]">
        <div className="border-b border-[#B69A59]/40 bg-[#08182D] px-6 py-5 text-[#D8C398]">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#B69A59]">
            Skill Passport · Public verification
          </p>
          <h1 className="sp-serif mt-2 text-3xl text-[#D8C398]">{summary.fullName}</h1>
          <p className="mt-1 text-sm text-[#D8C398]/80">{summary.organizationName}</p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[140px_1fr]">
          <div className="flex flex-col items-center gap-3">
            {id.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={id.photoUrl}
                alt=""
                className="h-36 w-28 object-cover object-top"
                style={{ border: "1px solid #D8C398" }}
              />
            ) : (
              <div className="flex h-36 w-28 items-center justify-center border border-[#D8C398] text-xs text-[#78828E]">
                Photo
              </div>
            )}
            <PassportVerificationQR url={bundle.verifyUrl} size={120} />
          </div>

          <div>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <Row label="Passport number" value={summary.passportNumber} mono />
              <Row label="Roll number" value={id.rollNumber ?? "—"} />
              <Row label="Programme" value={summary.degree ?? "—"} />
              <Row label="Branch" value={summary.branch ?? "—"} />
              <Row label="Academic year" value={id.academicYear ?? "—"} />
              <Row label="Batch" value={summary.graduationYear ? String(summary.graduationYear) : "—"} />
              <Row label="Passport level" value={summary.levelLabel} />
              <Row label="Institution status" value={id.verificationStatus} />
              <Row label="Verified stamps" value={String(o.verifiedCount)} />
              <Row label="Date of issue" value={id.issuedAt.slice(0, 10)} />
            </dl>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label="Certifications" value={o.certificationCount} />
              <Stat label="Projects" value={o.projectCount} />
              <Stat label="Internships" value={o.internshipCount} />
            </div>
          </div>
        </div>

        <div className="border-t border-[#D8C398]/60 px-6 py-5">
          <h2 className="sp-serif text-xl text-[#08182D]">Verified achievements</h2>
          <p className="mt-1 text-xs text-[#78828E]">
            Only institution-verified stamps are listed. Confidential documents are never exposed.
          </p>
          <ul className="mt-4 space-y-2">
            {summary.verifiedAchievements.length === 0 ? (
              <li className="border border-[#D8C398]/60 px-3 py-3 text-sm text-[#78828E]">
                No verified achievements published yet.
              </li>
            ) : (
              summary.verifiedAchievements.map((a) => (
                <li
                  key={a.achievementCode}
                  className="flex flex-wrap items-start justify-between gap-2 border border-[#D8C398]/60 px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="text-[#17283D]">{a.title}</p>
                    <p className="text-xs text-[#78828E]">
                      {a.stampTitle}
                      {a.issuer ? ` · ${a.issuer}` : ""}
                      {a.completedOn ? ` · ${a.completedOn.slice(0, 10)}` : ""}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#B69A59]">{a.achievementCode}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8C398]/60 bg-[#FAF7EF] px-6 py-4">
          <p className="text-xs text-[#78828E]">
            Contact details and source documents are withheld from public verification.
          </p>
          <Link href="/" className="text-sm text-[#B69A59] underline">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-b border-[#D8C398]/40 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-[#78828E]">{label}</dt>
      <dd className={mono ? "mt-0.5 font-mono text-[#17283D]" : "mt-0.5 text-[#17283D]"}>
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#D8C398]/60 bg-white px-2 py-2">
      <p className="text-[9px] uppercase tracking-wide text-[#78828E]">{label}</p>
      <p className="sp-serif mt-1 text-xl text-[#08182D]">{value}</p>
    </div>
  );
}
