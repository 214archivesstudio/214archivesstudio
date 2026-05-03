/**
 * Supabase schema types — mirrors supabase/migrations/00001_initial_schema.sql.
 *
 * Regenerate from CLI when schema changes:
 *   supabase gen types typescript --linked > types/database.ts
 *
 * Hand-maintained for now to avoid CLI dependency in CI.
 */

export type PostSection =
  | "showreel"
  | "archives"
  | "film"
  | "photography"
  | "personal";

export type MediaType = "image" | "video";

export type VideoPlatform = "youtube" | "vimeo";

export type AppRole = "admin" | "editor";

export type PublishStatus = "pending" | "running" | "success" | "failed";

export interface PostRow {
  readonly id: string;
  readonly section: PostSection;
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly city: string | null;
  readonly year_label: string | null;
  readonly client: string | null;
  readonly description: string | null;
  readonly thumbnail_public_id: string;
  readonly thumbnail_width: number;
  readonly thumbnail_height: number;
  readonly thumbnail_alt: string | null;
  readonly video_platform: VideoPlatform | null;
  readonly video_id: string | null;
  readonly video_title: string | null;
  readonly video_thumbnail_url: string | null;
  readonly display_order: number;
  readonly published: boolean;
  readonly created_by: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PostMediaRow {
  readonly id: string;
  readonly post_id: string;
  readonly type: MediaType;
  readonly public_id: string | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly alt: string | null;
  readonly video_platform: VideoPlatform | null;
  readonly video_id: string | null;
  readonly video_title: string | null;
  readonly display_order: number;
  readonly created_at: string;
}

export interface UserRoleRow {
  readonly user_id: string;
  readonly role: AppRole;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PublishJobRow {
  readonly id: string;
  readonly triggered_by: string | null;
  readonly status: PublishStatus;
  readonly github_run_url: string | null;
  readonly message: string | null;
  readonly error: string | null;
  readonly created_at: string;
  readonly completed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: PostRow;
        Insert: Omit<PostRow, "id" | "created_at" | "updated_at"> &
          Partial<Pick<PostRow, "id">>;
        Update: Partial<Omit<PostRow, "id" | "created_at" | "updated_at">>;
      };
      post_media: {
        Row: PostMediaRow;
        Insert: Omit<PostMediaRow, "id" | "created_at"> &
          Partial<Pick<PostMediaRow, "id">>;
        Update: Partial<Omit<PostMediaRow, "id" | "created_at">>;
      };
      user_roles: {
        Row: UserRoleRow;
        Insert: Omit<UserRoleRow, "created_at" | "updated_at">;
        Update: Partial<Omit<UserRoleRow, "user_id" | "created_at" | "updated_at">>;
      };
      publish_jobs: {
        Row: PublishJobRow;
        Insert: Omit<PublishJobRow, "id" | "created_at"> &
          Partial<Pick<PublishJobRow, "id">>;
        Update: Partial<Omit<PublishJobRow, "id" | "created_at">>;
      };
    };
    Enums: {
      post_section: PostSection;
      media_type: MediaType;
      video_platform: VideoPlatform;
      app_role: AppRole;
      publish_status: PublishStatus;
    };
  };
}
