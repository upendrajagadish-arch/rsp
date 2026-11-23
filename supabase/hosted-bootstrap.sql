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

-- Helper functions and RLS policies

create or replace function public.is_member_of(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.is_active = true
  );
$$;

create or replace function public.has_role(org_id uuid, wanted public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.role = wanted
      and m.is_active = true
  );
$$;

create or replace function public.current_student_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select sp.id
  from public.student_profiles sp
  where sp.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger student_profiles_updated before update on public.student_profiles
  for each row execute function public.set_updated_at();
create trigger certificates_updated before update on public.certificates
  for each row execute function public.set_updated_at();
create trigger processing_jobs_updated before update on public.processing_jobs
  for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.student_profiles enable row level security;
alter table public.technology_categories enable row level security;
alter table public.skills enable row level security;
alter table public.skill_aliases enable row level security;
alter table public.certificates enable row level security;
alter table public.certificate_extractions enable row level security;
alter table public.credential_verifications enable row level security;
alter table public.verification_events enable row level security;
alter table public.student_skills enable row level security;
alter table public.skill_evidence enable row level security;
alter table public.projects enable row level security;
alter table public.project_skills enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_results enable row level security;
alter table public.job_roles enable row level security;
alter table public.job_role_requirements enable row level security;
alter table public.passport_shares enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.recruiter_shortlists enable row level security;

-- Profiles
create policy profiles_select_self on public.profiles for select using (
  id = auth.uid() or exists (
    select 1 from public.organization_memberships me
    join public.organization_memberships them on them.organization_id = me.organization_id
    where me.user_id = auth.uid() and them.user_id = profiles.id and me.is_active
  )
);
create policy profiles_update_self on public.profiles for update using (id = auth.uid());

-- Organizations
create policy orgs_select_member on public.organizations for select using (public.is_member_of(id));

-- Memberships
create policy memberships_select on public.organization_memberships for select using (
  user_id = auth.uid() or public.is_member_of(organization_id)
);

-- Student profiles
create policy student_profiles_select on public.student_profiles for select using (
  user_id = auth.uid()
  or public.has_role(organization_id, 'college_admin')
  or (
    sharing_enabled = true
    and public.has_role(organization_id, 'recruiter')
  )
);
create policy student_profiles_update_self on public.student_profiles for update using (user_id = auth.uid());
create policy student_profiles_admin_update on public.student_profiles for update using (
  public.has_role(organization_id, 'college_admin')
);

-- Taxonomy readable to authenticated
create policy tech_categories_read on public.technology_categories for select to authenticated using (true);
create policy skills_read on public.skills for select to authenticated using (true);
create policy skill_aliases_read on public.skill_aliases for select to authenticated using (true);
create policy job_roles_read on public.job_roles for select to authenticated using (true);
create policy job_req_read on public.job_role_requirements for select to authenticated using (true);

-- Certificates: owner + org admin; never other students
create policy certificates_select on public.certificates for select using (
  student_profile_id = public.current_student_profile_id()
  or public.has_role(organization_id, 'college_admin')
);
create policy certificates_insert_own on public.certificates for insert with check (
  student_profile_id = public.current_student_profile_id()
  and uploaded_by = auth.uid()
);
create policy certificates_update_own on public.certificates for update using (
  student_profile_id = public.current_student_profile_id()
  or public.has_role(organization_id, 'college_admin')
);

create policy extractions_select on public.certificate_extractions for select using (
  exists (
    select 1 from public.certificates c
    where c.id = certificate_id
      and (
        c.student_profile_id = public.current_student_profile_id()
        or public.has_role(c.organization_id, 'college_admin')
      )
  )
);
create policy extractions_update on public.certificate_extractions for update using (
  exists (
    select 1 from public.certificates c
    where c.id = certificate_id
      and (
        c.student_profile_id = public.current_student_profile_id()
        or public.has_role(c.organization_id, 'college_admin')
      )
  )
);

create policy verifications_select on public.credential_verifications for select using (
  exists (
    select 1 from public.certificates c
    where c.id = certificate_id
      and (
        c.student_profile_id = public.current_student_profile_id()
        or public.has_role(c.organization_id, 'college_admin')
        or (
          public.has_role(c.organization_id, 'recruiter')
          and exists (
            select 1 from public.student_profiles sp
            where sp.id = c.student_profile_id and sp.sharing_enabled
          )
        )
      )
  )
);

create policy verification_events_select on public.verification_events for select using (
  exists (
    select 1 from public.certificates c
    where c.id = certificate_id
      and (
        c.student_profile_id = public.current_student_profile_id()
        or public.has_role(c.organization_id, 'college_admin')
      )
  )
);

create policy student_skills_select on public.student_skills for select using (
  student_profile_id = public.current_student_profile_id()
  or exists (
    select 1 from public.student_profiles sp
    where sp.id = student_profile_id
      and (
        public.has_role(sp.organization_id, 'college_admin')
        or (sp.sharing_enabled and public.has_role(sp.organization_id, 'recruiter'))
      )
  )
);

create policy skill_evidence_select on public.skill_evidence for select using (
  exists (
    select 1 from public.student_skills ss
    join public.student_profiles sp on sp.id = ss.student_profile_id
    where ss.id = student_skill_id
      and (
        sp.user_id = auth.uid()
        or public.has_role(sp.organization_id, 'college_admin')
        or (sp.sharing_enabled and public.has_role(sp.organization_id, 'recruiter'))
      )
  )
);

create policy projects_all_own on public.projects for all using (
  student_profile_id = public.current_student_profile_id()
  or public.has_role(organization_id, 'college_admin')
) with check (
  student_profile_id = public.current_student_profile_id()
);

create policy project_skills_select on public.project_skills for select using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and (
        p.student_profile_id = public.current_student_profile_id()
        or public.has_role(p.organization_id, 'college_admin')
      )
  )
);

create policy assessments_select on public.assessments for select using (
  public.is_member_of(organization_id)
);

create policy assessment_results_select on public.assessment_results for select using (
  student_profile_id = public.current_student_profile_id()
  or exists (
    select 1 from public.student_profiles sp
    where sp.id = student_profile_id and public.has_role(sp.organization_id, 'college_admin')
  )
);

create policy passport_shares_own on public.passport_shares for all using (
  student_profile_id = public.current_student_profile_id()
) with check (
  student_profile_id = public.current_student_profile_id()
);

create policy notifications_own on public.notifications for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy audit_admin_select on public.audit_logs for select using (
  organization_id is not null and public.has_role(organization_id, 'college_admin')
);

create policy processing_jobs_select on public.processing_jobs for select using (
  public.has_role(organization_id, 'college_admin')
  or exists (
    select 1 from public.certificates c
    where c.id = certificate_id and c.student_profile_id = public.current_student_profile_id()
  )
);

create policy shortlists_recruiter on public.recruiter_shortlists for all using (
  recruiter_user_id = auth.uid()
) with check (
  recruiter_user_id = auth.uid() and public.has_role(organization_id, 'recruiter')
);

-- Storage bucket for private certificates
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  12582912,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy certificates_storage_select on storage.objects for select using (
  bucket_id = 'certificates'
  and auth.role() = 'authenticated'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.organization_memberships m
      where m.user_id = auth.uid()
        and m.role = 'college_admin'
        and m.is_active
        and m.organization_id::text = (storage.foldername(name))[2]
    )
  )
);

create policy certificates_storage_insert on storage.objects for insert with check (
  bucket_id = 'certificates'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy certificates_storage_delete on storage.objects for delete using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Demo college + taxonomy + job roles
-- Auth users are created via scripts/seed-demo-users.mjs after `supabase start`

insert into public.organizations (id, slug, name, type)
values ('11111111-1111-1111-1111-111111111111', 'demo-college', 'Demo Institute of Technology', 'college')
on conflict (slug) do nothing;

insert into public.technology_categories (id, slug, name, sort_order) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'programming-languages', 'Programming Languages', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'databases', 'Databases', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'cloud', 'Cloud Technologies', 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'web-development', 'Web Development', 4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'data-analytics', 'Data Analytics', 5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'cybersecurity', 'Cybersecurity', 6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'ai-ml', 'AI and Machine Learning', 7),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'professional', 'Professional Competencies', 8)
on conflict (slug) do nothing;

insert into public.skills (id, slug, name, category_id, description) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'python', 'Python', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Python programming language'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'programming-fundamentals', 'Programming Fundamentals', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Core programming concepts'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'data-structures', 'Data Structures', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Common data structures'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'javascript', 'JavaScript', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'JavaScript language'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', 'typescript', 'TypeScript', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Typed JavaScript'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 'sql', 'SQL', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Relational querying'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb07', 'postgresql', 'PostgreSQL', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'PostgreSQL database'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08', 'aws-services', 'AWS Services', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Amazon Web Services fundamentals'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb09', 'cloud-fundamentals', 'Cloud Fundamentals', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Core cloud concepts'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10', 'cloud-security-fundamentals', 'Cloud Security Fundamentals', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Basic cloud security'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', 'react', 'React', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'React UI library'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', 'nextjs', 'Next.js', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Next.js framework'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', 'data-analysis', 'Data Analysis', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Analyzing datasets'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', 'network-security', 'Network Security', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'Network defense basics'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb15', 'machine-learning', 'Machine Learning', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'ML fundamentals'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb16', 'communication', 'Communication', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'Professional communication')
on conflict (slug) do nothing;

insert into public.skill_aliases (skill_id, alias) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'python3'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'py'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08', 'amazon web services'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08', 'aws'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', 'react.js'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', 'next')
on conflict (alias) do nothing;

insert into public.job_roles (id, slug, title, description, version) values
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'software-developer', 'Software Developer', 'General software engineering role', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'data-analyst', 'Data Analyst', 'Data analysis and reporting', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc03', 'data-engineer', 'Data Engineer', 'Data pipelines and warehouses', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc04', 'cloud-engineer', 'Cloud Engineer', 'Cloud infrastructure', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc05', 'cybersecurity-analyst', 'Cybersecurity Analyst', 'Security monitoring and response', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc06', 'ai-ml-engineer', 'AI/ML Engineer', 'Applied machine learning', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc07', 'frontend-developer', 'Frontend Developer', 'Web UI engineering', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccc08', 'backend-developer', 'Backend Developer', 'Server-side engineering', 1)
on conflict (slug) do nothing;

insert into public.job_role_requirements (job_role_id, skill_id, weight, is_required) values
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 1.2, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 1.0, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 1.0, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb09', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb08', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10', 1.0, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10', 1.0, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccc06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb15', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', 1.5, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', 1.0, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccc08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 1.2, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 1.2, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb07', 1.0, false)
on conflict do nothing;

