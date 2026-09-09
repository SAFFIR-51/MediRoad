"use server";

/** 회원: 가입 / 로그인 / 로그아웃 / 정보수정 / 비밀번호 변경 / 탈퇴 / 아이디·비밀번호 찾기 */
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getDb, schema, now } from "@/lib/db";
import { createSession, destroySession, currentMember } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { site } from "@/lib/site";

export type FormState = { ok: boolean; message?: string; extra?: Record<string, string> } | null;
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/");

export async function joinAction(_p: FormState, fd: FormData): Promise<FormState> {
  const userId = s(fd, "user_id").toLowerCase(), password = s(fd, "password"), password2 = s(fd, "password2");
  const name = s(fd, "name"), phone = s(fd, "phone"), email = s(fd, "email").toLowerCase();
  if (!/^[a-z0-9_]{4,20}$/.test(userId)) return { ok: false, message: "아이디는 영문 소문자·숫자 4~20자로 입력해 주세요." };
  if (password.length < 8) return { ok: false, message: "비밀번호는 8자 이상이어야 합니다." };
  if (password !== password2) return { ok: false, message: "비밀번호 확인이 일치하지 않습니다." };
  if (!name) return { ok: false, message: "이름을 입력해 주세요." };
  if (!/^[0-9-]{9,14}$/.test(phone)) return { ok: false, message: "휴대전화 번호를 확인해 주세요." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "이메일 주소를 확인해 주세요." };
  if (!fd.get("agree_terms") || !fd.get("agree_privacy")) return { ok: false, message: "이용약관과 개인정보처리방침에 동의해 주세요." };
  const db = await getDb();
  if (await db.query.members.findFirst({ where: eq(schema.members.userId, userId) })) return { ok: false, message: "이미 사용 중인 아이디입니다." };
  const [m] = await db.insert(schema.members).values({ userId, passwordHash: await bcrypt.hash(password, 10), name, phone, email, role: "member", status: "active", createdAt: now() }).returning();
  await createSession(m.id);
  redirect("/member/mypage?joined=1");
}

export async function loginAction(_p: FormState, fd: FormData): Promise<FormState> {
  const userId = s(fd, "user_id").toLowerCase(), password = s(fd, "password"), next = safeNext(s(fd, "next") || "/");
  const db = await getDb();
  const m = await db.query.members.findFirst({ where: eq(schema.members.userId, userId) });
  if (!m || !(await bcrypt.compare(password, m.passwordHash))) return { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." };
  if (m.status !== "active") return { ok: false, message: "이용이 제한된 계정입니다. 관리자에게 문의해 주세요." };
  await createSession(m.id);
  redirect(m.mustChangePw ? "/member/mypage?tab=password&must=1" : next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(_p: FormState, fd: FormData): Promise<FormState> {
  const me = await currentMember(); if (!me) redirect("/member/login");
  const name = s(fd, "name"), phone = s(fd, "phone"), email = s(fd, "email").toLowerCase();
  if (!name) return { ok: false, message: "이름을 입력해 주세요." };
  const db = await getDb();
  await db.update(schema.members).set({ name, phone, email }).where(eq(schema.members.id, me.id));
  return { ok: true, message: "회원 정보가 저장되었습니다." };
}

export async function changePasswordAction(_p: FormState, fd: FormData): Promise<FormState> {
  const me = await currentMember(); if (!me) redirect("/member/login");
  const cur = s(fd, "current"), pw = s(fd, "password"), pw2 = s(fd, "password2");
  if (!(await bcrypt.compare(cur, me.passwordHash))) return { ok: false, message: "현재 비밀번호가 올바르지 않습니다." };
  if (pw.length < 8) return { ok: false, message: "새 비밀번호는 8자 이상이어야 합니다." };
  if (pw !== pw2) return { ok: false, message: "새 비밀번호 확인이 일치하지 않습니다." };
  const db = await getDb();
  await db.update(schema.members).set({ passwordHash: await bcrypt.hash(pw, 10), mustChangePw: 0 }).where(eq(schema.members.id, me.id));
  return { ok: true, message: "비밀번호가 변경되었습니다." };
}

export async function withdrawAction(_p: FormState, fd: FormData): Promise<FormState> {
  const me = await currentMember(); if (!me) redirect("/member/login");
  if (me.role === "admin") return { ok: false, message: "관리자 계정은 탈퇴할 수 없습니다." };
  if (!(await bcrypt.compare(s(fd, "password"), me.passwordHash))) return { ok: false, message: "비밀번호가 올바르지 않습니다." };
  const db = await getDb();
  await db.update(schema.members).set({ status: "withdrawn", memo: `탈퇴 ${now()}` }).where(eq(schema.members.id, me.id));
  await destroySession();
  redirect("/?withdrawn=1");
}

/** 아이디 찾기: 이름 + 이메일 */
export async function findIdAction(_p: FormState, fd: FormData): Promise<FormState> {
  const name = s(fd, "name"), email = s(fd, "email").toLowerCase();
  const db = await getDb();
  const m = await db.query.members.findFirst({ where: and(eq(schema.members.name, name), eq(schema.members.email, email), eq(schema.members.status, "active")) });
  if (!m) return { ok: false, message: "일치하는 회원 정보가 없습니다." };
  const masked = m.userId.length <= 3 ? m.userId[0] + "**" : m.userId.slice(0, -2) + "**";
  return { ok: true, message: `회원님의 아이디는 ${masked} 입니다. (가입일 ${m.createdAt.slice(0, 10)})`, extra: { userId: masked } };
}

/** 비밀번호 찾기: 아이디 + 이메일 → 재설정 링크 메일 (메일 미설정 시 화면에 링크 안내) */
export async function findPwAction(_p: FormState, fd: FormData): Promise<FormState> {
  const userId = s(fd, "user_id").toLowerCase(), email = s(fd, "email").toLowerCase();
  const db = await getDb();
  const m = await db.query.members.findFirst({ where: and(eq(schema.members.userId, userId), eq(schema.members.email, email), eq(schema.members.status, "active")) });
  if (!m) return { ok: false, message: "일치하는 회원 정보가 없습니다." };
  const token = crypto.randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000 + 9 * 3600 * 1000).toISOString().slice(0, 19).replace("T", " ");
  await db.insert(schema.passwordResets).values({ token, memberId: m.id, expiresAt: expires });
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl;
  const link = `${base}/member/reset?token=${token}`;
  const sent = await sendMail(email, `[${site.brand.name}] 비밀번호 재설정 안내`, `아래 링크에서 새 비밀번호를 설정해 주세요. (1시간 유효)\n${link}`).catch(() => false);
  if (sent) return { ok: true, message: "비밀번호 재설정 링크를 이메일로 보냈습니다. 메일함을 확인해 주세요." };
  return { ok: true, message: "메일 발송이 설정되어 있지 않아 재설정 링크를 화면에 표시합니다.", extra: { link: `/member/reset?token=${token}` } };
}

export async function resetPwAction(_p: FormState, fd: FormData): Promise<FormState> {
  const token = s(fd, "token"), pw = s(fd, "password"), pw2 = s(fd, "password2");
  if (pw.length < 8) return { ok: false, message: "비밀번호는 8자 이상이어야 합니다." };
  if (pw !== pw2) return { ok: false, message: "비밀번호 확인이 일치하지 않습니다." };
  const db = await getDb();
  const r = await db.query.passwordResets.findFirst({ where: and(eq(schema.passwordResets.token, token), gt(schema.passwordResets.expiresAt, now())) });
  if (!r) return { ok: false, message: "유효하지 않거나 만료된 링크입니다. 다시 요청해 주세요." };
  await db.update(schema.members).set({ passwordHash: await bcrypt.hash(pw, 10), mustChangePw: 0 }).where(eq(schema.members.id, r.memberId));
  await db.delete(schema.passwordResets).where(eq(schema.passwordResets.token, token));
  redirect("/member/login?reset=1");
}
