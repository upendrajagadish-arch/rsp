import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { uploadCertificate } from "@/services/certificates";

export async function POST(request: Request) {
  try {
    const session = await requireSession(["student"]);
    if (!session.studentProfileId || !session.organizationId) {
      return NextResponse.json({ error: "Student profile required" }, { status: 403 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const result = await uploadCertificate({
      userId: session.userId,
      organizationId: session.organizationId,
      studentProfileId: session.studentProfileId,
      file,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
