-- Align profiles.expected_grad_date with the TRD (TEXT) and store a
-- human-readable graduation term such as "Fall 2027" instead of a date.

alter table public.profiles
  alter column expected_grad_date type text
  using case
    when expected_grad_date is null then null
    when extract(month from expected_grad_date) <= 4
      then 'Spring ' || extract(year from expected_grad_date)::int
    when extract(month from expected_grad_date) <= 7
      then 'Summer ' || extract(year from expected_grad_date)::int
    else 'Fall ' || extract(year from expected_grad_date)::int
  end;

comment on column public.profiles.expected_grad_date is
  'Expected graduation term, e.g. "Fall 2027".';

-- Normalize any application form_data that still stored an ISO date.
update public.applications
set form_data = jsonb_set(
  form_data,
  '{expectedGradDate}',
  to_jsonb(
    case
      when (form_data->>'expectedGradDate') ~ '^\d{4}-\d{1,2}-\d{1,2}$' then
        (case
          when split_part(form_data->>'expectedGradDate', '-', 2)::int <= 4 then 'Spring '
          when split_part(form_data->>'expectedGradDate', '-', 2)::int <= 7 then 'Summer '
          else 'Fall '
        end) || split_part(form_data->>'expectedGradDate', '-', 1)
      else form_data->>'expectedGradDate'
    end
  )
)
where jsonb_typeof(form_data->'expectedGradDate') = 'string';
