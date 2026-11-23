"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/constants";

export function CertificateUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(
  async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF, JPG, or PNG file.");
      return;
    }
    if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
      setError("Unsupported file type.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("File exceeds 12MB.");
      return;
    }

    setError(null);
    setBusy(true);
    setProgress(8);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/certificates/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.min(95, Math.round((e.loaded / e.total) * 100)));
          }
        };
        xhr.onload = () => {
          resolve(
            new Response(xhr.responseText, {
              status: xhr.status,
              headers: { "Content-Type": "application/json" },
            }),
          );
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(body);
      });

      const json = (await response.json()) as {
        error?: string;
        certificate?: { id: string };
        duplicate?: boolean;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Upload failed");
      }

      setProgress(100);
      const id = json.certificate?.id;
      if (id) {
        router.push(json.duplicate ? `/student/certificates/${id}` : `/student/certificates/${id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress(0);
    } finally {
      setBusy(false);
    }
  },
  [file, router],
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="certificate-file">Certificate file</Label>
        <Input
          id="certificate-file"
          type="file"
          accept={ALLOWED_MIME.join(",")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-[var(--muted)]">
          PDF, JPG, or PNG up to 12MB. Uploads start as pending verification — never issuer verified until an
          approved adapter confirms them.
        </p>
      </div>
      {progress > 0 ? (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-[var(--muted)]">{busy ? "Uploading…" : "Complete"}</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
      <Button type="submit" disabled={busy || !file}>
        <Upload className="mr-2 h-4 w-4" />
        {busy ? "Uploading…" : "Upload certificate"}
      </Button>
    </form>
  );
}