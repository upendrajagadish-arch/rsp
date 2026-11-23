"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createShareLinkAction,
  revokeShareAction,
  setSharingEnabled,
} from "@/app/(student)/student/passport/actions";

export function PassportSharePanel({
  studentProfileId,
  sharingEnabled,
  activeShares,
}: {
  studentProfileId: string;
  sharingEnabled: boolean;
  activeShares: Array<{ id: string; label: string | null; created_at: string; expires_at: string | null }>;
}) {
  const [label, setLabel] = useState("Recruiter link");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestLink, setLatestLink] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  async function toggleSharing() {
    setPending(true);
    setError(null);
    try {
      await setSharingEnabled(!sharingEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  async function createShare() {
    setPending(true);
    setError(null);
    try {
      const data = await createShareLinkAction(studentProfileId, label);
      const url = data.url;
      setLatestLink(url);
      try {
        const qr = await QRCode.toDataURL(url, { margin: 1, width: 200 });
        setQrDataUrl(qr);
      } catch {
        setQrDataUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share failed");
    } finally {
      setPending(false);
    }
  }

  async function revokeShare(shareId: string) {
    setPending(true);
    setError(null);
    try {
      await revokeShareAction(shareId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-4">
        <div>
          <p className="font-medium text-[var(--navy)]">Public sharing</p>
          <p className="text-sm text-[var(--muted)]">
            Recruiters in your organization can view your passport when this is on and a valid share
            token is used.
          </p>
        </div>
        <Button type="button" variant={sharingEnabled ? "outline" : "default"} disabled={pending} onClick={toggleSharing}>
          {sharingEnabled ? "Turn sharing off" : "Enable sharing"}
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--border)] p-4">
        <div className="mb-4 space-y-2">
          <Label htmlFor="share-label">Link label</Label>
          <Input
            id="share-label"
            value={label}
            disabled={pending || !sharingEnabled}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <Button type="button" disabled={pending || !sharingEnabled} onClick={createShare}>
          Create share link
        </Button>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Tokens are stored as SHA-256 hashes. Copy the link immediately — it is shown once.
        </p>
      </div>

      {latestLink ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-sm font-medium text-emerald-900">New share link</p>
          <a href={latestLink} className="mt-1 block break-all text-sm text-emerald-800 underline">
            {latestLink}
          </a>
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="QR code for passport share link"
              width={200}
              height={200}
              unoptimized
              className="mt-4 rounded-md border border-[var(--border)] bg-white p-2"
            />
          ) : (
            <p className="mt-2 text-xs text-[var(--muted)]">QR preview unavailable — use the link above.</p>
          )}
        </div>
      ) : null}

      {activeShares.length ? (
        <ul className="space-y-2">
          {activeShares.map((share) => (
            <li
              key={share.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
            >
              <span>
                {share.label || "Share link"} · created {new Date(share.created_at).toLocaleDateString()}
                {share.expires_at ? ` · expires ${new Date(share.expires_at).toLocaleDateString()}` : ""}
              </span>
              <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => revokeShare(share.id)}>
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}