import { PageHeader } from "@/components/product/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/auth/session";
import { demoStudents } from "@/lib/demo/data";

export default async function RecruiterSearchPage() {
  const session = await requireSession(["recruiter"]);
  const candidates = demoStudents.filter((s) => s.sharing_enabled);

  return (
    <div>
      {session.demo ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo mode — only students who enabled sharing appear here.
        </div>
      ) : null}

      <PageHeader
        title="Candidate search"
        description="Browse consented digital passports from your authorized college."
      />

      <div className="grid gap-4">
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-sm text-[var(--muted)]">
              No shared passports are available yet.
            </CardContent>
          </Card>
        ) : (
          candidates.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--navy)]">{c.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {c.passport_id} · {c.branch} · Class of {c.graduation_year}
                  </p>
                </div>
                <Badge variant="success">Sharing enabled</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
