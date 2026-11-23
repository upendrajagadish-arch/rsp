import { revalidatePath } from "next/cache";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/product/page-header";
import { EmptyState } from "@/components/product/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/utils";

async function removeFromShortlist(formData: FormData) {
  "use server";
  const session = await requireSession(["recruiter"]);
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing shortlist id");
  const supabase = await createClient();
  const { error } = await supabase
    .from("recruiter_shortlists")
    .delete()
    .eq("id", id)
    .eq("recruiter_user_id", session.userId);
  if (error) throw new Error(error.message);
  revalidatePath("/recruiter/shortlist");
}

export default async function RecruiterShortlistPage() {
  const session = await requireSession(["recruiter"]);
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("recruiter_shortlists")
    .select(
      "id, notes, created_at, student_profiles(passport_id, degree, branch, profiles(full_name, email))",
    )
    .eq("recruiter_user_id", session.userId)
    .order("created_at", { ascending: false });

  const list = rows ?? [];

  return (
    <div>
      <PageHeader title="Shortlist" description="Candidates you saved from talent search." />

      {!list.length ? (
        <EmptyState
          title="Shortlist is empty"
          description="Add students from search when their passport sharing is enabled."
          icon={Briefcase}
          actionLabel="Search students"
          actionHref="/recruiter"
        />
      ) : (
        <ul className="space-y-3">
          {list.map((row) => {
            const student = row.student_profiles as unknown as {
              passport_id: string;
              degree: string | null;
              branch: string | null;
              profiles: { full_name: string | null; email: string } | null;
            } | null;
            const name = student?.profiles?.full_name ?? student?.profiles?.email ?? "Student";
            return (
              <li key={row.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--navy)] text-xs font-semibold text-white">
                        {initials(name)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--navy)]">{name}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {student?.passport_id} · {[student?.degree, student?.branch].filter(Boolean).join(" · ")}
                        </p>
                        {row.notes ? <p className="mt-1 text-sm text-[var(--muted)]">{row.notes}</p> : null}
                        <p className="text-xs text-[var(--muted)]">Saved {formatDate(row.created_at)}</p>
                      </div>
                    </div>
                    <form action={removeFromShortlist}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Remove
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}