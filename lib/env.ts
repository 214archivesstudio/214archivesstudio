/**
 * Admin-facing env sanity check. NEXT_PUBLIC_* values are inlined at build
 * time, so this runs on the server at render and just reports what is missing —
 * the uploaders degrade gracefully, but the operator should know why.
 */
const ADMIN_UPLOAD_ENV = [
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
  "NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET",
] as const;

export function getMissingAdminEnv(): ReadonlyArray<string> {
  return ADMIN_UPLOAD_ENV.filter((key) => !process.env[key]);
}
