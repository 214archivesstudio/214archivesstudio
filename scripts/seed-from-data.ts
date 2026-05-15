/**
 * Seed Supabase posts/post_media tables from data/*.ts (the live static content).
 *
 * Usage:
 *   npm run seed                 # all drafts (published=false)
 *   npm run seed -- --publish-all  # mark all rows published=true (Step 0 gate)
 *
 * Idempotent: upserts on (section, slug); replaces post_media for each post.
 *
 * Why data/*.ts as source (not CSV): data/*.ts is the canonical live content of
 * the public site. Round-tripping data → DB → data is what proves the Supabase
 * schema can represent the full content shape losslessly (Step 0 of admin
 * Phase 3c+4 plan).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ARCHIVES } from "../data/archives";
import { FILMS } from "../data/films";
import { PERSONAL_WORKS } from "../data/personal";
import { PHOTOGRAPHY } from "../data/photography";
import { SHOWREELS } from "../data/showreels";
import type {
  ArchiveItem,
  CloudinaryImage,
  FilmItem,
  PersonalWorkItem,
  PhotographyItem,
  ShowreelItem,
  VideoEmbed,
} from "../types";

type PostInsert = {
  section: "showreel" | "archives" | "film" | "photography" | "personal";
  slug: string;
  title: string;
  date: string;
  city: string | null;
  year_label: string | null;
  client: string | null;
  description: string | null;
  thumbnail_public_id: string;
  thumbnail_width: number;
  thumbnail_height: number;
  thumbnail_alt: string | null;
  video_platform: "youtube" | "vimeo" | null;
  video_id: string | null;
  video_title: string | null;
  video_thumbnail_url: string | null;
  display_order: number;
  published: boolean;
};

type MediaInsert =
  | {
      type: "image";
      public_id: string;
      width: number;
      height: number;
      alt: string;
      display_order: number;
      video_platform: null;
      video_id: null;
      video_title: null;
    }
  | {
      type: "video";
      video_platform: "youtube" | "vimeo";
      video_id: string;
      video_title: string;
      display_order: number;
      public_id: null;
      width: null;
      height: null;
      alt: null;
    };

const imageMedia = (image: CloudinaryImage, order: number): MediaInsert => ({
  type: "image",
  public_id: image.publicId,
  width: image.width,
  height: image.height,
  alt: image.alt,
  display_order: order,
  video_platform: null,
  video_id: null,
  video_title: null,
});

const videoMedia = (video: VideoEmbed, order: number): MediaInsert => ({
  type: "video",
  video_platform: video.platform,
  video_id: video.videoId,
  video_title: video.title,
  display_order: order,
  public_id: null,
  width: null,
  height: null,
  alt: null,
});

const archiveToPost = (
  item: ArchiveItem,
  order: number,
  published: boolean,
): { post: PostInsert; media: MediaInsert[] } => ({
  post: {
    section: "archives",
    slug: item.id,
    title: `${item.city} '${item.year.slice(-2)}`,
    date: item.date,
    city: item.city,
    year_label: item.year,
    client: null,
    description: item.description ?? null,
    thumbnail_public_id: item.thumbnail.publicId,
    thumbnail_width: item.thumbnail.width,
    thumbnail_height: item.thumbnail.height,
    thumbnail_alt: item.thumbnail.alt,
    video_platform: null,
    video_id: null,
    video_title: null,
    video_thumbnail_url: null,
    display_order: order,
    published,
  },
  media: item.photos.map((photo, i) => imageMedia(photo, i)),
});

const filmToPost = (
  item: FilmItem,
  order: number,
  published: boolean,
): { post: PostInsert; media: MediaInsert[] } => ({
  post: {
    section: "film",
    slug: item.id,
    title: item.title,
    date: item.date,
    city: null,
    year_label: null,
    client: null,
    description: item.description ?? null,
    thumbnail_public_id: item.thumbnail.publicId,
    thumbnail_width: item.thumbnail.width,
    thumbnail_height: item.thumbnail.height,
    thumbnail_alt: item.thumbnail.alt,
    video_platform: item.video.platform,
    video_id: item.video.videoId,
    video_title: item.video.title,
    video_thumbnail_url: item.videoThumbnailUrl,
    display_order: order,
    published,
  },
  media: item.photos.map((photo, i) => imageMedia(photo, i)),
});

const photographyToPost = (
  item: PhotographyItem,
  order: number,
  published: boolean,
): { post: PostInsert; media: MediaInsert[] } => ({
  post: {
    section: "photography",
    slug: item.id,
    title: item.title,
    date: item.date,
    city: null,
    year_label: null,
    client: item.client,
    description: item.description ?? null,
    thumbnail_public_id: item.thumbnail.publicId,
    thumbnail_width: item.thumbnail.width,
    thumbnail_height: item.thumbnail.height,
    thumbnail_alt: item.thumbnail.alt,
    video_platform: null,
    video_id: null,
    video_title: null,
    video_thumbnail_url: null,
    display_order: order,
    published,
  },
  media: item.photos.map((photo, i) => imageMedia(photo, i)),
});

const isCloudinaryImage = (
  m: CloudinaryImage | VideoEmbed,
): m is CloudinaryImage => "publicId" in m;

const personalToPost = (
  item: PersonalWorkItem,
  order: number,
  published: boolean,
): { post: PostInsert; media: MediaInsert[] } => ({
  post: {
    section: "personal",
    slug: item.id,
    title: item.title,
    date: item.date,
    city: null,
    year_label: null,
    client: null,
    description: item.description ?? null,
    thumbnail_public_id: item.thumbnail.publicId,
    thumbnail_width: item.thumbnail.width,
    thumbnail_height: item.thumbnail.height,
    thumbnail_alt: item.thumbnail.alt,
    video_platform: null,
    video_id: null,
    video_title: null,
    video_thumbnail_url: null,
    display_order: order,
    published,
  },
  media: item.media.map((m, i) =>
    isCloudinaryImage(m) ? imageMedia(m, i) : videoMedia(m, i),
  ),
});

const showreelToPost = (
  item: ShowreelItem,
  order: number,
  published: boolean,
): { post: PostInsert; media: MediaInsert[] } => ({
  post: {
    section: "showreel",
    slug: item.id,
    title: item.title,
    date: item.date,
    city: null,
    year_label: null,
    client: null,
    description: item.description ?? null,
    thumbnail_public_id: item.thumbnail.publicId,
    thumbnail_width: item.thumbnail.width,
    thumbnail_height: item.thumbnail.height,
    thumbnail_alt: item.thumbnail.alt,
    video_platform: item.video.platform,
    video_id: item.video.videoId,
    video_title: item.video.title,
    video_thumbnail_url: null,
    display_order: order,
    published,
  },
  media: [],
});

async function upsertPostWithMedia(
  client: SupabaseClient,
  post: PostInsert,
  media: ReadonlyArray<MediaInsert>,
): Promise<void> {
  const { data, error } = await client
    .from("posts")
    .upsert(post, { onConflict: "section,slug" })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(
      `upsert post ${post.section}/${post.slug}: ${error?.message ?? "no id returned"}`,
    );
  }
  const postId = (data as { id: string }).id;

  const { error: deleteErr } = await client
    .from("post_media")
    .delete()
    .eq("post_id", postId);
  if (deleteErr) {
    throw new Error(
      `delete media for ${post.section}/${post.slug}: ${deleteErr.message}`,
    );
  }

  if (media.length === 0) return;

  const rows = media.map((m) => ({ ...m, post_id: postId }));
  const { error: insertErr } = await client.from("post_media").insert(rows);
  if (insertErr) {
    throw new Error(
      `insert media for ${post.section}/${post.slug}: ${insertErr.message}`,
    );
  }
}

async function main(): Promise<void> {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required. See docs/admin-setup.md.",
    );
  }

  const publishAll = process.argv.includes("--publish-all");
  console.log(
    `Seeding from data/*.ts → Supabase (published=${publishAll ? "true (test gate)" : "false (drafts)"}).`,
  );

  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const all: Array<{ post: PostInsert; media: MediaInsert[] }> = [
    ...ARCHIVES.map((item, i) => archiveToPost(item, i, publishAll)),
    ...FILMS.map((item, i) => filmToPost(item, i, publishAll)),
    ...PHOTOGRAPHY.map((item, i) => photographyToPost(item, i, publishAll)),
    ...PERSONAL_WORKS.map((item, i) => personalToPost(item, i, publishAll)),
    ...SHOWREELS.map((item, i) => showreelToPost(item, i, publishAll)),
  ];

  let succeeded = 0;
  for (const entry of all) {
    try {
      await upsertPostWithMedia(client, entry.post, entry.media);
      succeeded += 1;
      console.log(
        `  ✓ ${entry.post.section}/${entry.post.slug} (${entry.media.length} media)`,
      );
    } catch (err) {
      console.error(
        `  ✗ ${entry.post.section}/${entry.post.slug}: ${(err as Error).message}`,
      );
    }
  }

  console.log(`\nSeed complete: ${succeeded}/${all.length} posts upserted.`);
  if (!publishAll) {
    console.log("All posts are draft. Re-run with --publish-all for Step 0 gate.");
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
