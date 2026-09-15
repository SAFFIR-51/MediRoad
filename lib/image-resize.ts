/**
 * 관리자 사진 업로드 전 브라우저에서 긴 변 max px 로 줄여 JPEG 로 만든다.
 * 카페24 업로드 용량 제한을 피하고 전송 시간을 줄이기 위한 것이며, 서버(api/admin/upload.php)가 다시 한 번 재인코딩한다.
 */
export async function resizeImage(file: File, max = 1600, quality = 0.88): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("JPG · PNG · WEBP 사진만 올릴 수 있습니다.");
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.type === "image/jpeg" && file.size < 2_500_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality));
}
