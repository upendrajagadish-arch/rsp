# Integrations

Smart Skill Passport delegates trust to pluggable adapters and background workers. UI routes only enqueue work and display stored outcomes.

## Certificate upload → extract → verify

1. **Upload** (`POST /api/certificates/upload`) stores the file in the `certificates` storage bucket and inserts a `certificates` row with `verification_status: pending`.
2. **Extract** job (`processing_jobs.job_type = extract_certificate`) runs OCR/text extraction via `adapters/ocr` when `OCR_API_KEY` is configured.
3. **Student confirm** (`POST /api/certificates/[id]/confirm`) saves asserted fields and enqueues `verify_certificate`.
4. **Verify** (`services/verification.runVerificationPipeline`) runs issuer adapters from `adapters/issuer`. Only an adapter that returns `issuer_verified` may promote the certificate to that status.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser / RLS client |
| `SUPABASE_SERVICE_ROLE_KEY` | Service client (jobs, public passport) |
| `OCR_API_KEY` | Optional OCR provider for scanned PDFs / images |
| `JOB_WORKER_SECRET` | Shared secret for `POST /api/jobs/process` (`x-job-secret` header) |
| `NEXT_PUBLIC_APP_URL` | Base URL for passport share links (defaults to `http://localhost:3000`) |

## Configured vs unavailable (honest status)

| Integration | Status |
|-------------|--------|
| PDF text extraction (`unpdf`) | Implemented for text-based PDFs |
| Image / scanned OCR | **Unavailable** until `OCR_API_KEY` + provider adapter is configured |
| Trusted issuer APIs (Credly, Google, etc.) | **Unavailable** — adapter interface present; default returns `unavailable` |
| QR / verification URL presence | Implemented with SSRF guards; **does not** grant Issuer Verified |
| Institutional manual review | Implemented for college admins |
| Cryptographic credential standards | Not wired in v1 — surfaces as unavailable |

## Issuer adapters

Implement `IssuerAdapter` in `adapters/issuer/index.ts`:

- `supports(input)` — whether the adapter can attempt verification
- `verify(input)` — async check; must not return `issuer_verified` without a real issuer API response

The bundled `UnavailableIssuerAdapter` is the safe default when no trusted integration is configured.

## OCR

`adapters/ocr` extracts text from uploaded PDFs/images. Without `OCR_API_KEY`, scans may remain in `needs_review` until the student confirms fields manually.

## Background jobs

`POST /api/jobs/process` (service-only) claims rows from `processing_jobs` and runs extraction or verification handlers in `services/jobs.ts`. Use a cron or local script in development to drain the queue.

## Passport sharing

`services/passport.createShareLink(studentProfileId, label)` generates a random token, persists `sha256(token)` in `passport_shares`, and returns the raw token once. Public reads use `getPublicPassport(token)` with the service role client.

## Auditing

`services/audit.writeAuditLog` records certificate, passport, and review events in `audit_logs` for the admin audit console.