import { Shield } from "lucide-react";
import { AdminGlass, AdminPageTitle } from "@/components/admin/admin-theme-shell";
import { requireSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { getAdminOverview } from "@/services/admin-intelligence";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditPage() {
  const session = await requireSession(["college_admin"]);
  const demo = session.demo || isDemoMode();
  const supabase = await createClient();
  const overview = await getAdminOverview(session.organizationId);

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at, profiles(full_name)")
    .eq("organization_id", session.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  type Item = {
    id: string;
    action: string;
    detail: string;
    createdAt: string;
    meta?: string | null;
  };

  let items: Item[] = (logs ?? []).map((log) => {
    const actor = log.profiles as unknown as { full_name: string | null } | null;
    return {
      id: log.id,
      action: log.action,
      detail: [
        log.entity_type,
        log.entity_id,
        actor?.full_name,
      ]
        .filter(Boolean)
        .join(" · "),
      createdAt: log.created_at,
      meta:
        log.metadata && Object.keys(log.metadata as object).length
          ? JSON.stringify(log.metadata, null, 2)
          : null,
    };
  });

  if (!items.length && demo) {
    items = overview.recentActivity.map((ev) => ({
      id: ev.id,
      action: ev.title,
      detail: [ev.detail, ev.studentName].filter(Boolean).join(" · "),
      createdAt: ev.createdAt,
      meta: null,
    }));
  }

  return (
    <div className="space-y-5 text-[#303030]">
      <AdminPageTitle
        title="Audit history"
        description="Immutable trail of certificate, passport, and review events — interactive timeline for ops."
        actions={
          <span className="rounded-full border border-[#898989]/25 bg-white/60 px-4 py-2 text-sm">
            {items.length} events
          </span>
        }
      />

      {!items.length ? (
        <AdminGlass className="flex flex-col items-center gap-3 p-12 text-center">
          <Shield className="h-10 w-10 text-[#898989]" />
          <p className="text-lg">No audit events yet</p>
          <p className="max-w-md text-sm text-[#898989]">
            Uploads, reviews, and passport shares will appear here as they occur.
          </p>
        </AdminGlass>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-[#898989]/20 pl-6">
          {items.map((item, i) => (
            <li key={item.id} className="relative">
              <span
                className={`absolute top-4 -left-[1.9rem] h-3 w-3 rounded-full ${
                  i === 0 ? "bg-[#FFD85F]" : "bg-[#303030]"
                }`}
              />
              <AdminGlass className="p-4 transition hover:bg-white/80">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">{item.action}</p>
                  <span className="text-xs text-[#898989]">{formatDate(item.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-[#898989]">{item.detail}</p>
                {item.meta ? (
                  <pre className="mt-3 max-h-32 overflow-auto rounded-2xl bg-[#303030] p-3 text-xs text-[#FFD85F]">
                    {item.meta}
                  </pre>
                ) : null}
              </AdminGlass>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
