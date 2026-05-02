# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

214 Archives Studio — a photographer/videographer portfolio website built with Next.js (App Router), TypeScript, and Tailwind CSS. All content is served via Cloudinary CDN. Deployed on Vercel.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint (next/core-web-vitals)

No test framework is configured.

## Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

## Architecture

### Routing (App Router)

Every content section follows the same pattern:
- `app/{section}/page.tsx` — list view (thumbnail grid or horizontal slider)
- `app/{section}/[id]/page.tsx` — detail view (lightbox, video player, or photo grid)

Sections: `showreel`, `archives`, `film`, `photography`, `personal`, `contact`.

All page components are client components (`"use client"`). Server components are used only at the layout level.

### Data Layer

Content is static — defined as typed arrays in `data/*.ts` files (no database, no CMS). Each data file exports a readonly array matching the corresponding type from `types/index.ts`. To add content, add entries to the appropriate data file with Cloudinary `publicId` references.

### Type System

All interfaces are in `types/index.ts` with `readonly` properties throughout. Content types: `ShowreelItem`, `ArchiveItem`, `FilmItem`, `PhotographyItem`, `PersonalWorkItem`. All use `CloudinaryImage` (publicId + dimensions) for images and `VideoEmbed` (platform + videoId) for video.

### Background System

`BackgroundContext` + `useHoverBackground` hook manages a global crossfading background layer (`BackgroundLayer` component). Thumbnails trigger background changes on hover via the context. The background supports both images and videos with configurable overlay opacity.

### Key Components

- **ThumbnailGrid** — responsive grid (2/3/4 columns) with Framer Motion stagger animations and hover scale effects
- **HorizontalSlider** — horizontal scroll with wheel capture, drag/pointer support, arrow navigation, and scroll snap
- **Lightbox** — fullscreen image viewer with keyboard nav and adjacent image preloading
- **LoadingAnimation** — theater curtain reveal effect using CSS clipPath animation
- **FadeIn / ScrollReveal** — Framer Motion animation wrappers

### Styling

Tailwind CSS v4 (CSS-first config). Custom theme in `tailwind.config.ts`:
- Dark theme: background `#1A1A1A`, foreground `#FFFFFF`
- Font: Pretendard Variable (loaded via CDN in `globals.css`)
- Breakpoints: sm(480), md(768), lg(1280), xl(1440)
- Custom animations defined for fade, slide, and logo-rise effects

### Image Handling

All images go through `next-cloudinary`. Use `CldImage` component for rendered images and `getCldImageUrl()` for background/preload URLs. The `next.config.ts` allows remote patterns for Cloudinary, YouTube, and Vimeo domains. Output formats: AVIF with WebP fallback.

### Path Alias

`@/*` maps to project root (configured in `tsconfig.json`).
