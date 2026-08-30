import { notFound } from "next/navigation";

/**
 * Catch-all so unmatched /admin/* paths (e.g. the removed /admin/team) render
 * app/admin/not-found.tsx inside the admin shell instead of Next's bare 404.
 */
export default function AdminMissingPage() {
  notFound();
}
