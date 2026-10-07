const MAX_BYTES = 1_500_000;

/**
 * Resize a profile photo and re-encode it as JPEG before upload.
 * Runs in the browser (canvas); do not import this from a Server Component.
 */
export async function compressProfilePhoto(file: File): Promise<{
  file: File;
  before: number;
  after: number;
}> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read that image. Use a JPEG, PNG, or WebP.");
  }

  const attempts = [
    { edge: 1024, quality: 0.82 },
    { edge: 1024, quality: 0.7 },
    { edge: 800, quality: 0.7 },
    { edge: 640, quality: 0.65 },
  ];

  let last: Blob | null = null;
  try {
    for (const attempt of attempts) {
      last = await renderJpeg(bitmap, attempt.edge, attempt.quality);
      if (last.size <= MAX_BYTES) break;
    }
  } finally {
    bitmap.close();
  }

  if (!last) throw new Error("Could not compress that image.");
  if (last.size > 2 * 1024 * 1024) {
    throw new Error("That photo is still too large after compression. Try a smaller image.");
  }

  return {
    file: new File([last], "avatar.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    }),
    before: file.size,
    after: last.size,
  };
}

function renderJpeg(bitmap: ImageBitmap, edge: number, quality: number) {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Could not compress that image."));
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not compress that image.")),
      "image/jpeg",
      quality,
    );
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
