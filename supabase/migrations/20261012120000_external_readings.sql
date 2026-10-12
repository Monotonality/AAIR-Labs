-- External reading: curated links to work AAIR Labs did not produce.
-- Public can read. Directors (portal admins) insert, update, and delete.

create table public.external_readings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text not null,
  venue text not null default '',
  published_year integer,
  source_url text not null,
  context text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_readings_title_len check (char_length(title) between 1 and 300),
  constraint external_readings_authors_len check (char_length(authors) between 1 and 500),
  constraint external_readings_venue_len check (char_length(venue) <= 200),
  constraint external_readings_context_len check (char_length(context) between 1 and 4000),
  constraint external_readings_source_url_http check (source_url ~* '^https?://'),
  constraint external_readings_year_range check (
    published_year is null
    or (published_year >= 1900 and published_year <= 2100)
  )
);

create index external_readings_updated_at_idx
  on public.external_readings (updated_at desc);

create trigger set_updated_at
before update on public.external_readings
for each row execute function public.set_updated_at();

alter table public.external_readings enable row level security;

grant select on table public.external_readings to anon, authenticated;
grant insert, update, delete on table public.external_readings to authenticated;

create policy "external_readings_select"
  on public.external_readings
  for select
  to anon, authenticated
  using (true);

create policy "external_readings_insert_director"
  on public.external_readings
  for insert
  to authenticated
  with check ((select public.is_director()));

create policy "external_readings_update_director"
  on public.external_readings
  for update
  to authenticated
  using ((select public.is_director()))
  with check ((select public.is_director()));

create policy "external_readings_delete_director"
  on public.external_readings
  for delete
  to authenticated
  using ((select public.is_director()));
