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
