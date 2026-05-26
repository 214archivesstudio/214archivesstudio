"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Btn } from "../../../_components/ui/Btn";

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
      <p className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[11px] text-[#e2a98c]">
        업로드를 사용하려면 <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> 환경 변수가 필요합니다.
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
        <Btn variant="ghost" size="sm" type="button" onClick={() => open()}>
          + 이미지
        </Btn>
      )}
    </CldUploadWidget>
  );
}
