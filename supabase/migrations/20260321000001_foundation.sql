-- Smart Skill Passport — foundation schema
create extension if not exists "pgcrypto";

create type public.app_role as enum ('student', 'college_admin', 'recruiter');
create type public.verification_status as enum (
  'pending',
  'issuer_verified',
  'institution_reviewed',
  'unavailable',
  'rejected',
  'expired',
  'revoked'
);
create type public.evidence_source as enum (
  'credential',
  'assessment',
  'project',
  'self_declared'
);
create type public.job_status as enum (
  'queued',
  'processing',
  'needs_review',
  'completed',
  'failed',
  'cancelled'
);
create type public.certificate_pipeline_status as enum (
  'uploaded',
  'processing',
  'needs_review',
  'confirmed',
  'verifying',
  'complete',
  'failed'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type text not null default 'college',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  passport_id text not null unique,
  degree text,
  branch text,
  graduation_year integer,
  bio text,
  profile_completion integer not null default 0 check (profile_completion between 0 and 100),
  target_job_role_id uuid,
  sharing_enabled boolean not null default false,
  public_sections jsonb not null default '{"identity":true,"credentials":true,"skills":true,"projects":true,"assessments":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.technology_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references public.technology_categories (id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create table public.skill_aliases (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills (id) on delete cascade,
  alias text not null,
  unique (alias)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  title text,
  issuing_organization text,
  recipient_name text,
  issue_date date,
  expiration_date date,
  credential_number text,
  credential_url text,
  storage_path text not null,
  mime_type text not null,
  file_size_bytes integer not null,
  content_hash text not null,
  credential_fingerprint text,
  pipeline_status public.certificate_pipeline_status not null default 'uploaded',
  verification_status public.verification_status not null default 'pending',
  extraction_metadata jsonb not null default '{}'::jsonb,
  student_asserted jsonb not null default '{}'::jsonb,
  independently_verified jsonb not null default '{}'::jsonb,
  duplicate_of uuid references public.certificates (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, student_profile_id, content_hash)
);

create table public.certificate_extractions (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null unique references public.certificates (id) on delete cascade,
  raw_text text,
  structured jsonb not null default '{}'::jsonb,
  provider text,
  confidence numeric(5,4),
  student_confirmed boolean not null default false,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.credential_verifications (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  method text not null,
  status public.verification_status not null,
  evidence jsonb not null default '{}'::jsonb,
  source text,
  checked_at timestamptz not null default now(),
  reviewer_id uuid references public.profiles (id),
  reviewer_notes text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.verification_events (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  verification_id uuid references public.credential_verifications (id) on delete set null,
  event_type text not null,
  actor_id uuid references public.profiles (id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.student_skills (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  strongest_evidence public.evidence_source not null default 'self_declared',
  evidence_count integer not null default 0,
  last_evidenced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, skill_id)
);

create table public.skill_evidence (
  id uuid primary key default gen_random_uuid(),
  student_skill_id uuid not null references public.student_skills (id) on delete cascade,
  source_type public.evidence_source not null,
  certificate_id uuid references public.certificates (id) on delete cascade,
  project_id uuid,
  assessment_result_id uuid,
  status public.verification_status,
  notes text,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  url text,
  started_on date,
  completed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.skill_evidence
  add constraint skill_evidence_project_fk
  foreign key (project_id) references public.projects (id) on delete cascade;

create table public.project_skills (
  project_id uuid not null references public.projects (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  primary key (project_id, skill_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  skill_id uuid references public.skills (id) on delete set null,
  scoring_methodology text not null default 'Percentage of correct items on a timed quiz. Not a placement prediction.',
  max_score numeric(8,2) not null default 100,
  created_at timestamptz not null default now()
);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  score numeric(8,2) not null,
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.skill_evidence
  add constraint skill_evidence_assessment_fk
  foreign key (assessment_result_id) references public.assessment_results (id) on delete cascade;

create table public.job_roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.student_profiles
  add constraint student_profiles_target_role_fk
  foreign key (target_job_role_id) references public.job_roles (id) on delete set null;

create table public.job_role_requirements (
  id uuid primary key default gen_random_uuid(),
  job_role_id uuid not null references public.job_roles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  weight numeric(5,2) not null default 1,
  is_required boolean not null default true,
  unique (job_role_id, skill_id)
);

create table public.passport_shares (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  token_hash text not null unique,
  label text,
  is_active boolean not null default true,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  certificate_id uuid references public.certificates (id) on delete cascade,
  job_type text not null,
  status public.job_status not null default 'queued',
  idempotency_key text not null unique,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  locked_at timestamptz,
  locked_by text,
  run_after timestamptz not null default now(),
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recruiter_shortlists (
  id uuid primary key default gen_random_uuid(),
  recruiter_user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique (recruiter_user_id, student_profile_id)
);

create index certificates_student_idx on public.certificates (student_profile_id);
create index certificates_org_status_idx on public.certificates (organization_id, verification_status);
create index certificates_pipeline_idx on public.certificates (pipeline_status);
create index processing_jobs_claim_idx on public.processing_jobs (status, run_after) where status in ('queued', 'failed');
create index student_skills_student_idx on public.student_skills (student_profile_id);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index audit_logs_org_idx on public.audit_logs (organization_id, created_at desc);
create index memberships_user_idx on public.organization_memberships (user_id);
