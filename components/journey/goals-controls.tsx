"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GoalsControls({ paused }: { paused: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/journey/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalsPaused: !paused }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update goals");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        disabled={busy}
        onClick={toggle}
      >
        {paused ? "Resume weekly goals" : "Pause weekly goals"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <p className="text-xs text-[var(--muted)]">
        Pausing stops recommended pressure only — milestones and evidence stay intact.
      </p>
    </div>
  );
}
