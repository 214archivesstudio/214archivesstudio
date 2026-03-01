interface VideoEntry {
  readonly id: string;
  readonly url: string;
}

interface PreloadResult {
  readonly blobUrlMap: Map<string, string>;
  readonly cleanup: () => void;
}

interface ProgressCallback {
  (progress: number): void;
}

const ESTIMATED_SIZE_PER_VIDEO = 1.66 * 1024 * 1024; // 1.66MB fallback

function downloadVideo(
  entry: VideoEntry,
  onProgress: (loaded: number, total: number) => void,
  signal: { aborted: boolean },
): Promise<{ id: string; blobUrl: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", entry.url, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      const total = event.lengthComputable
        ? event.total
        : ESTIMATED_SIZE_PER_VIDEO;
      onProgress(event.loaded, total);
    };

    xhr.onload = () => {
      if (signal.aborted) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response as Blob;
        const blobUrl = URL.createObjectURL(blob);
        resolve({ id: entry.id, blobUrl });
      } else {
        reject(new Error(`Failed to download ${entry.id}: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      if (signal.aborted) return;
      reject(new Error(`Network error downloading ${entry.id}`));
    };

    xhr.ontimeout = () => {
      if (signal.aborted) return;
      reject(new Error(`Timeout downloading ${entry.id}`));
    };

    xhr.timeout = 30000;
    xhr.send();

    const checkAbort = () => {
      if (signal.aborted) xhr.abort();
    };
    const interval = setInterval(checkAbort, 500);
    const originalOnload = xhr.onload;
    xhr.onload = (e) => {
      clearInterval(interval);
      if (originalOnload) originalOnload.call(xhr, e);
    };
    const originalOnerror = xhr.onerror;
    xhr.onerror = (e) => {
      clearInterval(interval);
      if (originalOnerror) originalOnerror.call(xhr, e);
    };
  });
}

export function preloadVideos(
  entries: ReadonlyArray<VideoEntry>,
  onProgress: ProgressCallback,
): { promise: Promise<PreloadResult>; abort: () => void } {
  const signal = { aborted: false };
  const blobUrls: string[] = [];

  const progressMap = new Map<string, { loaded: number; total: number }>();
  for (const entry of entries) {
    progressMap.set(entry.id, { loaded: 0, total: ESTIMATED_SIZE_PER_VIDEO });
  }

  const updateProgress = () => {
    let totalLoaded = 0;
    let totalSize = 0;
    for (const { loaded, total } of progressMap.values()) {
      totalLoaded += loaded;
      totalSize += total;
    }
    const progress = totalSize > 0 ? Math.min(totalLoaded / totalSize, 1) : 0;
    onProgress(progress);
  };

  const promise = Promise.allSettled(
    entries.map((entry) =>
      downloadVideo(
        entry,
        (loaded, total) => {
          progressMap.set(entry.id, { loaded, total });
          updateProgress();
        },
        signal,
      ),
    ),
  ).then((results) => {
    const blobUrlMap = new Map<string, string>();

    for (const result of results) {
      if (result.status === "fulfilled") {
        blobUrlMap.set(result.value.id, result.value.blobUrl);
        blobUrls.push(result.value.blobUrl);
      }
    }

    const cleanup = () => {
      for (const url of blobUrls) {
        URL.revokeObjectURL(url);
      }
    };

    return { blobUrlMap, cleanup };
  });

  const abort = () => {
    signal.aborted = true;
  };

  return { promise, abort };
}
