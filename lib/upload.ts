import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp"];
const FILE_EXT = [...IMAGE_EXT, "pdf", "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "txt"];

/**
 * 업로드 파일을 public/uploads/<sub>/ 에 저장하고 URL 을 돌려준다.
 * (서버리스 호스팅에서는 디스크가 영구 저장되지 않으므로 외부 스토리지로 교체 필요 — README 참고)
 */
export async function saveUpload(file: File | null, sub: string, kind: "image" | "file" = "image"): Promise<{ url: string; name: string } | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const allow = kind === "image" ? IMAGE_EXT : FILE_EXT;
  if (!allow.includes(ext)) throw new Error(`허용되지 않는 파일 형식입니다 (${ext})`);
  if (file.size > 20 * 1024 * 1024) throw new Error("파일 크기는 20MB 이하여야 합니다.");
  const dir = path.join(process.cwd(), "public", "uploads", sub);
  await fs.mkdir(dir, { recursive: true });
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const name = `${stamp}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${sub}/${name}`, name: file.name };
}
