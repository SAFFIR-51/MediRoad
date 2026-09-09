"use server";

/** 상담 신청 접수: DB 저장 + (설정 시) 메일 발송 */
import { getDb, schema, now, getSetting } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { site } from "@/lib/site";

export type ConsultState = { ok: boolean; message?: string } | null;

const EXTRA = ["이메일", "진료과목", "희망 개원 지역", "개원 예정 시기", "자금 규모", "보증금", "임대료", "시설비", "예상 연면적", "시설유무", "상담유형"];

export async function submitConsult(_prev: ConsultState, formData: FormData): Promise<ConsultState> {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  if (s("website")) return { ok: true }; // honeypot
  const name = s("name"), phone = s("phone"), email = s("이메일");
  if (!name) return { ok: false, message: "성함을 입력해 주세요." };
  if (!phone) return { ok: false, message: "연락처를 입력해 주세요." };
  if (!email) return { ok: false, message: "이메일을 입력해 주세요." };
  if (!s("진료과목")) return { ok: false, message: "진료과목을 입력해 주세요." };
  if (!s("희망 개원 지역")) return { ok: false, message: "희망 개원 지역을 입력해 주세요." };
  if (!s("개원 예정 시기")) return { ok: false, message: "개원 예정 시기를 선택해 주세요." };
  if (!s("자금 규모")) return { ok: false, message: "자금 규모를 선택해 주세요." };
  if (!formData.get("agree")) return { ok: false, message: "개인정보 수집 및 이용에 동의해 주세요." };

  const fields: Record<string, string> = {};
  for (const k of EXTRA) { const v = s(k); if (v) fields[k] = v; }
  const message = s("say");
  const listingCode = s("listing");

  const db = await getDb();
  await db.insert(schema.inquiries).values({ name, phone, email, fields: JSON.stringify(fields), message, listingCode: listingCode || null, status: "new", createdAt: now() });

  const to = (await getSetting("mail_to", "")) || process.env.MAIL_TO || "";
  if (to) {
    const lines = [`[${site.brand.name}] 상담 신청`, "", `성함: ${name}`, `연락처: ${phone}`, ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`), listingCode ? `매물: ${listingCode}` : "", "", "추가 요청사항:", message || "-", "", `접수 시각: ${now()}`];
    await sendMail(to, `[${site.brand.name}] 상담 신청 - ${name}`, lines.join("\n")).catch(() => {});
  }
  return { ok: true };
}
