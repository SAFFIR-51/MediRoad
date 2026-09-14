/**
 * 개원 실적 로고월. 병원을 두 줄로 나눠 서로 반대 방향으로 끊김 없이 흘러가게 한다 (CSS 애니메이션, JS 없음).
 * 각 줄은 같은 목록을 두 번 이어 붙이고 -50% 까지 이동해 이음매 없이 반복된다. 마우스를 올리면 멈춘다.
 * 로고 파일이 있는 병원은 로고를, 없는 병원은 임시로 메디로드 심볼을 보여준다 (lib/clinics.ts 참고).
 */
import type { CSSProperties } from "react";
import type { Clinic } from "@/lib/clinics";

/** 로고 파일이 아직 없는 병원에 임시로 넣는 메디로드 심볼 */
const PLACEHOLDER = "/brand/symbol-mark.png";
/** 타일 한 칸이 지나가는 시간(초). 줄 길이에 비례해 속도를 일정하게 맞춘다 */
const SEC_PER_TILE = 3.2;

function Tile({ c, hidden }: { c: Clinic; hidden?: boolean }) {
  return (
    <li className={c.logo ? "has-logo" : "is-ph"} aria-hidden={hidden || undefined}>
      <div className="mark">
        <img src={c.logo ?? PLACEHOLDER} alt={c.logo && !hidden ? c.name : ""} loading="lazy" />
      </div>
      <em><b>{c.name}</b>{c.dept === "기타" ? c.region : `${c.dept} · ${c.region}`}</em>
    </li>
  );
}

export default function ClinicWall({ items }: { items: Clinic[] }) {
  // 로고가 있는 곳을 앞에 세우고, 번갈아 두 줄에 나눠 담는다 (심볼 타일이 한 줄에 몰리지 않도록)
  const list = [...items.filter((c) => c.logo), ...items.filter((c) => !c.logo)];
  const rows: Clinic[][] = [[], []];
  list.forEach((c, i) => rows[i % 2].push(c));

  return (
    <div className="mr-marquee">
      {rows.map((row, r) => (
        <ul
          key={r}
          className={r === 1 ? "row rev" : "row"}
          style={{ "--dur": `${row.length * SEC_PER_TILE}s` } as CSSProperties}
        >
          {row.map((c) => <Tile c={c} key={c.name} />)}
          {row.map((c) => <Tile c={c} key={`${c.name}-dup`} hidden />)}
        </ul>
      ))}
    </div>
  );
}
