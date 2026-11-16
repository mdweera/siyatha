export async function croppedPrintFile(
  file: File,
  cropX: number,
  cropY: number,
  aspect: { width: number; height: number }
): Promise<File> {
  const url = URL.createObjectURL(file);

  try {
    const image = await loadImage(url);
    if (image.naturalWidth < 1 || image.naturalHeight < 1) {
      return file;
    }

    const longest = 2000;
    const ratio = aspect.width / aspect.height;
    const frameWidth = ratio >= 1 ? longest : Math.round(longest * ratio);
    const frameHeight = ratio >= 1 ? Math.round(longest / ratio) : longest;
    const canvas = document.createElement("canvas");
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    const scale = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const offsetX = (frameWidth - drawnWidth) * (Math.min(100, Math.max(0, cropX)) / 100);
    const offsetY = (frameHeight - drawnHeight) * (Math.min(100, Math.max(0, cropY)) / 100);
    context.drawImage(image, offsetX, offsetY, drawnWidth, drawnHeight);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      return file;
    }

    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that photo."));
    image.src = url;
  });
}
