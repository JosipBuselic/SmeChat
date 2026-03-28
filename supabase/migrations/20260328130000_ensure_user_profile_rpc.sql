-- Replaced by client upsert + RLS in 20260328120000. Drop old helper if it exists.
drop function if exists public.ensure_user_profile();
