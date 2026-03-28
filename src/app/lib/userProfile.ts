import type { SupabaseClient, User } from "@supabase/supabase-js";

export function displayNameFromUser(user: User): string | null {
  const m = user.user_metadata ?? {};
  const raw =
    (typeof m.full_name === "string" ? m.full_name : null) ??
    (typeof m.name === "string" ? m.name : null) ??
    (typeof m.given_name === "string" ? m.given_name : null);
  const t = raw?.trim();
  return t ? t : null;
}

/** Ensures public.users row exists (id, email, name). Safe to call often; does not overwrite stats. */
export async function upsertPublicUserIdentity(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { error: rpcError } = await supabase.rpc("ensure_my_user_row");
  if (rpcError) {
    console.error("ensure_my_user_row:", rpcError.message);
  }

  const email = user.email?.trim() || `${user.id}@noemail.local`;
  const name = displayNameFromUser(user);

  const { error } = await supabase.from("users").upsert(
    { id: user.id, email, name },
    { onConflict: "id" },
  );
  if (error) {
    console.error("public.users upsert:", error.message, error);
  }
}
