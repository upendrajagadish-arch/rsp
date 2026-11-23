"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(2),
  issuing_organization: z.string().optional(),
  recipient_name: z.string().optional(),
  issue_date: z.string().optional(),
  expiration_date: z.string().optional(),
  credential_number: z.string().optional(),
  credential_url: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ExtractionReviewForm({
  certificateId,
  defaults,
  rawTextPreview,
}: {
  certificateId: string;
  defaults: FormValues;
  rawTextPreview?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const response = await fetch(`/api/certificates/${certificateId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(json.error ?? "Could not save fields");
      return;
    }
    router.push(`/student/certificates/${certificateId}/verification`);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {rawTextPreview ? (
        <div>
          <Label>Extracted text (preview)</Label>
          <Textarea readOnly rows={5} value={rawTextPreview.slice(0, 2000)} className="mt-1 font-mono text-xs" />
        </div>
      ) : null}
      {(
        [
          ["title", "Credential title"],
          ["issuing_organization", "Issuing organization"],
          ["recipient_name", "Recipient name"],
          ["issue_date", "Issue date (YYYY-MM-DD)"],
          ["expiration_date", "Expiration (YYYY-MM-DD)"],
          ["credential_number", "Credential number"],
          ["credential_url", "Verification URL"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={key}>{label}</Label>
          <Input id={key} {...form.register(key)} />
        </div>
      ))}
      {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Confirm & queue verification"}
      </Button>
    </form>
  );
}