-- Phase 1 of the proposal system. Proposals are standalone until the project
-- and paper pipeline is redesigned.

create type public.proposal_category as enum (
  'research',
  'whitepaper',
  'analysis'
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  summary text not null,
  category public.proposal_category not null,
  details jsonb not null default '{}'::jsonb,
  status public.proposal_status not null default 'pending',
  is_public boolean not null default true,
  director_feedback text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proposals_title_length check (char_length(title) between 1 and 200),
  constraint proposals_summary_length check (char_length(summary) between 1 and 2000),
  constraint proposals_details_object check (jsonb_typeof(details) = 'object')
);

create index proposals_status_created_idx
  on public.proposals (status, created_at desc);
create index proposals_author_idx on public.proposals (author_id);
create index proposals_public_idx
  on public.proposals (is_public)
  where status = 'approved';

create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;

grant select on table public.proposals to anon;
grant select, insert, update on table public.proposals to authenticated;

create policy "proposals_select_public"
  on public.proposals
  for select
  using (
    (status = 'approved' and is_public)
    or auth.uid() = author_id
    or public.is_director()
  );

create policy "proposals_insert_own"
  on public.proposals
  for insert
  with check (auth.uid() = author_id);

-- An author may only update a rejected proposal, and must send it back to
-- pending for another review.
create policy "proposals_update_author_rejected"
  on public.proposals
  for update
  using (auth.uid() = author_id and status = 'rejected')
  with check (auth.uid() = author_id and status = 'pending');

create policy "proposals_update_director"
  on public.proposals
  for update
  using (public.is_director())
  with check (public.is_director());
