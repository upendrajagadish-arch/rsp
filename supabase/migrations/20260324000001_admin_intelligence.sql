-- Admin Student Intelligence & Placement Monitoring
-- Extends student records; does not alter certificate issuer_verified semantics.

alter table public.student_profiles
  add column if not exists roll_number text,
  add column if not exists academic_year text,
  add column if not exists cgpa numeric(4,2),
  add column if not exists academic_eligible boolean not null default true,
  add column if not exists needs_support boolean not null default false,
  add column if not exists support_reason text,
  add column if not exists placement_status text not null default 'not_started',
  add column if not exists active_learner boolean not null default false,
  add column if not exists last_activity_at timestamptz;

create unique index if not exists student_profiles_org_roll_uidx
  on public.student_profiles (organization_id, roll_number)
  where roll_number is not null;

create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  skill_tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  program_id uuid not null references public.training_programs (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  status text not null default 'assigned',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (program_id, student_profile_id)
);

create table if not exists public.placement_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  company_name text not null,
  job_role_title text not null,
  stage text not null default 'applied',
  status text not null default 'open',
  missing_skills text[] not null default '{}',
  notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid references public.student_profiles (id) on delete set null,
  event_type text not null,
  title text not null,
  detail text,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.placement_import_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  source_label text not null,
  source_kind text not null default 'csv',
  column_mapping jsonb not null default '{}'::jsonb,
  status text not null default 'preview',
  rows_total integer not null default 0,
  rows_imported integer not null default 0,
  rows_failed integer not null default 0,
  rows_skipped integer not null default 0,
  failure_report jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists training_enrollments_student_idx
  on public.training_enrollments (student_profile_id);
create index if not exists placement_applications_student_idx
  on public.placement_applications (student_profile_id);
create index if not exists admin_activity_org_idx
  on public.admin_activity_events (organization_id, created_at desc);
create index if not exists student_profiles_placement_idx
  on public.student_profiles (organization_id, placement_status);

alter table public.training_programs enable row level security;
alter table public.training_enrollments enable row level security;
alter table public.placement_applications enable row level security;
alter table public.admin_activity_events enable row level security;
alter table public.placement_import_runs enable row level security;

-- Org-scoped admin read/write via existing membership helpers when present.
do $$
begin
  if exists (
    select 1 from pg_proc
    where proname = 'is_org_admin' and pg_function_is_visible(oid)
  ) then
    execute $p$
      create policy training_programs_admin on public.training_programs
        for all to authenticated
        using (public.is_org_admin(organization_id))
        with check (public.is_org_admin(organization_id));
      create policy training_enrollments_admin on public.training_enrollments
        for all to authenticated
        using (public.is_org_admin(organization_id))
        with check (public.is_org_admin(organization_id));
      create policy placement_applications_admin on public.placement_applications
        for all to authenticated
        using (public.is_org_admin(organization_id))
        with check (public.is_org_admin(organization_id));
      create policy admin_activity_admin on public.admin_activity_events
        for select to authenticated
        using (public.is_org_admin(organization_id));
      create policy placement_import_admin on public.placement_import_runs
        for all to authenticated
        using (public.is_org_admin(organization_id))
        with check (public.is_org_admin(organization_id));
    $p$;
  end if;
end $$;
