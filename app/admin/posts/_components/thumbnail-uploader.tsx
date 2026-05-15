"use client";

import { useState } from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";

interface ThumbnailUploaderProps {
  readonly initialPublicId?: string;
  readonly initialWidth?: number;
  readonly initialHeight?: number;
  readonly initialAlt?: string;
  readonly fieldError?: string;
}

interface CloudinaryUploadInfo {
  public_id: string;
  width: number;
  height: number;
  secure_url: string;
}

export function ThumbnailUploader({
  initialPublicId = "",
  initialWidth = 1200,
  initialHeight = 800,
  initialAlt,
  fieldError,
}: ThumbnailUploaderProps) {
  const [publicId, setPublicId] = useState(initialPublicId);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!preset) {
    return (
      <div className="text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
        업로드를 사용하려면 <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> 환경 변수를
        설정하세요. (docs/admin-setup.md §7 참고)
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="thumbnail_public_id" value={publicId} />
      <input type="hidden" name="thumbnail_width" value={width} />
      <input type="hidden" name="thumbnail_height" value={height} />

      <div className="flex items-start gap-4">
        <div className="w-40 h-28 border border-accent/20 rounded overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
          {publicId ? (
            <CldImage
              src={publicId}
              alt={initialAlt ?? "썸네일 미리보기"}
              width={320}
              height={224}
              crop="fill"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted">미리보기 없음</span>
          )}
        </div>

        <div className="space-y-2">
          <CldUploadWidget
            uploadPreset={preset}
            options={{
              maxFiles: 1,
              multiple: false,
              sources: ["local", "url"],
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
              maxFileSize: 20_000_000,
            }}
            onSuccess={(result) => {
              if (result.event !== "success") return;
              const info = result.info as CloudinaryUploadInfo | string | undefined;
              if (!info || typeof info !== "object") return;
              setPublicId(info.public_id);
              setWidth(info.width);
              setHeight(info.height);
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="px-3 py-1.5 text-sm border border-accent/30 rounded hover:border-foreground transition-colors"
              >
                {publicId ? "썸네일 변경" : "썸네일 업로드"}
              </button>
            )}
          </CldUploadWidget>

          {publicId && (
            <div className="text-xs text-muted font-mono break-all max-w-xs">
              {publicId}
              <div className="text-[#666666]">
                {width} × {height}
              </div>
            </div>
          )}
        </div>
      </div>

      {fieldError && (
        <p className="text-sm text-red-400">{fieldError}</p>
      )}
    </div>
  );
}
