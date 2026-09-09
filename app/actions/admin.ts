"use server";

/** 관리자 액션: 매물 / 회원 / 상담 / 팝업 / 설정 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, schema, now, setSetting } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

export type AdminState = { ok: boolean; message?: string } | null;
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const n = (fd: FormData, k: string) => { const v = s(fd, k); return v === "" ? null : Number(v); };
const revalidate = () => { revalidatePath("/"); revalidatePath("/location"); };

// ---------------------------------------------------------------- 매물
export async function saveListingAction(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = n(fd, "id");
  const code = s(fd, "code").toUpperCase(), type = s(fd, "type") === "sale" ? "sale" : "lease";
  const title = s(fd, "title"), region = s(fd, "region"), category = s(fd, "category");
  if (!code) return { ok: false, message: "매물번호를 입력해 주세요." };
  if (!title || !region || !category) return { ok: false, message: "제목, 지역, 업종은 필수입니다." };
  const db = await getDb();
  const dup = await db.query.listings.findFirst({ where: eq(schema.listings.code, code) });
  if (dup && dup.id !== id) return { ok: false, message: "이미 사용 중인 매물번호입니다." };

  const keep = fd.getAll("keep_images").map(String).filter(Boolean);
  const uploaded: string[] = [];
  try {
    for (const f of fd.getAll("images")) { const r = await saveUpload(f as File, "listings", "image"); if (r) uploaded.push(r.url); }
  } catch (e) { return { ok: false, message: (e as Error).message }; }
  const images = [...keep, ...uploaded];
  const features = s(fd, "features").split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  const values = {
    code, type, category, title, region, address: s(fd, "address"), dateListed: s(fd, "date_listed") || now().slice(0, 10),
    deposit: s(fd, "deposit"), rent: s(fd, "rent"), area: s(fd, "area"), floor: s(fd, "floor"),
    features: JSON.stringify(features), images: JSON.stringify(images), description: s(fd, "description"),
    lat: n(fd, "lat"), lng: n(fd, "lng"), status: ["open", "closed", "hidden"].includes(s(fd, "status")) ? s(fd, "status") : "open",
    sortOrder: n(fd, "sort_order") ?? 0, isSample: 0, updatedAt: now(),
  };
  if (id) await db.update(schema.listings).set(values).where(eq(schema.listings.id, id));
  else await db.insert(schema.listings).values({ ...values, createdAt: now() });
  revalidate();
  redirect("/admin/listings?saved=1");
}

export async function deleteListingAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.listings).where(eq(schema.listings.id, Number(fd.get("id"))));
  revalidate();
  redirect("/admin/listings?deleted=1");
}

export async function deleteSampleListingsAction() {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.listings).where(eq(schema.listings.isSample, 1));
  revalidate();
  redirect("/admin/listings?deleted=1");
}

// ---------------------------------------------------------------- 회원
export async function updateMemberAction(fd: FormData) {
  const me = await requireAdmin();
  const id = Number(fd.get("id")), act = s(fd, "act");
  const db = await getDb();
  if (id === me.id && (act === "block" || act === "delete")) redirect("/admin/members?error=self");
  if (act === "block") await db.update(schema.members).set({ status: "blocked" }).where(eq(schema.members.id, id));
  else if (act === "activate") await db.update(schema.members).set({ status: "active" }).where(eq(schema.members.id, id));
  else if (act === "delete") await db.delete(schema.members).where(eq(schema.members.id, id));
  else if (act === "resetpw") await db.update(schema.members).set({ passwordHash: await bcrypt.hash("mediroad1234!", 10), mustChangePw: 1 }).where(eq(schema.members.id, id));
  else if (act === "memo") await db.update(schema.members).set({ memo: s(fd, "memo") }).where(eq(schema.members.id, id));
  else if (act === "role") await db.update(schema.members).set({ role: s(fd, "role") === "admin" ? "admin" : "member" }).where(eq(schema.members.id, id));
  redirect("/admin/members?saved=1");
}

// ---------------------------------------------------------------- 상담
export async function updateInquiryAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id")), act = s(fd, "act");
  const db = await getDb();
  if (act === "delete") await db.delete(schema.inquiries).where(eq(schema.inquiries.id, id));
  else await db.update(schema.inquiries).set({ status: act === "done" ? "done" : "new", memo: s(fd, "memo") }).where(eq(schema.inquiries.id, id));
  redirect("/admin/inquiries?saved=1");
}

// ---------------------------------------------------------------- 팝업
export async function savePopupAction(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = n(fd, "id"), title = s(fd, "title");
  if (!title) return { ok: false, message: "제목을 입력해 주세요." };
  let image = s(fd, "keep_image") || null;
  try { const r = await saveUpload(fd.get("image") as File, "popups", "image"); if (r) image = r.url; } catch (e) { return { ok: false, message: (e as Error).message }; }
  if (fd.get("remove_image")) image = null;
  const db = await getDb();
  const values = { title, content: s(fd, "content"), image, link: s(fd, "link") || null, startAt: s(fd, "start_at") || null, endAt: s(fd, "end_at") || null, isActive: fd.get("is_active") ? 1 : 0 };
  if (id) await db.update(schema.popups).set(values).where(eq(schema.popups.id, id));
  else await db.insert(schema.popups).values({ ...values, createdAt: now() });
  redirect("/admin/popups?saved=1");
}

export async function deletePopupAction(fd: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.popups).where(eq(schema.popups.id, Number(fd.get("id"))));
  redirect("/admin/popups?deleted=1");
}

// ---------------------------------------------------------------- 설정
export async function saveSettingsAction(_p: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const gate = s(fd, "listing_gate");
  await setSetting("listing_gate", ["detail", "all", "none"].includes(gate) ? gate : "detail");
  await setSetting("mail_to", s(fd, "mail_to"));
  revalidate();
  return { ok: true, message: "설정이 저장되었습니다." };
}

export async function adminChangePasswordAction(_p: AdminState, fd: FormData): Promise<AdminState> {
  const me = await requireAdmin();
  const pw = s(fd, "password"), pw2 = s(fd, "password2");
  if (pw.length < 8) return { ok: false, message: "비밀번호는 8자 이상이어야 합니다." };
  if (pw !== pw2) return { ok: false, message: "비밀번호 확인이 일치하지 않습니다." };
  const db = await getDb();
  await db.update(schema.members).set({ passwordHash: await bcrypt.hash(pw, 10), mustChangePw: 0 }).where(eq(schema.members.id, me.id));
  return { ok: true, message: "관리자 비밀번호가 변경되었습니다." };
}
