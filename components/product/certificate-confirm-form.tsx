"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = {
  title: string;
  issuing_organization: string;
  recipient_name: string;
  issue_date: string;
  expiration_date: string;
  credential_number: string;
  credential_url: string;
};

export function CertificateConfirmForm({
  certificateId,
  initial,
  disabled,
}: {
  certificateId: string;
  initial: Fields;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificates/${certificateId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title,
          issuing_organization: fields.issuing_organization || undefined,
          recipient_name: fields.recipient_name || undefined,
          issue_date: fields.issue_date || undefined,
          expiration_date: fields.expiration_date || undefined,
          credential_number: fields.credential_number || undefined,
          credential_url: fields.credential_url || "",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Confirm failed");
      router.push(`/student/certificates/${certificateId}/verification`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Credential title</Label>
          <Input
            id="title"
            required
            minLength={2}
            value={fields.title}
            disabled={disabled || saving}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuing_organization">Issuing organization</Label>
          <Input
            id="issuing_organization"
            value={fields.issuing_organization}
            disabled={disabled || saving}
            onChange={(e) => set("issuing_organization", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient_name">Recipient name</Label>
          <Input
            id="recipient_name"
            value={fields.recipient_name}
            disabled={disabled || saving}
            onChange={(e) => set("recipient_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issue_date">Issue date</Label>
          <Input
            id="issue_date"
            type="date"
            value={fields.issue_date}
            disabled={disabled || saving}
            onChange={(e) => set("issue_date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiration_date">Expiration date</Label>
          <Input
            id="expiration_date"
            type="date"
            value={fields.expiration_date}
            disabled={disabled || saving}
            onChange={(e) => set("expiration_date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credential_number">Credential ID / number</Label>
          <Input
            id="credential_number"
            value={fields.credential_number}
            disabled={disabled || saving}
            onChange={(e) => set("credential_number", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="credential_url">Public verification URL</Label>
          <Input
            id="credential_url"
            type="url"
            placeholder="https://"
            value={fields.credential_url}
            disabled={disabled || saving}
            onChange={(e) => set("credential_url", e.target.value)}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={disabled || saving}>
        {saving ? "Saving…" : "Confirm & start verification"}
      </Button>
    </form>
  );
}