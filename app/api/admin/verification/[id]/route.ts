import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { institutionReview } from "@/services/verification";

const schema = z.object({
  decision: z.enum(["institution_reviewed", "rejected"]),
  notes: z.string().min(3),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession(["college_admin"]);
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    await institutionReview({
      certificateId: id,
      reviewerId: session.userId,
      decision: body.decision,
      notes: body.notes,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review failed" },
      { status: 400 },
    );
  }
}
