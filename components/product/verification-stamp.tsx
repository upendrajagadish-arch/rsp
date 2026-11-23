import Link from "next/link";
import { AlertTriangle, Clock, Ban, Shield, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/supabase";

const config: Record<
  VerificationStatus,
  { label: string; className: string; Icon: typeof Shield }
> = {
  issuer_verified: {
    label: "Issuer Verified",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Icon: ShieldCheck,
  },
  institution_reviewed: {
    label: "Institution Reviewed",
    className: "bg-sky-50 text-sky-800 border-sky-200",
    Icon: Shield,
  },
  pending: {
    label: "Pending Verification",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    Icon: Clock,
  },
  unavailable: {
    label: "Verification Unavailable",
    className: "bg-slate-50 text-slate-700 border-slate-200",
    Icon: ShieldQuestion,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-800 border-red-200",
    Icon: AlertTriangle,
  },
  expired: {
    label: "Expired",
    className: "bg-orange-50 text-orange-800 border-orange-200",
    Icon: Ban,
  },
  revoked: {
    label: "Revoked",
    className: "bg-orange-50 text-orange-900 border-orange-300",
    Icon: Ban,
  },
};

export function VerificationStamp({
  status,
  certificateId,
  className,
}: {
  status: VerificationStatus;
  certificateId?: string;
  className?: string;
}) {
  const item = config[status] ?? config.unavailable;
  const body = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        item.className,
        className,
      )}
    >
      <item.Icon className="h-3.5 w-3.5" aria-hidden />
      {item.label}
    </span>
  );

  if (!certificateId) return body;

  return (
    <Link
      href={`/student/certificates/${certificateId}/verification`}
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-full"
      aria-label={`View verification details: ${item.label}`}
    >
      {body}
    </Link>
  );
}
