-- Club-role title for members, e.g. "Member", "Director of Research",
-- "Executive Director". Free text so directors can name roles without a
-- schema change. Nullable with no backfill: existing profiles keep no title
-- until one is set or their membership is reviewed.

alter table public.profiles
  add column title text;

comment on column public.profiles.title is
  'Free-text club role title, e.g. "Member", "Director of Research".';

-- Directors (portal admins) can update any profile so they can set titles and
-- promote members. profiles_update_own still lets members edit their own row.
create policy "profiles_update_director"
  on public.profiles
  for update
  to authenticated
  using ((select public.is_director()))
  with check ((select public.is_director()));

-- Directors can delete profiles directly. Full account removal also deletes
-- the auth user (via the service-role admin client), which cascades here.
create policy "profiles_delete_director"
  on public.profiles
  for delete
  to authenticated
  using ((select public.is_director()));
