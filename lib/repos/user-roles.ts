import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export interface TeamMember {
  readonly user_id: string;
  readonly role: AppRole;
  readonly created_at: string;
}

/**
 * Lists every row in user_roles the caller is allowed to see. Under the
 * shipped RLS policy:
 *   - editors see only their own row
 *   - admins see every row
 * Email enrichment isn't possible via PostgREST because auth.users is gated;
 * the team page surfaces the user_id and falls back to "본인" / labelling for
 * the current user.
 */
export async function listTeamMembers(): Promise<ReadonlyArray<TeamMember>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listTeamMembers failed: ${error.message}`);
  return (data ?? []) as ReadonlyArray<TeamMember>;
}
