-- ============================================================================
-- reorder_post_media: atomic display_order rewrite for one post's media.
-- ----------------------------------------------------------------------------
-- Replaces N parallel UPDATEs from the admin (Phase H5-5). SECURITY INVOKER so
-- the caller's RLS still applies (editor/admin update policies on post_media).
-- Only rows belonging to p_post_id are touched; ids from other posts are ignored.
-- ============================================================================

create or replace function public.reorder_post_media(p_post_id uuid, p_ids uuid[])
returns void
language sql
security invoker
set search_path = public
as $$
  update public.post_media m
  set display_order = x.ord - 1
  from unnest(p_ids) with ordinality as x(id, ord)
  where m.id = x.id
    and m.post_id = p_post_id;
$$;

comment on function public.reorder_post_media(uuid, uuid[]) is
  'Admin: set display_order of the given media ids (0-based, in array order) for one post in a single statement.';
