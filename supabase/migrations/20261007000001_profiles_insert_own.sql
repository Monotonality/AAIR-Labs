-- Fix FK violation on insert into public.applications when the auth user has
-- no profile row (accounts created before on_auth_user_created existed, or a
-- deleted profile). Two parts:

-- 1. Allow a user to create their own profile row on first onboarding.
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. Backfill profile rows for any existing auth users that lack one
--    (mirrors handle_new_user so values stay consistent).
insert into public.profiles (id, email, full_name, role, onboarding_completed)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'full_name', 'New Member'),
  coalesce((au.raw_user_meta_data ->> 'role'), 'student')::public.user_role,
  coalesce((au.raw_user_meta_data ->> 'onboarding_completed')::boolean, false)
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;