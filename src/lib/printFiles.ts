const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/heic-sequence": "heic",
};

const NAME_EXTENSIONS: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  heic: "heic",
  heif: "heif",
};

export function printFileExtension(name: string, mime: string): string | null {
  const fromMime = MIME_EXTENSIONS[mime.toLowerCase()];
  if (fromMime) {
    return fromMime;
  }

  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!match) {
    return null;
  }

  return NAME_EXTENSIONS[match[1]] ?? null;
}
