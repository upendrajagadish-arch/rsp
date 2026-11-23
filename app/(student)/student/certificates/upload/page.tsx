"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";
import { PageHeader } from "@/components/product/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/constants";

export default function CertificateUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a PDF, JPG, or PNG file.");
      return;
    }
    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      setError("Only PDF, JPG, and PNG files are accepted.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("File exceeds the 12MB upload limit.");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      const form = new FormData();
      form.set("file", file);
      setProgress(35);

      const res = await fetch("/api/certificates/upload", {
        method: "POST",
        body: form,
      });
      setProgress(85);

      const data = (await res.json()) as {
        error?: string;
        certificate?: { id: string };
        duplicate?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      const certId = data.certificate?.id;
      if (!certId) throw new Error("Certificate id missing from response");

      setProgress(100);
      router.push(`/student/certificates/${certId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Upload certificate"
        description="Files are stored privately and hashed. Verification never marks issuer_verified from the UI alone."
      />

      <Card className="max-w-xl">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="certificate-file">Credential file</Label>
              <input
                id="certificate-file"
                type="file"
                accept={ALLOWED_MIME.join(",")}
                disabled={uploading}
                className="block w-full text-sm text-[var(--navy)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--emerald)]"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-[var(--muted)]">Max 12MB · PDF, JPEG, or PNG</p>
            </div>

            {uploading || progress > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>Upload progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={uploading || !file}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : "Upload & continue"}
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href="/student/certificates">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}