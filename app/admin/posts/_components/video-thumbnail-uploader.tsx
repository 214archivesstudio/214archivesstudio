"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetOptions } from "next-cloudinary";
import { Btn } from "../../_components/ui/Btn";
import { Input } from "../../_components/ui/Input";

const VIDEO_TRANSFORMATION = "du_10,q_auto,vc_auto,w_1280";

interface VideoThumbnailUploaderProps {
  readonly initialUrl?: string;
  readonly fieldError?: string;
}

interface CloudinaryVideoUploadInfo {
  public_id: string;
  version: number;
}

export function VideoThumbnailUploader({
  initialUrl = "",
  fieldError,
}: VideoThumbnailUploaderProps) {
  const [url, setUrl] = useState(initialUrl);

  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET;

  if (!preset) {
    return (
      <div className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[12px] text-[#e2a98c]">
        영상 업로드를 사용하려면 <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET</code> 환경 변수를 설정하세요. (docs/admin-setup.md §7)
      </div>
    );
  }

  const widgetOptions: CloudinaryUploadWidgetOptions = {
    maxFiles: 1,
    multiple: false,
    sources: ["local"],
    clientAllowedFormats: ["mp4", "webm", "mov"],
    maxFileSize: 200_000_000,
    resourceType: "video",
  };

  const handleSuccess = (info: CloudinaryVideoUploadInfo) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return;
    if (typeof info.version !== "number" || !info.public_id) return;
    setUrl(
      `https://res.cloudinary.com/${cloudName}/video/upload/${VIDEO_TRANSFORMATION}/v${info.version}/${info.public_id}.mp4`,
    );
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="video_thumbnail_url" value={url} />

      {url ? (
        <div className="flex items-start gap-4">
          <div className="aspect-video w-40 shrink-0 overflow-hidden rounded-[2px] border border-[#2a2a2a] bg-white/5">
            <video
              src={url}
              muted
              loop
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <CldUploadWidget
              uploadPreset={preset}
              options={widgetOptions}
              onSuccess={(result) => {
                if (result.event !== "success") return;
                const info = result.info as CloudinaryVideoUploadInfo | string | undefined;
                if (!info || typeof info !== "object") return;
                handleSuccess(info);
              }}
            >
              {({ open }) => (
                <Btn
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => open()}
                >
                  영상 변경
                </Btn>
              )}
            </CldUploadWidget>
            <div className="max-w-xs break-all font-mono text-[11px] text-muted">
              {url}
            </div>
          </div>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset={preset}
          options={widgetOptions}
          onSuccess={(result) => {
            if (result.event !== "success") return;
            const info = result.info as CloudinaryVideoUploadInfo | string | undefined;
            if (!info || typeof info !== "object") return;
            handleSuccess(info);
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="block w-full rounded-[2px] border border-dashed border-[#3a3a3a] bg-white/[0.02] px-5 py-8 text-center transition-colors hover:border-foreground hover:bg-white/[0.04]"
            >
              <div className="text-[13px] text-accent">
                영상을 끌어다 놓거나{" "}
                <span className="text-foreground underline">파일 선택</span>
              </div>
              <div className="mt-1.5 text-[11px] text-muted">
                앞 10초만 사용됩니다 · 가로 영상 권장 · Cloudinary로 업로드됩니다
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}

      <details className="text-[12px] text-muted">
        <summary className="cursor-pointer select-none">고급: URL 직접 입력</summary>
        <div className="mt-2">
          <Input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://res.cloudinary.com/…/video/upload/…mp4"
          />
        </div>
      </details>

      {fieldError && (
        <p className="text-[12px] text-[#e2a98c]">{fieldError}</p>
      )}
    </div>
  );
}
