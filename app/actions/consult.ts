"use server";

/**
 * 상담 신청 접수 (프론트 전용 단계).
 * 지금은 입력값 검증만 하고 서버 로그에 남긴다.
 * TODO(서버 연동): 아래 `// 전송` 자리에서 별도 백엔드 API 로 전달하도록 교체.
 */

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
  const payload = { name, phone, ...fields, message: s("say"), receivedAt: new Date().toISOString() };

  // 전송: 서버 연동 전까지는 로그만 남긴다.
  console.log("[consult]", JSON.stringify(payload));
  return { ok: true };
}
