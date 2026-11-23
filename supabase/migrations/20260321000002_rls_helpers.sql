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
