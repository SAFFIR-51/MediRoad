/**
 * 개원 실적 병·의원 목록 (content/content.json portfolio.groups)
 *
 * 로고 이미지: `public/brand/clients/` 에 **병원명과 똑같은 파일명**으로 넣으면 자동으로 표시된다.
 *   예) public/brand/clients/마곡 삼성키즈소아과의원.png  (png · jpg · jpeg · svg · webp)
 * 파일이 없는 병원은 병원명을 그대로 세운 워드마크 타일로 표시된다.
 * 실제 로고는 각 병·의원의 상표이므로 게시 전 원장님 사용 동의를 받아야 한다.
 */
import fs from "node:fs";
import path from "node:path";
import { content } from "@/lib/site";

export type Clinic = { name: string; region: string; area: string; dept: string; logo: string | null };

/** 병원명에서 진료과목을 뽑는다. 긴 이름부터 검사해 "교정치과"가 "치과"로 잡히지 않게 한다. */
const DEPTS = [
  "심장혈관흉부외과", "소아청소년과", "산부인과", "이비인후과", "재활의학과", "통증의학과",
  "신경외과", "정형외과", "비뇨기과", "교정치과", "신경과", "소아과", "피부과", "내과", "안과", "치과", "외과",
];
const ALIAS: Record<string, string> = { 소아과: "소아청소년과" };

export function deptOf(name: string): string {
  for (const d of DEPTS) if (name.includes(d)) return ALIAS[d] ?? d;
  return "기타";
}

const CLIENT_DIR = path.join(process.cwd(), "public", "brand", "clients");
const EXT = [".png", ".jpg", ".jpeg", ".svg", ".webp"];

/** 로고 파일 목록을 빌드 시점에 한 번 읽어 "병원명 → 경로" 로 만든다 */
function logoMap(): Map<string, string> {
  const m = new Map<string, string>();
  let files: string[] = [];
  try { files = fs.readdirSync(CLIENT_DIR); } catch { return m; }
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!EXT.includes(ext)) continue;
    m.set(path.basename(f, ext).normalize("NFC").trim(), `/brand/clients/${encodeURIComponent(f)}`);
  }
  return m;
}

export function clinics(): Clinic[] {
  const logos = logoMap();
  return content.portfolio.groups.flatMap((g) =>
    g.items.map((name) => ({
      name,
      region: g.region,
      area: g.region.split(" ")[0],
      dept: deptOf(name),
      logo: logos.get(name.normalize("NFC").trim()) ?? null,
    })),
  );
}

/** 실적 요약 숫자 */
export function clinicStats(list: Clinic[]) {
  return {
    total: list.length,
    depts: new Set(list.map((c) => c.dept).filter((d) => d !== "기타")).size,
    areas: new Set(list.map((c) => c.area)).size,
    regions: content.portfolio.groups.length,
  };
}
