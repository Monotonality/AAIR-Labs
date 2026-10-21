-- Phase 2: the project / working-paper pipeline.
--
-- Directors create projects (lead + co-authors + category, optionally linked
-- to an approved proposal). Only the lead and directors edit details and
-- upload the working paper, and only while the project is not approved.
-- Approved projects are the public library.

-- 1. Columns -------------------------------------------------------------------

alter table public.projects
  add column category public.proposal_category not null default 'research',
  add column proposal_id uuid references public.proposals (id) on delete set null;

create index projects_proposal_idx on public.projects (proposal_id);

-- 2. Helpers -------------------------------------------------------------------

create or replace function public.user_is_project_lead(pid uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.projects pr
    where pr.id = pid and pr.author_id = auth.uid()
  );
$$;

-- Lead, co-author, or any other listed project member.
create or replace function public.user_is_project_member(pid uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.projects pr
    where pr.id = pid and pr.author_id = auth.uid()
  ) or exists (
    select 1 from public.project_authors pa
    where pa.project_id = pid and pa.profile_id = auth.uid()
  );
$$;

create or replace function public.project_is_approved(pid uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.projects pr
    where pr.id = pid and pr.status = 'approved'
  );
$$;

-- Storage: paths are keyed by project (<project_id>/working-paper.pdf) so a
-- re-upload replaces the same object. Returns false for anything that is not
-- a project uuid (legacy files keep their old paths untouched).
create or replace function public.project_file_editable(path text)
returns boolean
language sql security definer set search_path = public
as $$
  select case
    when path is null
      or path !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      then false
    else exists (
      select 1 from public.projects pr
      where pr.id = path::uuid and (pr.author_id = auth.uid() or public.is_director())
    )
  end;
$$;

-- 3. projects ------------------------------------------------------------------

drop policy "projects_select_published" on public.projects;
drop policy "projects_select_working_paper" on public.projects;
drop policy "projects_insert_own" on public.projects;

-- Public: approved projects only. Members/co-authors/directors read their own.
create policy "projects_select_public_approved"
  on public.projects for select using (status = 'approved');

create policy "projects_select_member"
  on public.projects for select using (public.user_is_project_member(id));

-- Directors oversee every project (they create them with a lead, so they are
-- often not members themselves).
create policy "projects_select_director"
  on public.projects for select using (public.is_director());

-- Only directors create projects (author_id is the lead, not the creator).
create policy "projects_insert_director"
  on public.projects for insert with check (public.is_director());

-- Mistake cleanup; approved projects stay permanent. Cascades to drafts and
-- project_authors (roster rows).
create policy "projects_delete_director"
  on public.projects for delete using (public.is_director() and status <> 'approved');

-- projects_update_own_or_director (lead or director) stays as-is; the
-- status guards live in the server actions.

-- 4. paper_drafts --------------------------------------------------------------

drop policy "drafts_select_published" on public.paper_drafts;
drop policy "drafts_select_working_paper" on public.paper_drafts;
drop policy "drafts_insert_own_project" on public.paper_drafts;
drop policy "drafts_update_own_or_director" on public.paper_drafts;

create policy "drafts_select_public_approved"
  on public.paper_drafts for select using (public.project_is_approved(project_id));

create policy "drafts_select_member"
  on public.paper_drafts for select using (public.user_is_project_member(project_id));

create policy "drafts_select_director"
  on public.paper_drafts for select using (public.is_director());

create policy "drafts_insert_lead_or_director"
  on public.paper_drafts for insert
  with check (public.user_is_project_lead(project_id) or public.is_director());

create policy "drafts_update_lead_or_director"
  on public.paper_drafts for update
  using (public.user_is_project_lead(project_id) or public.is_director())
  with check (public.user_is_project_lead(project_id) or public.is_director());

-- 5. project_authors -----------------------------------------------------------

drop policy "project_authors_select_readable" on public.project_authors;
drop policy "project_authors_select_working_paper" on public.project_authors;
drop policy "project_authors_insert_own_or_director" on public.project_authors;
drop policy "project_authors_update_own_or_director" on public.project_authors;
drop policy "project_authors_delete_own_or_director" on public.project_authors;

create policy "project_authors_select_public_approved"
  on public.project_authors for select using (public.project_is_approved(project_id));

create policy "project_authors_select_member"
  on public.project_authors for select using (public.user_is_project_member(project_id));

create policy "project_authors_select_director"
  on public.project_authors for select using (public.is_director());

-- The roster is fixed at creation; only directors change it.
create policy "project_authors_insert_director"
  on public.project_authors for insert with check (public.is_director());

create policy "project_authors_update_director"
  on public.project_authors for update
  using (public.is_director())
  with check (public.is_director());

create policy "project_authors_delete_director"
  on public.project_authors for delete using (public.is_director());

-- 6. storage.objects -----------------------------------------------------------

drop policy "research_papers_insert_own" on storage.objects;
drop policy "research_papers_update_own" on storage.objects;
drop policy "research_papers_delete_own" on storage.objects;

-- SELECT is required for upsert: the storage API checks whether the object
-- exists before it decides to insert or update.
create policy "research_papers_select_project_lead"
  on storage.objects for select
  using (
    bucket_id = 'research-papers'
    and public.project_file_editable((storage.foldername(name))[1])
  );

create policy "research_papers_insert_project_lead"
  on storage.objects for insert
  with check (
    bucket_id = 'research-papers'
    and public.project_file_editable((storage.foldername(name))[1])
  );

create policy "research_papers_update_project_lead"
  on storage.objects for update
  using (
    bucket_id = 'research-papers'
    and public.project_file_editable((storage.foldername(name))[1])
  );

create policy "research_papers_delete_project_lead"
  on storage.objects for delete
  using (
    bucket_id = 'research-papers'
    and public.project_file_editable((storage.foldername(name))[1])
  );
