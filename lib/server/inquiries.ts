import "server-only";
import { one, q } from "@/lib/server/db";

/** 상담 문의 저장·조회와 담당자 알림 메일 (RESEND_API_KEY 가 있을 때만 발송, 없으면 서버 로그) */

export type InquiryStatus = "new" | "in_progress" | "done";

const FIELDS = ["name", "phone", "email", "department", "region", "openTiming", "budget", "deposit", "rent", "facilityCost", "area", "facility", "consultType", "message"] as const;

const COLUMN: Record<string, string> = {
  openTiming: "open_timing",
  facilityCost: "facility_cost",
  consultType: "consult_type",
};

const toCol = (f: string) => COLUMN[f] ?? f.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);

const row2obj = (r: Record<string, unknown>) => ({
  id: Number(r.id),
  name: String(r.name ?? ""),
  phone: String(r.phone ?? ""),
  email: String(r.email ?? ""),
  department: String(r.department ?? ""),
  region: String(r.region ?? ""),
  openTiming: String(r.open_timing ?? ""),
  budget: String(r.budget ?? ""),
  deposit: String(r.deposit ?? ""),
  rent: String(r.rent ?? ""),
  facilityCost: String(r.facility_cost ?? ""),
  area: String(r.area ?? ""),
  facility: String(r.facility ?? ""),
  consultType: String(r.consult_type ?? ""),
  message: String(r.message ?? ""),
  status: String(r.status ?? "new") as InquiryStatus,
  memo: String(r.memo ?? ""),
  createdAt: r.created_at ? new Date(r.created_at as string).toISOString() : "",
  updatedAt: r.updated_at ? new Date(r.updated_at as string).toISOString() : "",
});

export function validateInquiry(input: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const str = (k: string) => String(input[k] ?? "").trim();
  if (!str("name")) errors.name = "성함을 입력해 주세요.";
  if (!str("phone")) errors.phone = "연락처를 입력해 주세요.";
  if (!str("email")) errors.email = "이메일을 입력해 주세요.";
  if (!str("department")) errors.department = "진료과목을 입력해 주세요.";
  if (!str("region")) errors.region = "희망 지역을 입력해 주세요.";
  if (!str("openTiming")) errors.openTiming = "개원·개국 예정 시기를 선택해 주세요.";
  if (!str("budget")) errors.budget = "자금 규모를 선택해 주세요.";
  if (!input.agree) errors.agree = "개인정보 수집 및 이용에 동의해 주세요.";
  return errors;
}

export async function createInquiry(input: Record<string, unknown>, ip: string) {
  const cols = FIELDS.map(toCol);
  const params = FIELDS.map((f) => String(input[f] ?? "").trim().slice(0, 2000));
  const row = await one<{ id: number }>(
    `INSERT INTO inquiries (${cols.join(", ")}, ip) VALUES (${FIELDS.map((_, i) => `$${i + 1}`).join(", ")}, $${FIELDS.length + 1}) RETURNING id`,
    [...params, ip],
  );
  await notify(row?.id ?? 0, input);
  return row?.id ?? 0;
}

export async function listInquiries(status?: string) {
  const rows = status
    ? await q<Record<string, unknown>>("SELECT * FROM inquiries WHERE status = $1 ORDER BY created_at DESC, id DESC", [status])
    : await q<Record<string, unknown>>("SELECT * FROM inquiries ORDER BY created_at DESC, id DESC");
  const counts = await one<Record<string, string>>(
    `SELECT COUNT(*) FILTER (WHERE status='new')::text AS new,
            COUNT(*) FILTER (WHERE status='in_progress')::text AS in_progress,
            COUNT(*) FILTER (WHERE status='done')::text AS done FROM inquiries`,
  );
  return {
    items: rows.map(row2obj),
    counts: { new: Number(counts?.new ?? 0), in_progress: Number(counts?.in_progress ?? 0), done: Number(counts?.done ?? 0) },
  };
}

export async function getInquiry(id: number) {
  const row = await one<Record<string, unknown>>("SELECT * FROM inquiries WHERE id = $1", [id]);
  return row ? row2obj(row) : null;
}

export async function updateInquiry(id: number, status: string, memo: string) {
  const next = ["new", "in_progress", "done"].includes(status) ? status : "new";
  await q("UPDATE inquiries SET status = $2, memo = $3, updated_at = now() WHERE id = $1", [id, next, memo.slice(0, 3000)]);
}

/** 담당자 알림 메일 (RESEND_API_KEY · NOTIFY_EMAIL 이 있을 때만 발송) */
async function notify(id: number, input: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const text = `새 상담 문의 #${id}\n\n성함: ${input.name}\n연락처: ${input.phone}\n이메일: ${input.email}\n진료과목: ${input.department}\n희망 지역: ${input.region}\n예정 시기: ${input.openTiming}\n자금 규모: ${input.budget}\n상담유형: ${input.consultType}\n문의내용: ${input.message || "(없음)"}`;
  if (!key || !to) {
    console.log("[inquiry]", text.replace(/\n/g, " | "));
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM || "MediRoad <onboarding@resend.dev>", to: [to], subject: `[메디로드] 새 상담 문의 #${id}`, text }),
    });
  } catch (e) {
    console.error("[inquiry mail]", e);
  }
}

/** 비밀번호 재설정 메일 */
export async function sendResetMail(email: string, name: string, url: string) {
  const key = process.env.RESEND_API_KEY;
  const text = `${name}님, 안녕하세요.\n\n메디로드 비밀번호 재설정 요청을 받았습니다.\n아래 링크에서 1시간 안에 새 비밀번호를 설정해 주세요.\n\n${url}\n\n본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.\n\n메디로드`;
  if (!key) {
    console.log("[reset]", email, url);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM || "MediRoad <onboarding@resend.dev>", to: [email], subject: "[메디로드] 비밀번호 재설정 안내", text }),
    });
  } catch (e) {
    console.error("[reset mail]", e);
  }
}
