"use client";

import { useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Btn } from "../../../_components/ui/Btn";

interface UploadedImage {
  readonly publicId: string;
  readonly width: number;
  readonly height: number;
  /** 같은 위젯 세션 안에서 몇 번째로 완료됐는지 — 서버가 display_order 를 이 순서로 부여한다. */
  readonly index: number;
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
  // 위젯을 열 때마다 0 부터. 여러 장을 올리면 onSuccess 가 파일마다 병렬로
  // 발화하므로, 완료 순서를 여기서 번호로 고정해 서버의 max+1 경쟁을 피한다.
  const batchIndex = useRef(0);

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
          index: batchIndex.current++,
        });
      }}
    >
      {({ open }) => (
        <Btn
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            batchIndex.current = 0;
            open();
          }}
        >
          + 이미지
        </Btn>
      )}
    </CldUploadWidget>
  );
}
