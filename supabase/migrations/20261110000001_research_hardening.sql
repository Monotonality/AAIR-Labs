-- Phase 3b: close the gaps that let a client bypass the server actions.
--
-- * Uploading, reviewing, and reopening each run as one database function, so
--   a failure part-way rolls back instead of leaving rows out of sync.
-- * Leads no longer write paper_drafts or review events directly; they go
--   through submit_project_draft, which records the submission itself.
-- * Review history timestamps and actors are set by the database.
-- * Storage writes respect the approved-project lock.
-- * The research-papers bucket is private; PDFs are served through the app,
--   which checks row access first (/api/papers/<project id>/pdf).

-- 1. Trusted-write flag -------------------------------------------------------------
-- The functions below set aair.trusted_write for their own transaction so the
-- guard triggers let their status changes through. PostgREST does not expose
-- set_config, so a client cannot set it.

create or replace function public.in_trusted_write()
returns boolean
language sql stable
as $$
  select coalesce(current_setting('aair.trusted_write', true), '') = 'on';
$$;

create or replace function public.guard_project_update()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_director() or public.in_trusted_write() then
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

  -- Resubmitting a denied project happens inside submit_project_draft.
  if new.status is distinct from old.status then
    raise exception 'Only a director can change the review status.';
  end if;

  return new;
end;
$$;

create or replace function public.guard_draft_write()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or public.is_director() or public.in_trusted_write() then
    return new;
  end if;

  raise exception 'Submit papers through the project page.';
end;
$$;

-- 2. paper_drafts: directors only for direct writes ------------------------------------

drop policy "drafts_insert_lead_or_director" on public.paper_drafts;
drop policy "drafts_update_lead_or_director" on public.paper_drafts;

create policy "drafts_insert_director"
  on public.paper_drafts for insert
  with check (public.is_director());

create policy "drafts_update_director"
  on public.paper_drafts for update
  using (public.is_director())
  with check (public.is_director());

-- 3. Review history: server-set timestamps, director-only direct inserts ----------------

drop policy "review_events_insert_lead_submission" on public.project_review_events;

create or replace function public.stamp_review_event()
returns trigger
language plpgsql
as $$
begin
  -- auth.uid() is null for migrations and the service role (backfills).
  if auth.uid() is not null then
    new.created_at := now();
    new.actor_id := auth.uid();
  end if;
  return new;
end;
$$;

create trigger stamp_review_event
  before insert on public.project_review_events
  for each row execute function public.stamp_review_event();

-- 4. Submit / review / reopen ------------------------------------------------------------

create or replace function public.submit_project_draft(
  p_project_id uuid,
  p_stage public.document_type,
  p_path text
)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_project public.projects%rowtype;
  v_draft_id uuid;
  v_version int;
begin
  select * into v_project from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'Project not found.';
  end if;

  if not (public.is_director() or v_project.author_id = auth.uid()) then
    raise exception 'Only the lead researcher or a director can upload.';
  end if;

  if v_project.status = 'approved' then
    raise exception 'This paper is published, so the project is locked. Ask a director to reopen it.';
  end if;

  if p_stage is null
    or p_stage not in ('whitepaper', 'project_status_paper', 'working_paper', 'research_paper') then
    raise exception 'Choose what kind of paper this is.';
  end if;

  if p_path is null
    or split_part(p_path, '/', 1) <> p_project_id::text
    or p_path !~ '^[0-9a-fA-F-]+/[A-Za-z0-9._-]+\.pdf$' then
    raise exception 'Invalid file path.';
  end if;

  if not exists (
    select 1 from storage.objects
    where bucket_id = 'research-papers' and name = p_path
  ) then
    raise exception 'The uploaded file was not found.';
  end if;

  select id, version into v_draft_id, v_version
  from public.paper_drafts
  where project_id = p_project_id
  order by version desc
  limit 1
  for update;

  v_version := coalesce(v_version, 0) + 1;

  perform set_config('aair.trusted_write', 'on', true);

  if v_draft_id is null then
    insert into public.paper_drafts (project_id, version, stage, pdf_storage_path, status, published_at)
    values (p_project_id, v_version, p_stage, p_path, 'under_review', null);
  else
    update public.paper_drafts
    set version = v_version,
        stage = p_stage,
        pdf_storage_path = p_path,
        status = 'under_review',
        published_at = null
    where id = v_draft_id;
  end if;

  update public.projects
  set status = case when status = 'rejected' then 'pending'::public.proposal_status else status end,
      updated_at = now()
  where id = p_project_id;

  insert into public.project_review_events (project_id, actor_id, kind, draft_version, stage)
  values (p_project_id, auth.uid(), 'submitted', v_version, p_stage);

  perform set_config('aair.trusted_write', 'off', true);

  return v_version;
end;
$$;

create or replace function public.review_project(
  p_project_id uuid,
  p_decision text,
  p_body text
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_body text := nullif(trim(coalesce(p_body, '')), '');
  v_version int;
  v_stage public.document_type;
  v_path text;
  v_now timestamptz := now();
begin
  if not public.is_director() then
    raise exception 'Not authorized.';
  end if;

  if p_decision not in ('approve', 'deny') then
    raise exception 'Unknown review decision.';
  end if;

  if p_decision = 'deny' and v_body is null then
    raise exception 'Give a reason for the denial.';
  end if;

  if v_body is not null and char_length(v_body) > 2000 then
    raise exception 'Comments must be 2,000 characters or fewer.';
  end if;

  perform 1 from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'Project not found.';
  end if;

  select version, stage, pdf_storage_path into v_version, v_stage, v_path
  from public.paper_drafts
  where project_id = p_project_id
  order by version desc
  limit 1;

  if v_path is null then
    raise exception 'There is no PDF to review yet.';
  end if;

  update public.projects
  set status = case when p_decision = 'approve'
                    then 'approved'::public.proposal_status
                    else 'rejected'::public.proposal_status end,
      director_feedback = v_body,
      status_reviewed_at = v_now,
      updated_at = v_now
  where id = p_project_id;

  if p_decision = 'approve' then
    update public.paper_drafts
    set status = 'published', published_at = v_now
    where project_id = p_project_id;
  else
    update public.paper_drafts
    set status = 'revision_required', published_at = null
    where project_id = p_project_id;
  end if;

  insert into public.project_review_events (project_id, actor_id, kind, body, draft_version, stage)
  values (
    p_project_id,
    auth.uid(),
    case when p_decision = 'approve' then 'approved' else 'denied' end::public.project_event_kind,
    v_body,
    v_version,
    v_stage
  );
end;
$$;

create or replace function public.reopen_project(p_project_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_status public.proposal_status;
begin
  if not public.is_director() then
    raise exception 'Not authorized.';
  end if;

  select status into v_status from public.projects where id = p_project_id for update;
  if not found then
    raise exception 'Project not found.';
  end if;
  if v_status <> 'approved' then
    raise exception 'Only an approved project can be reopened.';
  end if;

  update public.projects
  set status = 'pending', status_reviewed_at = null, updated_at = now()
  where id = p_project_id;

  update public.paper_drafts
  set status = 'under_review', published_at = null
  where project_id = p_project_id;

  insert into public.project_review_events (project_id, actor_id, kind)
  values (p_project_id, auth.uid(), 'reopened');
end;
$$;

revoke execute on function public.submit_project_draft(uuid, public.document_type, text) from public, anon;
revoke execute on function public.review_project(uuid, text, text) from public, anon;
revoke execute on function public.reopen_project(uuid) from public, anon;
grant execute on function public.submit_project_draft(uuid, public.document_type, text) to authenticated;
grant execute on function public.review_project(uuid, text, text) to authenticated;
grant execute on function public.reopen_project(uuid) to authenticated;

-- 5. Storage: lock approved projects, make the bucket private -----------------------------

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
      where pr.id = path::uuid
        and (
          public.is_director()
          or (pr.author_id = auth.uid() and pr.status <> 'approved')
        )
    )
  end;
$$;

-- Reads go through the app (row access check + short-lived signed URL).
update storage.buckets set public = false where id = 'research-papers';
