-- Phase 3: Active Research.
--
-- * Approved members (approved application + finished onboarding) can read
--   every project, its current draft, and its roster.
-- * The project lead manages co-authors (directors still manage everything,
--   including who the lead is).
-- * Each draft records its stage (initial scope whitepaper, status paper,
--   working draft, final paper).
-- * project_review_events is an append-only history of submissions, director
--   decisions, and comments, so feedback is never overwritten.
-- * Triggers stop a lead from approving or publishing their own work through
--   the API (row policies alone allowed any column on rows they can update).

-- 1. Approved-member helper ------------------------------------------------------

create or replace function public.is_approved_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.applications a on a.profile_id = p.id
    where p.id = auth.uid()
      and p.onboarding_completed
      and a.status = 'approved'
  );
$$;

-- 2. Member read access ------------------------------------------------------------

create policy "projects_select_approved_member"
  on public.projects for select
  using ((select public.is_approved_member()));

create policy "drafts_select_approved_member"
  on public.paper_drafts for select
  using ((select public.is_approved_member()));

create policy "project_authors_select_approved_member"
  on public.project_authors for select
  using ((select public.is_approved_member()));

-- 3. Lead manages co-authors -------------------------------------------------------
-- The lead may add or remove co_author rows only; the 'author' (lead) row and
-- updates to existing rows stay director-only.

create policy "project_authors_insert_lead"
  on public.project_authors for insert
  with check (public.user_is_project_lead(project_id) and role = 'co_author');

create policy "project_authors_delete_lead"
  on public.project_authors for delete
  using (public.user_is_project_lead(project_id) and role = 'co_author');

-- 4. Draft stage ---------------------------------------------------------------------

alter table public.paper_drafts
  add column stage public.document_type;

comment on column public.paper_drafts.stage is
  'What the current PDF is: whitepaper (initial scope), project_status_paper, working_paper (draft), research_paper (final).';

-- 5. Guard what a non-director can change ---------------------------------------------
-- auth.uid() is null for the service role and migrations, which are trusted.

create or replace function public.guard_project_update()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_director() then
    return new;
  end if;

  if old.status = 'approved' then
    raise exception 'Approved projects are locked. Ask a director to reopen it.';
  end if;

  if new.author_id is distinct from old.author_id
    or new.proposal_id is distinct from old.proposal_id
    or new.category is distinct from old.category
    or new.director_feedback is distinct from old.director_feedback
    or new.status_reviewed_at is distinct from old.status_reviewed_at then
    raise exception 'Only a director can change the lead, proposal, type, or review fields.';
  end if;

  -- The only status change a lead makes is resubmitting a denied project.
  if new.status is distinct from old.status
    and not (old.status = 'rejected' and new.status = 'pending') then
    raise exception 'Only a director can change the review status.';
  end if;

  return new;
end;
$$;

create trigger guard_project_update
  before update on public.projects
  for each row execute function public.guard_project_update();

create or replace function public.guard_draft_write()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_director() then
    return new;
  end if;

  if public.project_is_approved(new.project_id) then
    raise exception 'Approved projects are locked. Ask a director to reopen it.';
  end if;

  if new.status = 'published' or new.published_at is not null then
    raise exception 'Only a director can publish a paper.';
  end if;

  return new;
end;
$$;

create trigger guard_draft_write
  before insert or update on public.paper_drafts
  for each row execute function public.guard_draft_write();

-- 6. Review history ---------------------------------------------------------------------

create type public.project_event_kind as enum (
  'submitted',
  'approved',
  'denied',
  'comment',
  'reopened'
);

create table public.project_review_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  kind public.project_event_kind not null,
  body text,
  draft_version int,
  stage public.document_type,
  created_at timestamptz not null default now(),
  constraint project_review_events_body_len
    check (body is null or char_length(body) <= 2000),
  constraint project_review_events_comment_has_body
    check (kind not in ('comment', 'denied') or char_length(coalesce(body, '')) > 0)
);

create index project_review_events_project_idx
  on public.project_review_events (project_id, created_at desc);

alter table public.project_review_events enable row level security;

grant select, insert on table public.project_review_events to authenticated;

create policy "review_events_select"
  on public.project_review_events for select
  to authenticated
  using (
    (select public.is_director())
    or (select public.is_approved_member())
    or public.user_is_project_member(project_id)
  );

-- Directors record decisions, comments, and their own uploads.
create policy "review_events_insert_director"
  on public.project_review_events for insert
  to authenticated
  with check ((select public.is_director()) and actor_id = auth.uid());

-- Leads only record their own submissions.
create policy "review_events_insert_lead_submission"
  on public.project_review_events for insert
  to authenticated
  with check (
    kind = 'submitted'
    and actor_id = auth.uid()
    and public.user_is_project_lead(project_id)
  );

-- No update or delete policies: history is append-only.

-- 7. Backfill history from existing data -------------------------------------------------

insert into public.project_review_events (project_id, actor_id, kind, draft_version, created_at)
select pd.project_id, pr.author_id, 'submitted', pd.version, pd.updated_at
from public.paper_drafts pd
join public.projects pr on pr.id = pd.project_id
where pd.pdf_storage_path is not null;

insert into public.project_review_events (project_id, actor_id, kind, body, created_at)
select
  pr.id,
  null,
  case when pr.status = 'approved' then 'approved' else 'denied' end::public.project_event_kind,
  case
    when pr.status = 'rejected' then coalesce(nullif(trim(pr.director_feedback), ''), 'No reason recorded.')
    else nullif(trim(pr.director_feedback), '')
  end,
  pr.status_reviewed_at
from public.projects pr
where pr.status in ('approved', 'rejected')
  and pr.status_reviewed_at is not null;
