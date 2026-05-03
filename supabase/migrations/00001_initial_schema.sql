-- ============================================================================
-- 214 Archives Studio — Initial schema
-- ADR-0001: Admin architecture (Supabase + build-time sync)
-- ============================================================================
-- Run with: supabase db push
-- Reset with: supabase db reset (will replay migrations + seed.sql)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type post_section as enum (
  'showreel',
  'archives',
  'film',
  'photography',
  'personal'
);

create type media_type as enum ('image', 'video');

create type video_platform as enum ('youtube', 'vimeo');

create type app_role as enum ('admin', 'editor');

create type publish_status as enum ('pending', 'running', 'success', 'failed');

-- ----------------------------------------------------------------------------
-- user_roles (RBAC)
-- ----------------------------------------------------------------------------

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_roles is
  'Role binding for authenticated admin users. Single role per user (ADR-0001).';

-- security definer helper: get current user's role (used in RLS policies).
create or replace function public.current_user_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_authenticated_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() is not null
$$;

-- ----------------------------------------------------------------------------
-- posts
-- ----------------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  section post_section not null,
  slug text not null,
  title text not null,
  date date not null,

  -- archives 전용 필드
  city text,
  year_label text,  -- 표시용 라벨 ("'22" 등). slug의 연도와 다른 경우가 있음 (ADR-0001 / overview)

  -- photography 전용 필드
  client text,

  description text,

  -- thumbnail (모든 섹션 공통)
  thumbnail_public_id text not null,
  thumbnail_width int not null default 1200,
  thumbnail_height int not null default 800,
  thumbnail_alt text,

  -- main video (showreel/film/personal에서 사용)
  video_platform video_platform,
  video_id text,
  video_title text,
  video_thumbnail_url text,  -- film 전용 별도 비디오 썸네일 URL

  display_order int not null default 0,
  published boolean not null default false,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (section, slug),

  -- 데이터 무결성: video 메타가 부분적이지 않도록
  constraint video_fields_consistency check (
    (video_platform is null and video_id is null and video_title is null) or
    (video_platform is not null and video_id is not null)
  )
);

create index posts_section_idx on public.posts (section);
create index posts_published_idx on public.posts (published) where published = true;
create index posts_display_order_idx on public.posts (section, display_order);

comment on table public.posts is
  'Portfolio posts (works). Source of truth for admin; published rows are synced to data/*.ts on publish.';

-- ----------------------------------------------------------------------------
-- post_media (사진 + 영상 — personal works의 image|video 혼합 처리)
-- ----------------------------------------------------------------------------

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  type media_type not null default 'image',

  -- image (Cloudinary)
  public_id text,
  width int,
  height int,
  alt text,

  -- video (혼합 미디어용 — personal works)
  video_platform video_platform,
  video_id text,
  video_title text,

  display_order int not null default 0,
  created_at timestamptz not null default now(),

  -- type별로 필요한 필드만 존재해야 함
  constraint media_payload_consistency check (
    (type = 'image' and public_id is not null and video_id is null) or
    (type = 'video' and video_id is not null and public_id is null)
  )
);

create index post_media_post_id_idx on public.post_media (post_id);
create index post_media_display_order_idx on public.post_media (post_id, display_order);

comment on table public.post_media is
  'Per-post media items (photos + optional embedded videos). Ordered by display_order.';

-- ----------------------------------------------------------------------------
-- publish_jobs (어드민의 Publish 액션 추적)
-- ----------------------------------------------------------------------------

create table public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  triggered_by uuid references auth.users(id) on delete set null,
  status publish_status not null default 'pending',
  github_run_url text,
  message text,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index publish_jobs_created_at_idx on public.publish_jobs (created_at desc);

comment on table public.publish_jobs is
  'Audit trail of publish actions. UI polls this for build status (ADR-0001 open question 1).';

-- ----------------------------------------------------------------------------
-- updated_at 자동 갱신 트리거
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table public.user_roles enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.publish_jobs enable row level security;

-- user_roles: 본인 역할 조회는 누구나 가능. 변경은 admin만.
create policy user_roles_select_self
  on public.user_roles
  for select
  using (user_id = auth.uid() or public.is_admin());

create policy user_roles_admin_all
  on public.user_roles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- posts: 인증된 어드민 사용자(editor/admin) 모두 read. write는 역할별 분기.
create policy posts_select_authenticated
  on public.posts
  for select
  using (public.is_authenticated_admin_user());

-- editor: 자신이 만든 draft만 update. published 토글 불가 (트리거에서 차단).
-- admin: 모든 게시물 update.
create policy posts_insert_authenticated
  on public.posts
  for insert
  with check (
    public.is_authenticated_admin_user()
    and (created_by = auth.uid() or public.is_admin())
  );

create policy posts_update_owner_or_admin
  on public.posts
  for update
  using (
    public.is_admin()
    or (created_by = auth.uid() and public.current_user_role() = 'editor')
  )
  with check (
    public.is_admin()
    or (created_by = auth.uid() and public.current_user_role() = 'editor')
  );

create policy posts_delete_owner_or_admin
  on public.posts
  for delete
  using (
    public.is_admin()
    or (created_by = auth.uid() and public.current_user_role() = 'editor' and not published)
  );

-- editor가 published 토글을 못하도록 트리거에서 한 번 더 차단 (RLS만으론 부족).
create or replace function public.guard_publish_toggle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and old.published is distinct from new.published) then
    if not public.is_admin() then
      raise exception 'Only admin can toggle published status'
        using errcode = '42501';  -- insufficient_privilege
    end if;
  end if;
  if (tg_op = 'INSERT' and new.published = true and not public.is_admin()) then
    raise exception 'Only admin can create already-published posts'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger posts_guard_publish
  before insert or update on public.posts
  for each row execute function public.guard_publish_toggle();

-- post_media: 부모 post의 권한을 따라감.
create policy post_media_select_authenticated
  on public.post_media
  for select
  using (public.is_authenticated_admin_user());

create policy post_media_modify_via_parent
  on public.post_media
  for all
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (
          public.is_admin()
          or (p.created_by = auth.uid() and public.current_user_role() = 'editor')
        )
    )
  )
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (
          public.is_admin()
          or (p.created_by = auth.uid() and public.current_user_role() = 'editor')
        )
    )
  );

-- publish_jobs: 모든 어드민이 read. insert는 admin만 (publish 권한과 동일).
create policy publish_jobs_select
  on public.publish_jobs
  for select
  using (public.is_authenticated_admin_user());

create policy publish_jobs_insert_admin
  on public.publish_jobs
  for insert
  with check (public.is_admin() and triggered_by = auth.uid());

create policy publish_jobs_update_admin
  on public.publish_jobs
  for update
  using (public.is_admin())
  with check (public.is_admin());
