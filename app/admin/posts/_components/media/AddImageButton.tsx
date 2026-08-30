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
  /** 배치(위젯 세션)의 모든 파일 처리가 끝났을 때 — public_id 를 사용자가 고른 순서대로 전달 */
  readonly onBatchComplete?: (publicIdsInSelectionOrder: ReadonlyArray<string>) => void;
}

interface QueuesEndInfo {
  files?: ReadonlyArray<{ uploadInfo?: { public_id?: string } }>;
}

export function AddImageButton({ onUploaded, onBatchComplete }: AddImageButtonProps) {
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
      onQueuesEnd={(result) => {
        // 위젯이 큐 순서(= 선택 순서)로 파일 목록을 준다. 완료 순서는 병렬이라 뒤섞이므로
        // 이 순서로 한 번 재정렬해 "고른 순서대로 들어간다" 를 보장한다.
        const info = result.info as QueuesEndInfo | string | undefined;
        if (!info || typeof info !== "object") return;
        const ids = (info.files ?? [])
          .map((f) => f.uploadInfo?.public_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0);
        if (ids.length > 0) onBatchComplete?.(ids);
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
