"use client";

import { useState } from "react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { Btn } from "../../_components/ui/Btn";

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
      <div className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
        업로드를 사용하려면 <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> 환경 변수를 설정하세요. (docs/admin-setup.md §7)
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="thumbnail_public_id" value={publicId} />
      <input type="hidden" name="thumbnail_width" value={width} />
      <input type="hidden" name="thumbnail_height" value={height} />

      {publicId ? (
        <div className="flex items-start gap-4">
          <div className="aspect-[3/2] w-40 shrink-0 overflow-hidden rounded-[2px] border border-[#2a2a2a] bg-white/5">
            <CldImage
              src={publicId}
              alt={initialAlt ?? "썸네일 미리보기"}
              width={320}
              height={213}
              crop="fill"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
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
                <Btn
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => open()}
                >
                  썸네일 변경
                </Btn>
              )}
            </CldUploadWidget>
            <div className="max-w-xs break-all font-mono text-[11px] text-muted">
              {publicId}
              <div className="text-[#666]">
                {width} × {height}
              </div>
            </div>
          </div>
        </div>
      ) : (
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
              className="block w-full rounded-[2px] border border-dashed border-[#3a3a3a] bg-white/[0.02] px-5 py-8 text-center transition-colors hover:border-foreground hover:bg-white/[0.04]"
            >
              <div className="text-[13px] text-accent">
                이미지를 끌어다 놓거나{" "}
                <span className="text-foreground underline">파일 선택</span>
              </div>
              <div className="mt-1.5 text-[11px] text-muted">
                3:2 비율 권장 · Cloudinary로 업로드됩니다
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}

      {fieldError && (
        <p className="text-[12px] text-[#e2a98c]">{fieldError}</p>
      )}
    </div>
  );
}
