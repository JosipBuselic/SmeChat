-- Postojeća tablica: samo funkcija record_user_scan (bez last_scan_date — koristi updated_at).

create or replace function public.record_user_scan(p_points_add integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_today date;
  v_yesterday date;
  last_act date;
  r public.users%rowtype;
  new_streak int;
  new_points int;
  new_sorted int;
begin
  if uid is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  v_today := (current_timestamp at time zone 'Europe/Zagreb')::date;
  v_yesterday := v_today - 1;

  insert into public.users (id, email, name)
  select
    u.id,
    coalesce(nullif(trim(u.email), ''), u.id::text || '@noemail.local'),
    nullif(
      trim(
        coalesce(
          u.raw_user_meta_data ->> 'full_name',
          u.raw_user_meta_data ->> 'name',
          u.raw_user_meta_data ->> 'given_name',
          ''
        )
      ),
      ''
    )
  from auth.users u
  where u.id = uid
  on conflict (id) do nothing;

  select * into r from public.users where id = uid for update;
  if not found then
    return json_build_object('ok', false, 'error', 'no_row');
  end if;

  new_points := coalesce(r.points, 0) + coalesce(p_points_add, 0);
  new_sorted := coalesce(r.sorted_items_count, 0) + 1;
  last_act := (r.updated_at at time zone 'Europe/Zagreb')::date;

  if coalesce(r.sorted_items_count, 0) = 0 then
    new_streak := 1;
  elsif last_act = v_today then
    new_streak := coalesce(r.streak, 0);
  elsif last_act = v_yesterday then
    new_streak := coalesce(r.streak, 0) + 1;
  else
    new_streak := 1;
  end if;

  update public.users
  set
    streak = new_streak,
    points = new_points,
    sorted_items_count = new_sorted
  where id = uid;

  return json_build_object(
    'ok', true,
    'streak', new_streak,
    'points', new_points,
    'sorted_items_count', new_sorted
  );
end;
$$;

revoke all on function public.record_user_scan(integer) from public;
grant execute on function public.record_user_scan(integer) to authenticated;
