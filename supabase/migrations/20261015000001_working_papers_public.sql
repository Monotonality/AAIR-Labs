-- Working papers are part of the public library. Make them readable by anyone,
-- alongside published papers. SECURITY DEFINER helpers are used inside the
-- paper_drafts/project_authors policies to avoid re-triggering RLS on projects
-- (which previously caused infinite recursion between the two tables).

create or replace function public.project_is_working_paper(pid uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid and p.document_type = 'working_paper'
  );
$$;

create policy "projects_select_working_paper" on public.projects
  for select using (document_type = 'working_paper');

create policy "drafts_select_working_paper" on public.paper_drafts
  for select using (public.project_is_working_paper(project_id));

create policy "project_authors_select_working_paper" on public.project_authors
  for select using (public.project_is_working_paper(project_id));
