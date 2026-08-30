/**
 * Sync Supabase → data/*.ts.
 *
 * Reads all `published=true` posts (+ post_media), groups by section, regenerates
 * data/{archives,films,personal,photography,showreels}.ts in canonical literal form.
 *
 * Usage:
 *   npm run sync                 # write to data/
 *   npm run sync -- --dry-run    # print to stdout, don't write
 *
 * Determinism: posts are sorted by (date desc, slug asc) within section; media by
 * display_order asc; object keys follow types/index.ts field order. Output is
 * stable across runs given the same DB state.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  MediaType,
  PostRow,
  PostMediaRow,
  PostSection,
  VideoPlatform,
} from "../types/database";

type MediaRow = PostMediaRow;
type Post = PostRow & { readonly media: ReadonlyArray<MediaRow> };

// ---------------------------------------------------------------------------
// DB fetch
// ---------------------------------------------------------------------------

/** PostgREST 는 요청당 최대 1000행(db-max-rows)만 돌려준다. 초과분이 조용히 잘리지 않도록 페이지로 끝까지 읽는다. */
const PAGE_SIZE = 1000;

async function fetchAllRows<T>(
  label: string,
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<ReadonlyArray<T>> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${label} query: ${error.message}`);
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }
  if (rows.length >= PAGE_SIZE) {
    console.warn(`  ⚠ ${label}: ${rows.length} rows — paginated across ${Math.ceil(rows.length / PAGE_SIZE)} pages`);
  }
  return rows;
}

async function fetchPublished(client: SupabaseClient): Promise<ReadonlyArray<Post>> {
  const postRows = await fetchAllRows<PostRow>("posts", (from, to) =>
    client.from("posts").select("*").eq("published", true).order("id").range(from, to),
  );
  if (postRows.length === 0) return [];

  const ids = postRows.map((p) => p.id);
  const mediaRows = await fetchAllRows<MediaRow>("post_media", (from, to) =>
    client
      .from("post_media")
      .select("*")
      .in("post_id", ids)
      .order("display_order", { ascending: true })
      .order("id")
      .range(from, to),
  );

  const mediaByPost = new Map<string, MediaRow[]>();
  for (const m of (mediaRows ?? []) as ReadonlyArray<MediaRow>) {
    const arr = mediaByPost.get(m.post_id) ?? [];
    arr.push(m);
    mediaByPost.set(m.post_id, arr);
  }

  return postRows
    .map((p) => ({ ...p, media: mediaByPost.get(p.id) ?? [] }))
    .sort(comparePostsForEmit);
}

function comparePostsForEmit(a: Post, b: Post): number {
  // date desc, then slug asc (deterministic tie-breaker).
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

// ---------------------------------------------------------------------------
// JS literal printer (no prettier dependency)
// ---------------------------------------------------------------------------

function printLiteral(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);

  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value
      .map((v) => `${inner}${printLiteral(v, indent + 1)},`)
      .join("\n");
    return `[\n${items}\n${pad}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    );
    if (entries.length === 0) return "{}";
    const lines = entries
      .map(([k, v]) => `${inner}${k}: ${printLiteral(v, indent + 1)},`)
      .join("\n");
    return `{\n${lines}\n${pad}}`;
  }

  throw new Error(`Unsupported literal type: ${typeof value}`);
}

function header(typeName: string): string {
  return `import type { ${typeName} } from "@/types";\n\n`;
}

function exportConst(name: string, typeName: string, items: unknown): string {
  return `export const ${name}: ReadonlyArray<${typeName}> = ${printLiteral(items, 0)} as const;\n`;
}

// ---------------------------------------------------------------------------
// Section emitters — field order must match types/index.ts exactly.
// ---------------------------------------------------------------------------

interface CloudinaryImageLit {
  publicId: string;
  alt: string;
  width: number;
  height: number;
}

interface VideoEmbedLit {
  platform: VideoPlatform;
  videoId: string;
  title: string;
}

const requireString = (v: string | null, field: string, slug: string): string => {
  if (v === null) throw new Error(`${slug}: ${field} is null but required`);
  return v;
};

const requireNumber = (v: number | null, field: string, slug: string): number => {
  if (v === null) throw new Error(`${slug}: ${field} is null but required`);
  return v;
};

function thumbnailLit(p: Post): CloudinaryImageLit {
  return {
    publicId: p.thumbnail_public_id,
    alt: p.thumbnail_alt ?? "",
    width: p.thumbnail_width,
    height: p.thumbnail_height,
  };
}

function imageLitFromMedia(m: MediaRow): CloudinaryImageLit {
  return {
    publicId: requireString(m.public_id, "public_id", m.id),
    alt: m.alt ?? "",
    width: requireNumber(m.width, "width", m.id),
    height: requireNumber(m.height, "height", m.id),
  };
}

function videoLitFromMedia(m: MediaRow): VideoEmbedLit {
  return {
    platform: m.video_platform as VideoPlatform,
    videoId: requireString(m.video_id, "video_id", m.id),
    title: m.video_title ?? "",
  };
}

function postVideoLit(p: Post): VideoEmbedLit {
  return {
    platform: p.video_platform as VideoPlatform,
    videoId: requireString(p.video_id, "video_id", p.slug),
    title: p.video_title ?? "",
  };
}

function emitArchives(posts: ReadonlyArray<Post>): string {
  const items = posts.map((p) => ({
    id: p.slug,
    city: requireString(p.city, "city", p.slug),
    year: requireString(p.year_label, "year_label", p.slug),
    date: p.date,
    thumbnail: thumbnailLit(p),
    photos: p.media
      .filter((m) => m.type === "image")
      .map(imageLitFromMedia),
    description: p.description ?? undefined,
  }));
  return header("ArchiveItem") + exportConst("ARCHIVES", "ArchiveItem", items);
}

function emitFilms(posts: ReadonlyArray<Post>): string {
  const items = posts.map((p) => ({
    id: p.slug,
    title: p.title,
    date: p.date,
    thumbnail: thumbnailLit(p),
    videoThumbnailUrl: p.video_thumbnail_url ?? "",
    video: postVideoLit(p),
    photos: p.media
      .filter((m) => m.type === "image")
      .map(imageLitFromMedia),
    description: p.description ?? undefined,
  }));
  return header("FilmItem") + exportConst("FILMS", "FilmItem", items);
}

function emitPhotography(posts: ReadonlyArray<Post>): string {
  const items = posts.map((p) => ({
    id: p.slug,
    title: p.title,
    client: requireString(p.client, "client", p.slug),
    date: p.date,
    thumbnail: thumbnailLit(p),
    photos: p.media
      .filter((m) => m.type === "image")
      .map(imageLitFromMedia),
    description: p.description ?? undefined,
  }));
  return (
    header("PhotographyItem") + exportConst("PHOTOGRAPHY", "PhotographyItem", items)
  );
}

function emitPersonal(posts: ReadonlyArray<Post>): string {
  const items = posts.map((p) => ({
    id: p.slug,
    title: p.title,
    date: p.date,
    thumbnail: thumbnailLit(p),
    media: p.media.map((m: MediaRow) =>
      m.type === ("image" as MediaType)
        ? imageLitFromMedia(m)
        : videoLitFromMedia(m),
    ),
    description: p.description ?? undefined,
  }));
  return (
    header("PersonalWorkItem") +
    exportConst("PERSONAL_WORKS", "PersonalWorkItem", items)
  );
}

function emitShowreels(posts: ReadonlyArray<Post>): string {
  const items = posts.map((p) => ({
    id: p.slug,
    title: p.title,
    year: Number.parseInt(p.date.slice(0, 4), 10),
    date: p.date,
    thumbnail: thumbnailLit(p),
    video: postVideoLit(p),
    description: p.description ?? undefined,
  }));
  return header("ShowreelItem") + exportConst("SHOWREELS", "ShowreelItem", items);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const SECTION_FILES: Record<PostSection, { file: string; emit: (p: ReadonlyArray<Post>) => string }> = {
  archives: { file: "data/archives.ts", emit: emitArchives },
  film: { file: "data/films.ts", emit: emitFilms },
  photography: { file: "data/photography.ts", emit: emitPhotography },
  personal: { file: "data/personal.ts", emit: emitPersonal },
  showreel: { file: "data/showreels.ts", emit: emitShowreels },
};

async function main(): Promise<void> {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  const dryRun = process.argv.includes("--dry-run");

  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const posts = await fetchPublished(client);
  console.log(`Fetched ${posts.length} published posts.`);

  const bySection = new Map<PostSection, Post[]>();
  for (const p of posts) {
    const arr = bySection.get(p.section) ?? [];
    arr.push(p);
    bySection.set(p.section, arr);
  }

  for (const section of Object.keys(SECTION_FILES) as PostSection[]) {
    const sectionPosts = bySection.get(section) ?? [];
    const { file, emit } = SECTION_FILES[section];
    const contents = emit(sectionPosts);
    const path = resolve(process.cwd(), file);

    if (dryRun) {
      console.log(`\n=== ${file} (${sectionPosts.length} posts) ===\n${contents}`);
      continue;
    }

    writeFileSync(path, contents, "utf-8");
    console.log(`  ✓ ${file} (${sectionPosts.length} posts)`);
  }

  if (dryRun) {
    console.log("\n(dry-run; no files written)");
  } else {
    console.log("\nSync complete. Run `git diff data/` to inspect changes.");
  }
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
