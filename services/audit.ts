import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";

export async function writeAuditLog(input: {
  organizationId?: string | null;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json;
  asService?: boolean;
}) {
  const supabase = createServiceClient();
  await supabase.from("audit_logs").insert({
    organization_id: input.organizationId ?? null,
    actor_id: input.actorId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}
