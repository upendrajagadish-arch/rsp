-- Skill Passport booklet — achievements, stamps, physical issuance stubs
-- Extends existing student_profiles / certificates; does not alter issuer_verified semantics.

create type public.achievement_status as enum (
  'locked',
  'submitted',
  'verified',
  'rejected',
  'revoked'
);

create type public.physical_stamp_status as enum (
  'eligible',
  'awaiting_allocation',
  'ready_for_collection',
  'issued',
  'replacement_requested',
  'cancelled'
);

create table if not exists public.stamp_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  colour text not null,
  icon_key text not null default 'seal',
  page_group text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.student_passports (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null unique references public.student_profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  passport_number text not null unique,
  issued_at timestamptz not null default now(),
  last_page integer not null default 0,
  level_key text not null default 'skill_beginner',
  cover_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  passport_id uuid references public.student_passports (id) on delete set null,
  stamp_category_id uuid not null references public.stamp_categories (id),
  title text not null,
  issuer text,
  completed_on date,
  status public.achievement_status not null default 'submitted',
  source_type text not null,
  source_id text,
  achievement_code text not null unique,
  evidence_note text,
  verified_at timestamptz,
  seen_unlock_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists student_achievements_active_source_uidx
  on public.student_achievements (student_profile_id, source_type, source_id)
  where source_id is not null and status <> 'revoked';

create index if not exists student_achievements_student_status_idx
  on public.student_achievements (student_profile_id, status);

create index if not exists student_achievements_org_status_idx
  on public.student_achievements (organization_id, status);

create table if not exists public.achievement_evidence (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.student_achievements (id) on delete cascade,
  label text not null,
  storage_path text,
  url text,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.achievement_verifications (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references public.student_achievements (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  from_status public.achievement_status,
  to_status public.achievement_status,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.physical_stamp_issuances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  achievement_id uuid not null references public.student_achievements (id) on delete cascade,
  stamp_category_id uuid not null references public.stamp_categories (id),
  status public.physical_stamp_status not null default 'eligible',
  department text,
  issuing_faculty text,
  issuance_ref text unique,
  issued_at timestamptz,
  printer_station text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists physical_stamp_active_achievement_uidx
  on public.physical_stamp_issuances (achievement_id)
  where status not in ('cancelled');

create table if not exists public.passport_activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  student_profile_id uuid references public.student_profiles (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists passport_activity_log_student_idx
  on public.passport_activity_log (student_profile_id, created_at desc);

-- Seed 24 official stamp categories
insert into public.stamp_categories (code, title, colour, icon_key, page_group, sort_order) values
  ('01', 'Certification Completed', '#6B4C9A', 'certificate', 'certifications', 1),
  ('02', 'Project Completed', '#2F6B4F', 'project', 'projects', 2),
  ('03', 'Internship Completed', '#C46A2B', 'internship', 'internships', 3),
  ('04', 'Hackathon Participated', '#B33A3A', 'hackathon', 'hackathons', 4),
  ('05', 'Hackathon Winner', '#6B4C9A', 'trophy', 'hackathons', 5),
  ('06', 'Leadership Role', '#2F6B4F', 'leadership', 'leadership', 6),
  ('07', 'Volunteer Service', '#2F5F8A', 'volunteer', 'leadership', 7),
  ('08', 'Semester Topper — 1st', '#7A5C3A', 'medal', 'academic', 8),
  ('09', 'Semester Topper — 2nd', '#7A5C3A', 'medal', 'academic', 9),
  ('10', 'Semester Topper — 3rd', '#7A5C3A', 'medal', 'academic', 10),
  ('11', 'Sports — 1st Place', '#2F5F8A', 'sports', 'sports', 11),
  ('12', 'Sports — 2nd Place', '#2F5F8A', 'sports', 'sports', 12),
  ('13', 'Sports — 3rd Place', '#2F5F8A', 'sports', 'sports', 13),
  ('14', 'Event Participation', '#6B4C9A', 'event', 'cultural', 14),
  ('15', 'Event Winner', '#B69A59', 'trophy', 'cultural', 15),
  ('16', 'Dance Participation', '#9B2C4A', 'dance', 'cultural', 16),
  ('17', 'Singing Participation', '#B33A3A', 'music', 'cultural', 17),
  ('18', 'Anchoring Participation', '#6B4C9A', 'mic', 'cultural', 18),
  ('19', 'Drama Participation', '#6A3D8A', 'drama', 'cultural', 19),
  ('20', 'Music Participation', '#9B2C4A', 'music', 'cultural', 20),
  ('21', 'Paper Publication', '#B33A3A', 'publication', 'research', 21),
  ('22', 'Extracurricular Activity', '#9B2C4A', 'extra', 'cultural', 22),
  ('23', 'Cultural Participation', '#2F5F8A', 'culture', 'cultural', 23),
  ('24', 'Book Writing', '#1F6F6A', 'book', 'research', 24)
on conflict (code) do nothing;

alter table public.stamp_categories enable row level security;
alter table public.student_passports enable row level security;
alter table public.student_achievements enable row level security;
alter table public.achievement_evidence enable row level security;
alter table public.achievement_verifications enable row level security;
alter table public.physical_stamp_issuances enable row level security;
alter table public.passport_activity_log enable row level security;

-- Read policies (org members); writes via service role / privileged paths
create policy stamp_categories_read on public.stamp_categories
  for select to authenticated using (true);

create policy student_passports_read on public.student_passports
  for select to authenticated using (
    organization_id in (
      select organization_id from public.organization_memberships
      where user_id = auth.uid() and is_active
    )
  );

create policy student_achievements_read on public.student_achievements
  for select to authenticated using (
    organization_id in (
      select organization_id from public.organization_memberships
      where user_id = auth.uid() and is_active
    )
  );

create policy achievement_evidence_read on public.achievement_evidence
  for select to authenticated using (
    achievement_id in (
      select id from public.student_achievements
      where organization_id in (
        select organization_id from public.organization_memberships
        where user_id = auth.uid() and is_active
      )
    )
  );

create policy achievement_verifications_read on public.achievement_verifications
  for select to authenticated using (
    achievement_id in (
      select id from public.student_achievements
      where organization_id in (
        select organization_id from public.organization_memberships
        where user_id = auth.uid() and is_active
      )
    )
  );

create policy physical_stamp_issuances_read on public.physical_stamp_issuances
  for select to authenticated using (
    organization_id in (
      select organization_id from public.organization_memberships
      where user_id = auth.uid() and is_active
    )
  );

create policy passport_activity_log_read on public.passport_activity_log
  for select to authenticated using (
    organization_id in (
      select organization_id from public.organization_memberships
      where user_id = auth.uid() and is_active
    )
  );
