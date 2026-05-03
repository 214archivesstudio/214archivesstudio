-- ============================================================================
-- Seed first admin user
-- ----------------------------------------------------------------------------
-- 이 마이그레이션은 다음 순서로만 동작합니다:
--  1) Supabase Authentication에서 214archivesstudio@gmail.com 계정을 먼저 생성
--     (Studio → Authentication → Users → Invite User, 또는 매직링크 로그인 1회)
--  2) `supabase db push` 또는 `supabase migration up` 실행
--
-- 사용자가 생성되지 않았으면 raise exception으로 실패하므로 안전합니다.
-- ============================================================================

do $$
declare
  v_user_id uuid;
  v_email constant text := '214archivesstudio@gmail.com';
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    raise exception
      'First admin user not found in auth.users. Create user with email % via Supabase Auth before running this migration.',
      v_email;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin')
  on conflict (user_id) do update set role = excluded.role;

  raise notice 'Granted admin role to % (user_id: %)', v_email, v_user_id;
end
$$;
