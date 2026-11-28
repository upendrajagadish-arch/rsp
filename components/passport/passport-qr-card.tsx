"use client";

import { PassportVerificationQR } from "@/components/passport/passport-verification-qr";
import type { SkillPassportBundle } from "@/lib/passport/types";

type Props = {
  bundle: SkillPassportBundle;
  qrSize?: number;
  compact?: boolean;
};

/** QR plus the public skill-passport details a scanner should see. */
export function PassportQrCard({ bundle, qrSize = 128, compact = false }: Props) {
  const id = bundle.identity;
  const o = bundle.overview;
  const verified = bundle.achievements.filter((a) => a.status === "verified");

  return (
    <div
      className={
        compact
          ? "grid gap-3 border border-[#D8C398]/70 bg-[#FFFEFA] p-3 sm:grid-cols-[auto_1fr]"
          : "grid gap-4 border border-[#D8C398] bg-[#FFFEFA] p-4 sm:grid-cols-[auto_1fr]"
      }
    >
      <div className="flex flex-col items-center gap-2">
        <PassportVerificationQR url={bundle.verifyUrl} size={qrSize} />
        <p className="max-w-[9rem] text-center text-[9px] uppercase tracking-wider text-[#78828E]">
          Scan to verify Skill Passport
        </p>
      </div>

      <div className="min-w-0 space-y-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#B69A59]">
            {id.organizationName}
          </p>
          <p className="sp-serif text-lg leading-tight text-[#08182D] sm:text-xl">
            {id.fullName}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[#B69A59]">{id.passportNumber}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <Detail label="Roll no." value={id.rollNumber ?? "—"} />
          <Detail label="Batch" value={id.graduationYear ? String(id.graduationYear) : "—"} />
          <Detail label="Programme" value={id.degree ?? "—"} />
          <Detail label="Branch" value={id.branch ?? "—"} />
          <Detail label="Year" value={id.academicYear ?? "—"} />
          <Detail label="Level" value={o.levelLabel} />
          <Detail label="Verified stamps" value={String(o.verifiedCount)} />
          <Detail label="Status" value={id.verificationStatus} />
        </dl>

        {!compact && verified.length > 0 ? (
          <div className="border-t border-[#D8C398]/50 pt-2">
            <p className="text-[10px] uppercase tracking-wide text-[#78828E]">
              Verified achievements
            </p>
            <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto text-xs text-[#17283D]">
              {verified.slice(0, 8).map((a) => (
                <li key={a.id} className="truncate">
                  <span className="text-[#B69A59]">{a.stampTitle}</span>
                  {" · "}
                  {a.title}
                </li>
              ))}
              {verified.length > 8 ? (
                <li className="text-[#78828E]">+{verified.length - 8} more on scan</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase tracking-wide text-[#78828E]">{label}</dt>
      <dd className="mt-0.5 break-words text-[#17283D]">{value}</dd>
    </div>
  );
}
