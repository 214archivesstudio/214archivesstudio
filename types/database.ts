/**
 * App-facing aliases over the generated Supabase types (./supabase.ts).
 *
 * `Database` is the generated type — pass it to createClient so insert/update
 * payloads are checked against the real schema (no `as never` casts). Row
 * aliases are wrapped in Readonly<> to keep the codebase's immutability style.
 *
 * Schema change → `npm run gen:types` → fix whatever tsc flags.
 */

import type { Database, Enums, Tables } from "./supabase";

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./supabase";

export type PostSection = Enums<"post_section">;
export type MediaType = Enums<"media_type">;
export type VideoPlatform = Enums<"video_platform">;
export type AppRole = Enums<"app_role">;
export type PublishStatus = Enums<"publish_status">;

export type PostRow = Readonly<Tables<"posts">>;
export type PostMediaRow = Readonly<Tables<"post_media">>;
export type UserRoleRow = Readonly<Tables<"user_roles">>;
export type PublishJobRow = Readonly<Tables<"publish_jobs">>;

// Keep the generated Database referenced so the re-export above is the single source.
export type Schema = Database["public"];
