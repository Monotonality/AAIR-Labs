-- AAIR Labs Centralized Web Portal — initial schema.
-- Mirrors the TRD: profiles, applications, projects, paper_drafts,
-- peer_reviews, events + storage for paper PDFs.

-- 1. Enums --------------------------------------------------------------------

create type public.user_role as enum ('guest', 'student', 'director', 'faculty');
create type public.proposal_status as enum (
  'pending',
  'approved',
  'rejected',
  'revision_requested'
);
create type public.paper_status as enum (
  'draft',
  'under_review',
  'revision_required',
  'published'
);
create type public.event_category as enum (
  'workshop',
  'soc_meeting',
  'headshot_session',
  'speaker'
);

-- 2. Profiles -----------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  email text,
  full_name text,
  role public.user_role not null default 'guest',
  major text,
  expected_grad_date date,
  fields_of_interest text[] not null default '{}',
  bio text,
  github_url text,
  linkedin_url text,
  research_tags text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_username_idx on public.profiles (username);
create index profiles_role_idx on public.profiles (role);

-- 3. Applications -------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  form_data jsonb not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  director_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Projects (research proposals) ---------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  abstract text not null,
  target_domain text,
  status public.proposal_status not null default 'pending',
  director_feedback text,
  status_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_author_idx on public.projects (author_id);
create index projects_status_idx on public.projects (status);

-- 5. Paper drafts ---------------------------------------------------------------

create table public.paper_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version int not null default 1,
  pdf_storage_path text,
  latex_url text,
  status public.paper_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version)
);

create index paper_drafts_project_idx on public.paper_drafts (project_id);
create index paper_drafts_status_idx on public.paper_drafts (status);

-- 6. Peer reviews ----------------------------------------------------------------

create table public.peer_reviews (
  id uuid primary key default gen_random_uuid(),
  paper_draft_id uuid not null references public.paper_drafts (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  feedback_notes text,
  recommended_status public.paper_status,
  is_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paper_draft_id, reviewer_id)
);

-- 7. Events -----------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  category public.event_category not null default 'workshop',
  registration_link text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index events_date_idx on public.events (event_date);

-- 8. updated_at trigger ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create trigger set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger set_updated_at
before update on public.paper_drafts
for each row execute function public.set_updated_at();

create trigger set_updated_at
before update on public.peer_reviews
for each row execute function public.set_updated_at();

-- 9. Auto-create a profile row when a new auth user signs up ------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, onboarding_completed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New Member'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')::public.user_role,
    coalesce((new.raw_user_meta_data ->> 'onboarding_completed')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 10. RLS helper functions -----------------------------------------------------------
-- SECURITY DEFINER so policy subqueries do not re-trigger RLS on the other
-- table (which caused infinite recursion between projects <-> paper_drafts).

create or replace function public.is_director()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'director'
  );
$$;

create or replace function public.user_is_project_author(pid uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.projects pr
    where pr.id = pid and pr.author_id = auth.uid()
  );
$$;

create or replace function public.project_has_published_draft(pid uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.paper_drafts pd
    where pd.project_id = pid and pd.status = 'published'
  );
$$;

-- 11. Row Level Security --------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.projects enable row level security;
alter table public.paper_drafts enable row level security;
alter table public.peer_reviews enable row level security;
alter table public.events enable row level security;

-- profiles: anyone can read; a member can edit their own row.
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- applications: owner can read/create their own, directors manage all.
create policy "applications_select_own_or_director" on public.applications
  for select using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'director'
    )
  );

create policy "applications_insert_own" on public.applications
  for insert with check (auth.uid() = profile_id);

create policy "applications_update_director" on public.applications
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'director'
    )
  );

-- projects: an author manages their own; directors manage all; the public can
-- read a project only once a draft of it has been published.
create policy "projects_select_published" on public.projects
  for select using (
    public.project_has_published_draft(id)
    or auth.uid() = author_id
    or public.is_director()
  );

create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = author_id);

create policy "projects_update_own_or_director" on public.projects
  for update using (
    auth.uid() = author_id
    or public.is_director()
  );

-- paper_drafts: published drafts are readable by everyone; authors manage
-- their own (through their projects); directors manage all.
create policy "drafts_select_published" on public.paper_drafts
  for select using (
    status = 'published'
    or public.user_is_project_author(project_id)
    or public.is_director()
  );

create policy "drafts_insert_own_project" on public.paper_drafts
  for insert with check (
    public.user_is_project_author(project_id)
  );

create policy "drafts_update_own_or_director" on public.paper_drafts
  for update using (
    public.user_is_project_author(project_id)
    or public.is_director()
  );

-- peer_reviews: reviewers read/update their own reviews; directors see all.
create policy "reviews_select_own_or_director" on public.peer_reviews
  for select using (
    auth.uid() = reviewer_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'director'
    )
  );

create policy "reviews_insert_reviewer" on public.peer_reviews
  for insert with check (auth.uid() = reviewer_id);

create policy "reviews_update_own" on public.peer_reviews
  for update using (auth.uid() = reviewer_id);

-- events: public read; directors manage.
create policy "events_select_all" on public.events
  for select using (true);

create policy "events_insert_director" on public.events
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'director'
    )
  );

create policy "events_update_director" on public.events
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'director'
    )
  );

create policy "events_delete_director" on public.events
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'director'
    )
  );

-- 12. Storage: research-papers bucket -------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('research-papers', 'research-papers', true, 20971520)
on conflict (id) do nothing;

-- Objects are read publicly (bucket is public). Writing is restricted to the
-- owning user; the upload handler keys paths as <user_id>/<project_id>/v<n>.pdf.
create policy "research_papers_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'research-papers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "research_papers_update_own"
on storage.objects for update
using (
  bucket_id = 'research-papers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "research_papers_delete_own"
on storage.objects for delete
using (
  bucket_id = 'research-papers'
  and (storage.foldername(name))[1] = auth.uid()::text
);