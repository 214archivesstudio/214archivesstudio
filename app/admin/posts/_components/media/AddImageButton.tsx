"use client";

import { CldUploadWidget } from "next-cloudinary";

interface UploadedImage {
  readonly publicId: string;
  readonly width: number;
  readonly height: number;
}

interface CloudinaryInfo {
  public_id: string;
  width: number;
  height: number;
}

interface AddImageButtonProps {
  readonly onUploaded: (image: UploadedImage) => void;
}

export function AddImageButton({ onUploaded }: AddImageButtonProps) {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!preset) {
    return (
      <p className="text-xs text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
        업로드를 사용하려면 <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> 환경 변수를
        설정하세요.
      </p>
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={preset}
      options={{
        multiple: true,
        sources: ["local", "url"],
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
        maxFileSize: 20_000_000,
      }}
      onSuccess={(result) => {
        if (result.event !== "success") return;
        const info = result.info as CloudinaryInfo | string | undefined;
        if (!info || typeof info !== "object") return;
        onUploaded({
          publicId: info.public_id,
          width: info.width,
          height: info.height,
        });
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className="px-3 py-1.5 text-sm border border-accent/30 rounded hover:border-foreground transition-colors"
        >
          이미지 업로드
        </button>
      )}
    </CldUploadWidget>
  );
}
