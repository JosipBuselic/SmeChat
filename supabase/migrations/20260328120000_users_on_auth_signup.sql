-- Cijeli setup — tablica točno kao dolje; streak za „isti dan” = updated_at (Zagreb) + sorted_items_count.

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid not null,
  email text not null,
  name text null,
  streak integer not null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  points integer not null default 0,
  sorted_items_count integer not null default 0,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign key (id) references auth.users (id)
) tablespace pg_default;

drop trigger if exists set_updated_at on public.users;

create trigger set_updated_at
before update on public.users
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  user_email text;
begin
  display_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        new.raw_user_meta_data ->> 'given_name',
        ''
      )
    ),
    ''
  );

  user_email := coalesce(nullif(trim(new.email), ''), new.id::text || '@noemail.local');

  insert into public.users (id, email, name)
  values (new.id, user_email, display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.ensure_my_user_row()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  au record;
begin
  select id, email, raw_user_meta_data into au from auth.users where id = auth.uid();
  if not found then
    return;
  end if;

  insert into public.users (id, email, name)
  values (
    au.id,
    coalesce(nullif(trim(au.email), ''), au.id::text || '@noemail.local'),
    nullif(
      trim(
        coalesce(
          au.raw_user_meta_data ->> 'full_name',
          au.raw_user_meta_data ->> 'name',
          au.raw_user_meta_data ->> 'given_name',
          ''
        )
      ),
      ''
    )
  )
  on conflict (id) do nothing;
end;
$$;

revoke all on function public.ensure_my_user_row() from public;
grant execute on function public.ensure_my_user_row() to authenticated;

-- Sken: +points, +sorted_items_count. Streak: prvi sken ikad → 1; isti dan (updated_at) → isti streak; jučer → +1; inače → 1.
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

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;

create policy "users_select_own"
on public.users for select
to authenticated
using (id = auth.uid());

create policy "users_insert_own"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "users_update_own"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
