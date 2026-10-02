import { csrfOk, fail, isResponse, ok, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX = 15 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** 매물 사진 업로드 → Vercel Blob. 브라우저에서 긴 변 1600px 로 줄여 보낸다 (lib/image-resize.ts) */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  if (!csrfOk(req)) return fail("잘못된 요청입니다.", 403);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return fail("사진 저장소가 연결되지 않았습니다. Vercel 프로젝트에 Blob 저장소를 연결해 주세요.", 503);
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("사진 파일이 없습니다.", 400);
  if (file.size > MAX) return fail("사진 용량은 15MB 이하여야 합니다.", 422);
  if (!TYPES.includes(file.type)) return fail("JPG · PNG · WEBP 사진만 올릴 수 있습니다.", 422);

  const { put } = await import("@vercel/blob");
  const now = new Date();
  const path = `listings/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/photo.jpg`;
  const blob = await put(path, file, { access: "public", addRandomSuffix: true, contentType: file.type });
  return ok({ path: blob.url });
}
