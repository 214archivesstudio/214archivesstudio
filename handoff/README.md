# 214 Archives Studio — Admin UI Handoff

Cinematic minimal admin for the existing Next.js 16 / App Router site at `/admin/*`.
Visually aligned with the public site (https://www.214archives.com) — same palette, same typography, same restraint.

---

## What's in this folder

| File | Purpose |
|---|---|
| **`admin-mockup.html`** | The pitch: all 6 screens on one design canvas. Click an artboard label to focus, use arrow keys to flip between screens. |
| `preview-{login,dashboard,posts,new,edit,team}.html` | Each screen at 1:1, full viewport. Open in a browser to inspect interactions, spacing, copy. |
| `admin-chrome.jsx` | Shared atoms: `AdminHeader`, `PageHead`, `Card`, `Btn`, `Field`, `Input`, `Textarea`, `Select`, `StatusDot`, `Pill`. **The single source of truth for every admin pattern.** |
| `admin-screen-login.jsx` | `/admin/login` |
| `admin-screen-dashboard.jsx` | `/admin` — stats row, publish (drift) panel, recent activity table |
| `admin-screen-posts.jsx` | `/admin/posts` — filter row, section tabs, post rows with thumbnail |
| `admin-screen-new.jsx` | `/admin/posts/new` — section picker → section-specific form |
| `admin-screen-edit.jsx` | `/admin/posts/[id]` — form + drag-reorder media grid + sticky save bar |
| `admin-screen-team.jsx` | `/admin/team` — member list + role descriptions (optional) |
| `admin-data.js` | Mock data — replace with Supabase reads in production |
| `design-canvas.jsx` | (vendored) the pan/zoom canvas used by `admin-mockup.html` |

The mockup files load `../colors_and_type.css` from the design system, so the admin inherits all brand tokens automatically.

---

## Design rules (must-follow when porting to Next.js)

These are the constraints — everything else is implementation detail.

### 1. Palette (5 values, no more)

```ts
// tailwind.config.ts — already defined, do NOT add new colors
background: "#1A1A1A"  // page
foreground: "#FFFFFF"  // primary text, active nav, all H1
accent:     "#CCCCCC"  // body, item titles, status text
muted:      "#888888"  // meta, inactive nav, labels
overlay:    "rgba(0,0,0,0.6)"
// + hairline border: #2a2a2a (the ONLY deviation from public — admin needs structure)
```

**No new brand colors. No semantic blues/greens/reds.**
The single status accent we added: `#d6a877` (warn/drift) and `#e2a98c` (danger) — both warm, both in the studio's existing imagery palette. Used as tinted pill backgrounds only.

### 2. Typography

- **One family**: Pretendard Variable (already loaded in `globals.css`).
- **Two weights**: 300 (light) for big headings, 400 (regular) for everything else.
- **Wide tracking is the signature**:
  - H1 (page title): 28px / weight 300 / `tracking-[0.18em]`. (Slightly tighter than public's 0.2em because Korean glyphs at 0.2em get loose.)
  - Eyebrow labels: 11px / `tracking-[0.2em]` / `uppercase`.
  - CardLabel (section headings inside cards): 11px / `tracking-[0.18em]` / `uppercase` / muted.
  - Field labels: 11px / `tracking-[0.15em]` / `uppercase`.
  - Body / table rows: 13–15px / 400 / accent or foreground.

### 3. Structure, not shadow

Public site uses zero borders, zero shadows — imagery alone delineates space. Admin can't do that. We adopted **one** structural rule:

- **Hairline `1px solid #2a2a2a`** to separate cards, table rows, page sections.
- **No drop shadows. No inner shadows. No glow.**
- Cards optionally tint background to `rgba(255,255,255,0.02)` for a 1-stop lift, never more.

### 4. Corners

- `border-radius: 2px` everywhere a card or button has corners.
- `border-radius: 9999px` only for status dots, avatar circles, and pill badges.
- That's the entire radius vocabulary.

### 5. Motion

- All transitions: 200ms easeOut (`--dur-fast`).
- Hover: scale 1.03 on cards/thumbs, color shift on text.
- Page transitions / FadeIn: 400–600ms via framer-motion (consistent with public site's existing `<FadeIn>` component).
- **No bounces, no springs, no overshoot.**

### 6. Buttons (5 variants only)

| Variant | Use | Style |
|---|---|---|
| `primary`   | The one action that finishes a screen (Save, Publish, Login) | `bg-white text-black border-white` |
| `secondary` | Important secondary action | `bg-transparent text-white border-white` |
| `ghost`     | Tertiary / repeatable list actions | `bg-transparent text-accent border-#2a2a2a` |
| `text`      | Quietest (취소, 더보기) | `text-muted no-border` |
| `danger`    | Destructive (삭제) | `bg-transparent text-#e2a98c border-#5a3322` |

All buttons: 2px radius, `tracking-[0.06em]`, no uppercase.


## Layout patterns

`AdminLayout` shell: sticky header, max-w 1440px, px-12 py-8. Edit screen uses two equal columns with the media side as `position: sticky`. Post list uses a grid row pattern (not `table`) so thumbnails align cleanly. Section picker on /new uses 5 flat cards as controls; the card itself is the radio. Dashboard publish panel: drift items as sub-cards with hairline border, big primary CTA at bottom.

## Component reuse from existing repo

| Existing | Use for |
|---|---|
| `components/ui/Lightbox` | Media manager preview |
| `components/common/FadeIn` | Page-entry motion on every PageHead |
| `lib/utils.ts` `cn()` | Class joins inside Btn / Pill variants |
| `next-cloudinary` `CldImage` | Every thumbnail — same Cloudinary instance as public |
| `sonner` | Save / publish / delete toasts. `<Toaster theme="dark" position="bottom-right" />`, bg #1A1A1A, border #2a2a2a |
| `@dnd-kit/sortable` | Drag-reorder for MediaTile — already wired in existing MediaManager.tsx |

## Server-action surface (preserve)

Do NOT rewrite `app/admin/_actions/publish.ts`, `app/admin/posts/_actions/posts.ts`, `app/admin/posts/_actions/media.ts`. Migrate the JSX consumers under `app/admin/posts/_components/` and `app/admin/_components/` to use the new visual primitives, but keep the action signatures intact. RLS rules in Supabase are untouched.

Mapping:
- `publish-panel.tsx` → `<PublishPanel>` (calls `publish()` as before)
- `drift-badge.tsx` → `<Pill tone="warn">DRIFT · {n}</Pill>`
- `post-form.tsx` → `<Field>` + atoms (calls `savePost()`)
- `delete-dialog.tsx` → same dialog, restyled
- `media/MediaGrid.tsx` → `<MediaManager>` (drag reorder via dnd-kit)
- `media/MediaCard.tsx` → `<MediaTile>`

## Routing

No changes. 6 screens map 1-1 to existing routes:

```
/admin/login        LoginScreen
/admin              DashboardScreen
/admin/posts        PostsScreen
/admin/posts/new    NewPostScreen
/admin/posts/[id]   EditPostScreen
/admin/team         TeamScreen   (NEW — add a route)
```

`middleware.ts` redirect to /admin/login stays.

## Mobile

Desktop-first, per spec. For < 768px:
1. Header → hamburger (reuse public site's MobileMenu pattern with admin nav items)
2. PageHead `right` slot wraps below title
3. Dashboard 4-col stats → 2×2
4. Edit two-column collapses; media stacks under form
5. PostRow grid collapses to thumb + title; status/actions move below
6. Tables get horizontal scroll inside the card

## Open questions

1. Section picker placement on /new: inline above the form vs modal. My pick: inline.
2. Team page: marked "선택" — drop if Supabase Auth's UI is sufficient.
3. Drift item shape — adapt to whatever `publish.ts` actually returns.
4. Cmd-K search chip on posts list — visual only unless a palette already exists.
5. Empty states not designed in this pass — use centered muted message + primary CTA.

## Implementation order

1. Drop `admin-chrome.jsx` atoms into `app/admin/_components/ui/*.tsx` (one file per atom, convert to TS).
2. Update `app/admin/layout.tsx` to use new `<AdminHeader>` and max-width.
3. Migrate `app/admin/page.tsx` (dashboard).
4. Migrate `app/admin/posts/page.tsx`.
5. Migrate `app/admin/posts/[id]/page.tsx` — biggest one.
6. `app/admin/posts/new/page.tsx` — add section picker.
7. `app/admin/login/page.tsx`.

Each step ships independently. New and old admin can coexist behind a feature flag.

## What I'm uncertain about

- Korean tracking at 0.18em may feel tense once font hinting kicks in. Test 0.15 vs 0.18 side-by-side.
- Drift sub-cards might read cleaner as plain rows without the bg tint — A/B once real data shapes.
- 3-col media grid might want 4 cols on > 1600px viewports.

Everything here is a reference, not a prescription. The atoms in `admin-chrome.jsx` are the contract; rearrange compositions to match real data.
