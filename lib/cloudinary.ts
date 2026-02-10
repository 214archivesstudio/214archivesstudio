const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "placeholder";

export function buildCloudinaryUrl(
  publicId: string,
  options: {
    readonly width?: number;
    readonly height?: number;
    readonly quality?: number;
    readonly format?: "auto" | "webp" | "avif";
  } = {}
): string {
  const { width, height, quality = 80, format = "auto" } = options;
  const transforms: string[] = [`q_${quality}`, `f_${format}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}

export function buildBlurPlaceholder(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width: 20,
    quality: 30,
    format: "webp",
  });
}

export function buildResponsiveSrcSet(
  publicId: string,
  widths: ReadonlyArray<number> = [640, 768, 1024, 1280, 1920]
): string {
  return widths
    .map((w) => `${buildCloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(", ");
}
