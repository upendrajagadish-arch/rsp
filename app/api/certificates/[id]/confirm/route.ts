import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { confirmExtraction } from "@/services/certificates";

const schema = z.object({
  title: z.string().min(2),
  issuing_organization: z.string().optional(),
  recipient_name: z.string().optional(),
  issue_date: z.string().optional(),
  expiration_date: z.string().optional(),
  credential_number: z.string().optional(),
  credential_url: z.string().url().optional().or(z.literal("")),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession(["student"]);
    if (!session.studentProfileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    await confirmExtraction(id, session.studentProfileId, {
      ...body,
      credential_url: body.credential_url || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Confirm failed" },
      { status: 400 },
    );
  }
}
