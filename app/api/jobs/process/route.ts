import { NextResponse } from "next/server";
import { claimJobs, processJob } from "@/services/jobs";

export async function POST(request: Request) {
  const secret =
    request.headers.get("job-worker-secret") ??
    request.headers.get("x-job-worker-secret") ??
    request.headers.get("x-job-secret");
  if (!process.env.JOB_WORKER_SECRET || secret !== process.env.JOB_WORKER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = request.headers.get("x-worker-id") ?? `worker-${Date.now()}`;
  const jobs = await claimJobs(workerId, 5);
  const results = [];
  for (const job of jobs) {
    try {
      await processJob({
        id: job.id,
        job_type: job.job_type,
        certificate_id: job.certificate_id,
        payload: (job.payload ?? {}) as Record<string, unknown>,
      });
      results.push({ id: job.id, ok: true });
    } catch (error) {
      results.push({
        id: job.id,
        ok: false,
        error: error instanceof Error ? error.message : "failed",
      });
    }
  }
  return NextResponse.json({ processed: results.length, results });
}
