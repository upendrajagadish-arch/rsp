"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminReviewForm({
  certificateId,
  canReview,
}: {
  certificateId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(decision: "institution_reviewed" | "rejected") {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verification/${certificateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Review failed");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setSaving(false);
    }
  }

  if (!canReview) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Issuer-verified credentials cannot be overridden from this form. Record an audited override
        instead of replacing the issuer stamp.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`notes-${certificateId}`}>Review notes</Label>
        <Textarea
          id={`notes-${certificateId}`}
          rows={3}
          minLength={3}
          value={notes}
          disabled={saving}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain the institutional decision (required, min. 3 characters)."
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={saving || notes.trim().length < 3}
          onClick={() => submit("institution_reviewed")}
        >
          Approve (institution reviewed)
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || notes.trim().length < 3}
          onClick={() => submit("rejected")}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}