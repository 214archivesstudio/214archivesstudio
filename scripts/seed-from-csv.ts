/**
 * Seed Supabase posts/post_media tables from portfolio-posts CSV.
 *
 * Usage:
 *   npx tsx scripts/seed-from-csv.ts
 *
 * Requires env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (server-only — never expose to client)
 *
 * Idempotent: upserts on (section, slug) and replaces post_media for each post.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ----------------------------------------------------------------------------
// Types (mirror supabase/migrations/00001_initial_schema.sql)
// ----------------------------------------------------------------------------

type PostSection = "showreel" | "archives" | "film" | "photography" | "personal";
type VideoPlatform = "youtube" | "vimeo";

interface CsvRow {
  readonly page: PostSection;
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly thumbnail_id: string;
  readonly image_ids: string;
  readonly video_url: string;
}

interface ParsedVideo {
  readonly platform: VideoPlatform;
  readonly videoId: string;
}

// ----------------------------------------------------------------------------
// CSV parser (small enough to avoid a dependency)
// ----------------------------------------------------------------------------

function parseCsv(text: string): ReadonlyArray<CsvRow> {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const [header, ...rows] = lines;
  if (!header) throw new Error("CSV is empty");

  // Header is "page(...),slug(...),..." — strip parenthetical descriptions.
  const columns = header.split(",").map((c) => c.replace(/\s*\(.*?\)\s*/g, "").trim());

  return rows.map((line, idx) => {
    const cells = line.split(",");
    if (cells.length < columns.length) {
      // Trailing empty cell from trailing comma — pad to column count.
      while (cells.length < columns.length) cells.push("");
    }
    const obj: Record<string, string> = {};
    columns.forEach((col, i) => {
      obj[col] = (cells[i] ?? "").trim();
    });
    return obj as unknown as CsvRow;
  });
}

// ----------------------------------------------------------------------------
// Video URL parser (YouTube + Vimeo)
// ----------------------------------------------------------------------------

function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url) return null;
  const youtube = url.match(/youtu\.be\/([\w-]+)|youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([\w-]+)/);
  if (youtube) {
    const videoId = youtube[1] ?? youtube[2];
    if (videoId) return { platform: "youtube", videoId };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo && vimeo[1]) return { platform: "vimeo", videoId: vimeo[1] };
  return null;
}

// ----------------------------------------------------------------------------
// Section-specific field extraction
// ----------------------------------------------------------------------------

interface PostInsert {
  readonly section: PostSection;
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly city: string | null;
  readonly year_label: string | null;
  readonly client: string | null;
  readonly thumbnail_public_id: string;
  readonly thumbnail_alt: string;
  readonly video_platform: VideoPlatform | null;
  readonly video_id: string | null;
  readonly video_title: string | null;
  readonly display_order: number;
  readonly published: boolean;
}

function buildPost(row: CsvRow, index: number): PostInsert {
  const video = parseVideoUrl(row.video_url);

  // Archives: title is "{CITY} '{YY}" — split for city + year_label.
  let city: string | null = null;
  let yearLabel: string | null = null;
  if (row.page === "archives") {
    const match = row.title.match(/^(.+?)\s*'(\d{2})$/);
    if (match) {
      city = match[1].trim();
      yearLabel = `'${match[2]}`;
    } else {
      city = row.title;
    }
  }

  // Photography: title encodes client ("Profile work for X", "LookBook for X", "Product work for X", "Concept work for X").
  let client: string | null = null;
  if (row.page === "photography") {
    const match = row.title.match(/(?:Profile work for|LookBook for|Product work for|Concept work for)\s+(.+?)\s*$/i);
    if (match) client = match[1].trim();
  }

  return {
    section: row.page,
    slug: row.slug,
    title: row.title,
    date: row.date,
    city,
    year_label: yearLabel,
    client,
    thumbnail_public_id: row.thumbnail_id,
    thumbnail_alt: row.title,
    video_platform: video?.platform ?? null,
    video_id: video?.videoId ?? null,
    video_title: video ? row.title : null,
    display_order: index,
    published: false,  // 모두 draft로 seed. admin이 검토 후 publish.
  };
}

function buildMedia(row: CsvRow): ReadonlyArray<{ public_id: string; alt: string; display_order: number }> {
  if (!row.image_ids) return [];
  return row.image_ids
    .split(";")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .map((publicId, i) => ({
      public_id: publicId,
      alt: `${row.title} — photo ${String(i + 1).padStart(2, "0")}`,
      display_order: i,
    }));
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function upsertPost(client: SupabaseClient, post: PostInsert): Promise<string> {
  const { data, error } = await client
    .from("posts")
    .upsert(post, { onConflict: "section,slug" })
    .select("id")
    .single();
  if (error) throw new Error(`upsert post ${post.section}/${post.slug}: ${error.message}`);
  return data.id;
}

async function replaceMedia(
  client: SupabaseClient,
  postId: string,
  media: ReadonlyArray<{ public_id: string; alt: string; display_order: number }>
): Promise<void> {
  const { error: deleteErr } = await client.from("post_media").delete().eq("post_id", postId);
  if (deleteErr) throw new Error(`delete media for post ${postId}: ${deleteErr.message}`);

  if (media.length === 0) return;

  const rows = media.map((m) => ({
    post_id: postId,
    type: "image" as const,
    public_id: m.public_id,
    alt: m.alt,
    display_order: m.display_order,
  }));

  const { error: insertErr } = await client.from("post_media").insert(rows);
  if (insertErr) throw new Error(`insert media for post ${postId}: ${insertErr.message}`);
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. See docs/admin-setup.md."
    );
  }

  const csvPath = resolve(process.cwd(), "portfolio-posts - portfolio-posts.csv");
  const csvText = readFileSync(csvPath, "utf-8");
  const rows = parseCsv(csvText);

  console.log(`Parsed ${rows.length} rows from CSV.`);

  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  let succeeded = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const post = buildPost(row, i);
    const media = buildMedia(row);
    try {
      const postId = await upsertPost(client, post);
      await replaceMedia(client, postId, media);
      succeeded++;
      console.log(`  ✓ ${post.section}/${post.slug} (${media.length} photos)`);
    } catch (err) {
      console.error(`  ✗ ${post.section}/${post.slug}:`, (err as Error).message);
    }
  }

  console.log(`\nSeed complete: ${succeeded}/${rows.length} posts upserted.`);
  console.log("All posts are draft (published=false). Toggle published in admin UI when ready.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
