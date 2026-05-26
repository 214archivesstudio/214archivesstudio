// Admin design tokens — the five palette values plus the hairline + warm
// accents are defined in tailwind.config.ts / globals.css. This module exists
// only to centralise the hex values that appear as arbitrary Tailwind classes
// (e.g. `border-[var(--admin-hairline)]`) so callers don't repeat literals.

export const ADMIN_HAIRLINE = "#2a2a2a";
export const ADMIN_WARN = "#d6a877";
export const ADMIN_DANGER = "#e2a98c";
export const ADMIN_DANGER_BORDER = "#5a3322";
export const ADMIN_WARN_BORDER = "#3a2e1f";
export const ADMIN_DANGER_PILL_BORDER = "#3a2218";
export const ADMIN_DASHED = "#3a3a3a";
export const ADMIN_BUTTON_TEXT = "#0d0d0d";
