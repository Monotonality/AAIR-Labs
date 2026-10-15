-- Library metadata: document type, topical/geographic/methodological/data tags,
-- and multiple (co-)authors per project.

-- 1. Document type --------------------------------------------------------------

create type public.document_type as enum (
  'research_paper',
  'working_paper',
  'whitepaper',
  'technical_framework',
  'project_status_paper',
  'other'
);

alter table public.projects
  add column document_type public.document_type not null default 'research_paper',
  add column topics text[] not null default '{}',
  add column geographic_scope text[] not null default '{}',
  add column methodology text[] not null default '{}',
  add column data_sources text[] not null default '{}';

-- 2. Project authors (supports co-authors) --------------------------------------

create table public.project_authors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'co_author'
    check (role in ('author', 'co_author')),
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create index project_authors_project_idx on public.project_authors (project_id);
create index project_authors_profile_idx on public.project_authors (profile_id);

-- 3. RLS for project_authors -----------------------------------------------------
-- Readable wherever the parent project is readable; writable by a project author
-- or a director.

alter table public.project_authors enable row level security;

create policy "project_authors_select_readable" on public.project_authors
  for select using (
    public.project_has_published_draft(project_id)
    or public.user_is_project_author(project_id)
    or public.is_director()
  );

create policy "project_authors_insert_own_or_director" on public.project_authors
  for insert with check (
    public.user_is_project_author(project_id)
    or public.is_director()
  );

create policy "project_authors_update_own_or_director" on public.project_authors
  for update using (
    public.user_is_project_author(project_id)
    or public.is_director()
  ) with check (
    public.user_is_project_author(project_id)
    or public.is_director()
  );

create policy "project_authors_delete_own_or_director" on public.project_authors
  for delete using (
    public.user_is_project_author(project_id)
    or public.is_director()
  );
