import { Award, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/product/empty-state";
import { VerificationStamp } from "@/components/product/verification-stamp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicPassport } from "@/services/passport";
import { formatDate } from "@/lib/utils";
import type { VerificationStatus } from "@/types/supabase";

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = await getPublicPassport(token);

  if (!payload) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <EmptyState
          title="Passport unavailable"
          description="This link may be expired, revoked, or sharing was turned off. Request a new share link from the student."
        />
      </div>
    );
  }

  const { studentProfile, credentials, skills, passportId } = payload;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Smart Skill Passport
            </p>
            <h1 className="text-2xl font-semibold text-[var(--navy)]">Passport {passportId}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {[studentProfile.degree, studentProfile.branch, studentProfile.graduation_year]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Badge variant="success">Public view</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {studentProfile.bio ? (
          <Card>
            <CardContent className="p-5 text-sm text-[var(--navy)]">{studentProfile.bio}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!credentials.length ? (
              <p className="text-sm text-[var(--muted)]">No credentials shared.</p>
            ) : (
              <ul className="space-y-3">
                {credentials.map((cert) => (
                  <li
                    key={cert.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--navy)]">{cert.title || "Credential"}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {cert.issuing_organization || "Unknown issuer"}
                        {cert.issue_date ? ` · ${formatDate(cert.issue_date)}` : ""}
                      </p>
                    </div>
                    <VerificationStamp status={cert.verification_status as VerificationStatus} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!skills.length ? (
              <p className="text-sm text-[var(--muted)]">No skills shared.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {skills.map((skill) => (
                  <li
                    key={skill.slug}
                    className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-[var(--navy)]">{skill.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {skill.evidence_count} evidence · {skill.strongest_evidence}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--muted)]">
          Verification stamps reflect issuer adapters and institutional review — not self-reported status.
        </p>
      </main>
    </div>
  );
}