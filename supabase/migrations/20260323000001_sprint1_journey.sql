-- Sprint 1: career journeys, milestones, learning preferences
-- Extends existing job_roles / skills; does not alter certificate verification.

create table if not exists public.career_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  job_role_id uuid references public.job_roles (id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.career_path_skills (
  id uuid primary key default gen_random_uuid(),
  career_path_id uuid not null references public.career_paths (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  stage text not null default 'foundation',
  is_required boolean not null default true,
  sort_order integer not null default 0,
  unique (career_path_id, skill_id)
);

create table if not exists public.skill_milestones (
  id uuid primary key default gen_random_uuid(),
  career_path_id uuid not null references public.career_paths (id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null,
  sort_order integer not null default 0,
  estimated_hours integer,
  completion_requirements text not null,
  created_at timestamptz not null default now(),
  unique (career_path_id, slug)
);

create table if not exists public.skill_milestone_skills (
  milestone_id uuid not null references public.skill_milestones (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  is_required boolean not null default true,
  primary key (milestone_id, skill_id)
);

create table if not exists public.skill_milestone_resources (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.skill_milestones (id) on delete cascade,
  title text not null,
  provider text,
  url text not null,
  resource_type text not null default 'course',
  is_free boolean not null default true,
  estimated_hours numeric(6,1),
  notes text
);

create table if not exists public.learning_preferences (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null unique references public.student_profiles (id) on delete cascade,
  degree text,
  branch text,
  experience_level text not null default 'beginner',
  career_path_id uuid references public.career_paths (id) on delete set null,
  technologies jsonb not null default '[]'::jsonb,
  declared_skills jsonb not null default '[]'::jsonb,
  weekly_hours integer not null default 5,
  goals_paused boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_milestones (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  milestone_id uuid not null references public.skill_milestones (id) on delete cascade,
  status text not null default 'available',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  started_at timestamptz,
  completed_at timestamptz,
  evidence_notes text,
  unique (student_profile_id, milestone_id)
);

create index if not exists learning_preferences_path_idx on public.learning_preferences (career_path_id);
create index if not exists student_milestones_student_idx on public.student_milestones (student_profile_id);

alter table public.career_paths enable row level security;
alter table public.career_path_skills enable row level security;
alter table public.skill_milestones enable row level security;
alter table public.skill_milestone_skills enable row level security;
alter table public.skill_milestone_resources enable row level security;
alter table public.learning_preferences enable row level security;
alter table public.student_milestones enable row level security;

create policy career_paths_read on public.career_paths for select to authenticated using (true);
create policy career_path_skills_read on public.career_path_skills for select to authenticated using (true);
create policy skill_milestones_read on public.skill_milestones for select to authenticated using (true);
create policy skill_milestone_skills_read on public.skill_milestone_skills for select to authenticated using (true);
create policy skill_milestone_resources_read on public.skill_milestone_resources for select to authenticated using (true);

create policy learning_preferences_own on public.learning_preferences for all using (
  student_profile_id = public.current_student_profile_id()
  or exists (
    select 1 from public.student_profiles sp
    where sp.id = student_profile_id and public.has_role(sp.organization_id, 'college_admin')
  )
) with check (
  student_profile_id = public.current_student_profile_id()
);

create policy student_milestones_own on public.student_milestones for all using (
  student_profile_id = public.current_student_profile_id()
  or exists (
    select 1 from public.student_profiles sp
    where sp.id = student_profile_id and public.has_role(sp.organization_id, 'college_admin')
  )
) with check (
  student_profile_id = public.current_student_profile_id()
);
