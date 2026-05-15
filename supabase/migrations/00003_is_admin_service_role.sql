-- ============================================================================
-- 214 Archives Studio — is_admin() recognizes service_role
-- ----------------------------------------------------------------------------
-- The guard_publish_toggle() trigger blocks INSERTs/UPDATEs that change
-- `published` unless the caller is admin. is_admin() previously returned false
-- for service_role calls (no auth.uid()), which blocked the sync/seed scripts
-- that run server-side with the service role.
--
-- RLS policies are unaffected: service_role already has BYPASSRLS, so this
-- change only matters inside triggers and is_admin() callers in code paths
-- that aren't RLS-evaluated.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(public.current_user_role() = 'admin', false)
    or auth.role() = 'service_role'
$$;
