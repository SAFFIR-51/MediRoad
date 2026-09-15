/**
 * 입지 분석 보드 — 페이지 메인 비주얼에 들어가는 "분석 리포트 화면" 예시.
 * 사진 대신 반경·인구·유동인구·경쟁 분포·처방 동선 같은 입지 분석 자료를 SVG 로 그린다.
 * 모든 수치는 예시이며, 화면 아래에 "예시 화면" 캡션을 항상 붙인다 (실제 분석으로 오해하지 않도록).
 * 난수는 고정 시드라 빌드(서버)와 브라우저 렌더링 결과가 같다 (하이드레이션 불일치 없음).
 */
import type { ReactNode } from "react";
import type { Visual } from "@/lib/site";

type Kind = Exclude<Visual, "">;
type Board = { title: string; tag: string; svg: ReactNode; stats: [string, string][] };

const C = {
  faint: "rgba(255,255,255,0.05)",
  line: "rgba(255,255,255,0.12)",
  dim: "rgba(255,255,255,0.45)",
  sky: "#78C8F0",
  blue: "#0878C0",
  warm: "#F2B35B",
  white: "#FFFFFF",
  ink: "#0B2545",
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

/** 지도 바탕: 블록 · 도로 · 하천 */
function MapBase({ seed }: { seed: number }) {
  const rand = rng(seed);
  const blocks: ReactNode[] = [];
  for (let y = 6; y < 300; y += 36) {
    for (let x = 6; x < 520; x += 44) {
      if (rand() < 0.22) continue;
      blocks.push(<rect key={`${x}-${y}`} x={x} y={y} width={30 + Math.floor(rand() * 8)} height={22 + Math.floor(rand() * 8)} rx={2} fill={C.faint} />);
    }
  }
  return (
    <g>
      {blocks}
      <path d="M-10 262 C 90 238 170 300 300 290 S 470 250 530 272" stroke="#1d5a8c" strokeOpacity={0.55} strokeWidth={16} fill="none" />
      <path d="M-10 146 C 130 132 300 172 530 150" stroke="rgba(255,255,255,0.16)" strokeWidth={9} fill="none" />
      <path d="M248 -10 C 256 90 244 200 268 310" stroke="rgba(255,255,255,0.14)" strokeWidth={7} fill="none" />
      <path d="M40 310 L 430 -10" stroke="rgba(255,255,255,0.08)" strokeWidth={5} fill="none" />
      <path d="M-10 60 L 530 84" stroke="rgba(255,255,255,0.06)" strokeWidth={4} fill="none" />
    </g>
  );
}

function catchment(): Board {
  const rand = rng(7);
  const cx = 260, cy = 148;
  const dots = Array.from({ length: 130 }, () => {
    const a = rand() * Math.PI * 2;
    const d = 150 * Math.pow(rand(), 0.8);
    return { x: r1(cx + Math.cos(a) * d * 1.3), y: r1(cy + Math.sin(a) * d * 0.92), o: r1(0.25 + rand() * 0.6) };
  });
  const rings = [46, 88, 136];
  const labels = ["300m", "500m", "1km"];
  const rivals: [number, number][] = [[196, 104], [334, 118], [302, 214], [148, 196], [380, 64]];
  return {
    title: "반경 분석",
    tag: "CATCHMENT",
    stats: [["반경 500m 배후 세대", "12,480세대"], ["30~40대 비중", "34.2%"], ["동일 진료과 의원", "3곳"]],
    svg: (
      <>
        <MapBase seed={3} />
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={1.8} fill={C.sky} fillOpacity={d.o} />)}
        {rings.map((r, i) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill={i === 0 ? "rgba(120,200,240,0.12)" : "none"} stroke={C.sky} strokeOpacity={0.85 - i * 0.2} strokeDasharray="4 5" />
        ))}
        {rings.map((r, i) => (
          <text key={labels[i]} className="t-xs" x={r1(cx + r * 0.72 + 6)} y={r1(cy - r * 0.72)}>{labels[i]}</text>
        ))}
        {rivals.map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x - 5} ${y - 5})`}>
            <rect width={10} height={10} rx={2} fill={C.warm} />
            <path d="M5 2.4v5.2M2.4 5h5.2" stroke={C.ink} strokeWidth={1.6} />
          </g>
        ))}
        <circle className="ab-pulse" cx={cx} cy={cy} r={14} fill="none" stroke={C.white} strokeOpacity={0.7} />
        <circle cx={cx} cy={cy} r={6} fill={C.white} />
        <g transform="translate(14 242)">
          <rect width={206} height={46} rx={6} fill="rgba(5,18,36,0.8)" />
          <circle cx={14} cy={16} r={3} fill={C.sky} />
          <text className="t-xs" x={24} y={20}>배후 세대</text>
          <rect x={96} y={11} width={9} height={9} rx={2} fill={C.warm} />
          <text className="t-xs" x={111} y={20}>경쟁 의원</text>
          <circle cx={14} cy={33} r={4} fill={C.white} />
          <text className="t-xs" x={24} y={37}>후보지</text>
          <line x1={90} y1={33} x2={106} y2={33} stroke={C.sky} strokeDasharray="3 3" />
          <text className="t-xs" x={111} y={37}>도보 반경</text>
        </g>
      </>
    ),
  };
}

function population(): Board {
  const ages = ["70세+", "60대", "50대", "40대", "30대", "20대", "10대", "10세 미만"];
  const male = [3.9, 5.6, 7.4, 8.7, 9.2, 6.8, 4.6, 4.1];
  const female = [5.2, 6.1, 7.6, 8.9, 9.6, 7.1, 4.4, 3.9];
  const top = 30, step = 32, h = 22, s = 19;
  return {
    title: "연령 구조",
    tag: "POPULATION",
    stats: [["평균 연령", "39.8세"], ["30~40대 비중", "36.1%"], ["1인 가구", "31.4%"]],
    svg: (
      <>
        <rect x={8} y={top + step * 3 - 5} width={504} height={step * 2} rx={6} fill="rgba(120,200,240,0.08)" />
        <text className="t-xs dim" x={225} y={18} textAnchor="end">남성</text>
        <text className="t-xs dim" x={295} y={18}>여성</text>
        <text className="t-xs sky" x={510} y={top + step * 3 + 4} textAnchor="end">핵심 수요층</text>
        {ages.map((a, i) => {
          const y = top + i * step;
          const hot = i === 3 || i === 4;
          const wm = r1(male[i] * s), wf = r1(female[i] * s);
          return (
            <g key={a}>
              <rect x={r1(225 - wm)} y={y} width={wm} height={h} rx={3} fill={C.blue} fillOpacity={hot ? 1 : 0.55} />
              <rect x={295} y={y} width={wf} height={h} rx={3} fill={C.sky} fillOpacity={hot ? 1 : 0.55} />
              <text className="t-xs" x={260} y={y + 15} textAnchor="middle">{a}</text>
              <text className="t-xs dim" x={r1(225 - wm - 6)} y={y + 15} textAnchor="end">{male[i]}%</text>
              <text className="t-xs dim" x={r1(295 + wf + 6)} y={y + 15}>{female[i]}%</text>
            </g>
          );
        })}
      </>
    ),
  };
}

function flow(): Board {
  const wd = [3, 2, 2, 2, 3, 6, 11, 17, 19, 14, 12, 13, 15, 13, 12, 13, 15, 18, 21, 20, 15, 10, 7, 5];
  const we = [4, 3, 2, 2, 2, 3, 5, 7, 9, 11, 13, 14, 14, 13, 13, 13, 12, 12, 11, 10, 9, 7, 6, 5];
  const x = (i: number) => r1(44 + i * (456 / 23));
  const y = (v: number) => r1(244 - v * 9.5);
  const line = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
  const area = `${line(wd)} L${x(23)} 244 L${x(0)} 244 Z`;
  const peaks: [number, string][] = [[8, "출근 08시"], [18, "퇴근 18시"]];
  return {
    title: "시간대별 유동인구",
    tag: "FLOATING POP.",
    stats: [["평일 최대 시간대", "18~19시"], ["주말 / 평일", "0.72배"], ["역 출구 → 후보지", "도보 4분"]],
    svg: (
      <>
        <defs>
          <linearGradient id="ab-flow-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.sky} stopOpacity={0.45} />
            <stop offset="100%" stopColor={C.sky} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[5, 10, 15, 20].map((v) => <line key={v} x1={44} x2={500} y1={y(v)} y2={y(v)} stroke={C.line} />)}
        <line x1={44} x2={500} y1={244} y2={244} stroke="rgba(255,255,255,0.3)" />
        <path d={area} fill="url(#ab-flow-grad)" />
        <path d={line(wd)} stroke={C.sky} strokeWidth={2.4} fill="none" />
        <path d={line(we)} stroke={C.white} strokeOpacity={0.7} strokeWidth={1.6} strokeDasharray="5 4" fill="none" />
        {wd.map((_, i) => (i % 3 === 0 ? <text key={i} className="t-xs dim" x={x(i)} y={266} textAnchor="middle">{i}시</text> : null))}
        {peaks.map(([i, label]) => (
          <g key={label}>
            <circle cx={x(i)} cy={y(wd[i])} r={4.5} fill={C.white} />
            <rect x={x(i) - 34} y={y(wd[i]) - 32} width={68} height={20} rx={10} fill={C.white} />
            <text className="t-xs ink" x={x(i)} y={y(wd[i]) - 18} textAnchor="middle">{label}</text>
          </g>
        ))}
        <g transform="translate(372 18)">
          <line x1={0} x2={20} y1={0} y2={0} stroke={C.sky} strokeWidth={2.4} />
          <text className="t-xs" x={26} y={4}>평일</text>
          <line x1={64} x2={84} y1={0} y2={0} stroke={C.white} strokeDasharray="5 4" />
          <text className="t-xs" x={90} y={4}>주말</text>
        </g>
      </>
    ),
  };
}

function competition(): Board {
  const depts = [
    { n: "내과", c: 7, col: C.sky },
    { n: "치과", c: 6, col: C.white },
    { n: "피부과", c: 4, col: "#F58FA8" },
    { n: "정형외과", c: 3, col: C.warm },
    { n: "이비인후과", c: 2, col: "#C9A7F5" },
    { n: "소아청소년과", c: 2, col: "#9BE3C3" },
  ];
  const rand = rng(21);
  const pts = depts.flatMap((d) =>
    Array.from({ length: d.c }, () => {
      const a = rand() * Math.PI * 2;
      const r = 104 * Math.sqrt(0.12 + rand() * 0.88);
      return { x: r1(150 + Math.cos(a) * r), y: r1(152 + Math.sin(a) * r), col: d.col };
    }),
  );
  return {
    title: "경쟁 의료기관 분포",
    tag: "COMPETITION",
    stats: [["반경 1km 의원", "24곳"], ["동일 진료과", "3곳"], ["의원 1곳당 인구", "1,870명"]],
    svg: (
      <>
        <circle cx={150} cy={152} r={120} fill="rgba(255,255,255,0.03)" stroke={C.sky} strokeOpacity={0.5} strokeDasharray="4 5" />
        <circle cx={150} cy={152} r={60} fill="none" stroke={C.line} strokeDasharray="2 4" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4.4} fill={p.col} fillOpacity={0.9} />)}
        <path d="M150 140 L162 152 L150 164 L138 152 Z" fill={C.white} />
        <circle className="ab-pulse" cx={150} cy={152} r={16} fill="none" stroke={C.white} strokeOpacity={0.6} />
        <text className="t-xs dim" x={150} y={292} textAnchor="middle">후보지 반경 1km</text>
        <text className="t-sm" x={300} y={34}>진료과별 의원 수</text>
        {depts.map((d, i) => {
          const y = 58 + i * 36;
          const w = d.c * 15;
          return (
            <g key={d.n}>
              <circle cx={306} cy={y + 6} r={4} fill={d.col} />
              <text className="t-xs" x={316} y={y + 10}>{d.n}</text>
              <rect x={392} y={y} width={w} height={12} rx={6} fill={d.col} fillOpacity={0.85} />
              <text className="t-xs dim" x={392 + w + 6} y={y + 10}>{d.c}</text>
            </g>
          );
        })}
      </>
    ),
  };
}

function pharmacy(): Board {
  const blds = [
    { x: 96, y: 58, label: "메디컬빌딩 · 의원 7" },
    { x: 322, y: 40, label: "의원 4" },
    { x: 398, y: 172, label: "의원 3" },
  ];
  const cands = [
    { k: "A", x: 236, y: 146, main: true },
    { k: "B", x: 306, y: 236, main: false },
    { k: "C", x: 140, y: 224, main: false },
  ];
  const flows: [number, number, number][] = [[0, 0, 5], [1, 0, 3.6], [2, 0, 2.6], [2, 1, 3], [1, 1, 1.6], [0, 2, 1.8]];
  return {
    title: "처방 동선 분석",
    tag: "PRESCRIPTION FLOW",
    stats: [["인근 의원", "14곳"], ["A 후보지 → 의원", "도보 1분"], ["처방 흐름 우선순위", "A > B > C"]],
    svg: (
      <>
        <defs>
          <marker id="ab-arrow-rx" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={C.sky} />
          </marker>
        </defs>
        <MapBase seed={11} />
        {flows.map(([b, c, w]) => {
          const s = blds[b], e = cands[c];
          const sx = s.x + 27, sy = s.y + 20;
          const mx = r1((sx + e.x) / 2 + (e.y - sy) * 0.18), my = r1((sy + e.y) / 2 - (e.x - sx) * 0.18);
          return <path key={`${b}-${c}`} d={`M${sx} ${sy} Q${mx} ${my} ${e.x} ${e.y}`} stroke={C.sky} strokeOpacity={0.35 + w / 10} strokeWidth={w} fill="none" markerEnd="url(#ab-arrow-rx)" />;
        })}
        {blds.map((b) => (
          <g key={b.label}>
            <rect x={b.x} y={b.y} width={54} height={40} rx={4} fill="rgba(11,37,69,0.9)" stroke="rgba(255,255,255,0.4)" />
            <path d={`M${b.x + 27} ${b.y + 11}v18M${b.x + 18} ${b.y + 20}h18`} stroke={C.sky} strokeWidth={3} />
            <text className="t-xs" x={b.x + 27} y={b.y + 56} textAnchor="middle">{b.label}</text>
          </g>
        ))}
        {cands.map((c) => (
          <g key={c.k}>
            {c.main ? <circle className="ab-pulse" cx={c.x} cy={c.y} r={20} fill="none" stroke={C.white} strokeOpacity={0.6} /> : null}
            <circle cx={c.x} cy={c.y} r={12} fill={c.main ? C.white : "rgba(255,255,255,0.25)"} stroke={C.white} />
            <text className={`t-sm ${c.main ? "ink" : ""}`} x={c.x} y={c.y + 4.5} textAnchor="middle">{c.k}</text>
          </g>
        ))}
      </>
    ),
  };
}

function transfer(): Board {
  const rev = [62, 58, 64, 66, 61, 70, 72, 68, 74, 77, 73, 79];
  const non = [26, 27, 27, 28, 29, 29, 30, 31, 31, 32, 32, 33];
  const bx = (i: number) => r1(40 + i * 24.5);
  const by = (v: number) => r1(244 - v * 2.3);
  const ly = (p: number) => r1(236 - (p - 20) * 11);
  const circ = r1(2 * Math.PI * 46);
  return {
    title: "운영 지표 분석",
    tag: "PERFORMANCE",
    stats: [["최근 12개월 매출 추이", "+6.4%"], ["비급여 비중", "32%"], ["잔여 임대기간", "40개월"]],
    svg: (
      <>
        {[100, 170].map((v) => <line key={v} x1={36} x2={330} y1={v} y2={v} stroke={C.line} />)}
        <line x1={36} x2={330} y1={244} y2={244} stroke="rgba(255,255,255,0.3)" />
        {rev.map((v, i) => <rect key={i} x={bx(i)} y={by(v)} width={16} height={r1(244 - by(v))} rx={2} fill={C.sky} fillOpacity={i === 11 ? 1 : 0.38} />)}
        <path d={non.map((p, i) => `${i ? "L" : "M"}${bx(i) + 8} ${ly(p)}`).join(" ")} stroke={C.warm} strokeWidth={2} fill="none" />
        {non.map((p, i) => <circle key={i} cx={bx(i) + 8} cy={ly(p)} r={2.6} fill={C.warm} />)}
        {rev.map((_, i) => (i % 2 === 0 ? <text key={i} className="t-xs dim" x={bx(i) + 8} y={264} textAnchor="middle">{i + 1}월</text> : null))}
        <g transform="translate(40 20)">
          <rect width={12} height={10} rx={2} fill={C.sky} />
          <text className="t-xs" x={18} y={9}>월 매출</text>
          <line x1={78} x2={96} y1={5} y2={5} stroke={C.warm} strokeWidth={2} />
          <text className="t-xs" x={102} y={9}>비급여 비중</text>
        </g>
        <circle cx={432} cy={96} r={46} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={16} />
        <circle cx={432} cy={96} r={46} fill="none" stroke={C.warm} strokeWidth={16} strokeDasharray={`${r1(circ * 0.32)} ${circ}`} transform="rotate(-90 432 96)" />
        <text className="t-lg" x={432} y={100} textAnchor="middle">32%</text>
        <text className="t-xs dim" x={432} y={116} textAnchor="middle">비급여</text>
        <text className="t-xs" x={362} y={196}>잔여 임대기간</text>
        <rect x={362} y={206} width={140} height={8} rx={4} fill="rgba(255,255,255,0.12)" />
        <rect x={362} y={206} width={93} height={8} rx={4} fill={C.sky} />
        <text className="t-xs dim" x={502} y={232} textAnchor="end">40개월 / 계약 60개월</text>
      </>
    ),
  };
}

function licensing(): Board {
  const steps: [string, string, "done" | "doing" | "todo" | "option"][] = [
    ["사업자등록", "관할 세무서", "done"],
    ["의료기관 개설신고 · 허가", "관할 보건소 · 시도", "done"],
    ["진단용 방사선 발생장치 신고", "관할 보건소", "doing"],
    ["요양기관 현황신고", "건강보험심사평가원", "todo"],
    ["외국인환자 유치의료기관 등록", "한국보건산업진흥원", "option"],
    ["의료기관 인증", "의료기관평가인증원", "option"],
  ];
  const chip = { done: ["완료", C.sky, C.ink], doing: ["진행 중", C.white, C.ink], todo: ["예정", "rgba(255,255,255,0.14)", C.white], option: ["선택", "rgba(242,179,91,0.2)", C.warm] } as const;
  return {
    title: "인허가 진행 현황",
    tag: "LICENSING",
    stats: [["진행 단계", "3 / 6"], ["서류 작성 · 제출", "전문 행정사"], ["요건 점검 · 일정", "메디로드"]],
    svg: (
      <>
        <line x1={30} x2={30} y1={30} y2={250} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <line x1={30} x2={30} y1={30} y2={118} stroke={C.sky} strokeWidth={2} />
        {steps.map(([t, org, st], i) => {
          const y = 30 + i * 44;
          const [label, bg, fg] = chip[st];
          return (
            <g key={t}>
              {st === "doing" ? <circle className="ab-pulse" cx={30} cy={y} r={14} fill="none" stroke={C.white} strokeOpacity={0.6} /> : null}
              <circle cx={30} cy={y} r={8} fill={st === "done" ? C.sky : st === "doing" ? C.white : C.ink} stroke={st === "option" ? C.warm : st === "todo" ? "rgba(255,255,255,0.6)" : "none"} strokeDasharray={st === "option" ? "2 2" : undefined} />
              {st === "done" ? <path d={`M26 ${y}l3 3 5-6`} stroke={C.ink} strokeWidth={2} fill="none" /> : null}
              <text className="t-sm" x={54} y={y + 1}>{t}</text>
              <text className="t-xs dim" x={54} y={y + 17}>{org}</text>
              <rect x={440} y={y - 11} width={66} height={22} rx={11} fill={bg} />
              <text className="t-xs" x={473} y={y + 4} textAnchor="middle" style={{ fill: fg }}>{label}</text>
            </g>
          );
        })}
      </>
    ),
  };
}

function marketing(): Board {
  const funnel: [string, number][] = [["검색 · 지도 노출", 100], ["플레이스 방문", 38], ["전화 · 예약", 12], ["첫 내원", 9]];
  const kw: [string, number][] = [["지역명 + 진료과", 42], ["지역명 + 증상", 27], ["진료과 + 야간·주말", 18], ["병원 이름", 13]];
  return {
    title: "환자 유입 분석",
    tag: "PATIENT FUNNEL",
    stats: [["신환 유입 1위 채널", "지도 검색"], ["예약 전환", "12%"], ["재방문율", "46%"]],
    svg: (
      <>
        {funnel.map(([t, p], i) => {
          const w = r1(70 + 160 * Math.sqrt(p / 100));
          const y = 28 + i * 58;
          return (
            <g key={t}>
              <rect x={r1(140 - w / 2)} y={y} width={w} height={44} rx={8} fill={C.sky} fillOpacity={0.9 - i * 0.2} />
              <text className="t-xs ink" x={140} y={y + 19} textAnchor="middle">{t}</text>
              <text className="t-md ink" x={140} y={y + 36} textAnchor="middle">{p}%</text>
            </g>
          );
        })}
        <line x1={272} x2={272} y1={24} y2={270} stroke={C.line} />
        <text className="t-sm" x={292} y={34}>유입 검색어 비중</text>
        {kw.map(([t, p], i) => {
          const y = 66 + i * 50;
          return (
            <g key={t}>
              <text className="t-xs" x={292} y={y}>{t}</text>
              <text className="t-xs dim" x={508} y={y} textAnchor="end">{p}%</text>
              <rect x={292} y={y + 9} width={216} height={10} rx={5} fill="rgba(255,255,255,0.1)" />
              <rect x={292} y={y + 9} width={r1((p / 42) * 216)} height={10} rx={5} fill={i === 0 ? C.warm : C.sky} fillOpacity={i === 0 ? 1 : 0.7} />
            </g>
          );
        })}
      </>
    ),
  };
}

function closure(): Board {
  const xs = (d: number) => r1(168 + (d + 60) * (336 / 90));
  const ticks: [number, string][] = [[-60, "D-60"], [-45, "D-45"], [-30, "D-30"], [-14, "D-14"], [0, "D-day"], [30, "D+30"]];
  const tasks: [string, number, number, boolean][] = [
    ["양도 전환 검토", -60, -40, false],
    ["장비 · 인테리어 매각", -45, -10, false],
    ["임대차 종료 협의", -50, -5, false],
    ["환자 안내 게시", -14, 0, true],
    ["폐업 신고 · 기록 이관", -7, 2, false],
    ["세무 · 노무 정리", -3, 30, false],
  ];
  return {
    title: "폐업 정리 일정",
    tag: "CLOSING SCHEDULE",
    stats: [["환자 안내", "폐업 14일 전"], ["진료기록", "이관 또는 보관"], ["전체 기간", "약 2~3개월"]],
    svg: (
      <>
        {ticks.map(([d, t]) => (
          <g key={t}>
            <line x1={xs(d)} x2={xs(d)} y1={36} y2={270} stroke={d === 0 ? "rgba(255,255,255,0.5)" : C.line} strokeDasharray={d === -14 ? "4 4" : undefined} />
            <text className="t-xs dim" x={xs(d)} y={26} textAnchor="middle">{t}</text>
          </g>
        ))}
        {tasks.map(([t, s, e, hot], i) => {
          const y = 52 + i * 38;
          return (
            <g key={t}>
              <text className="t-xs" x={10} y={y + 11}>{t}</text>
              <rect x={xs(s)} y={y} width={r1(xs(e) - xs(s))} height={15} rx={7.5} fill={hot ? C.warm : C.sky} fillOpacity={hot ? 1 : 0.75} />
            </g>
          );
        })}
      </>
    ),
  };
}

function report(): Board {
  const labels = ["배후 수요", "접근성", "경쟁 여유", "임대 조건", "성장성"];
  const A = [0.86, 0.78, 0.64, 0.7, 0.82];
  const B = [0.7, 0.9, 0.46, 0.82, 0.6];
  const cx = 128, cy = 146, R = 88;
  const pt = (i: number, v: number) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    return [r1(cx + Math.cos(a) * R * v), r1(cy + Math.sin(a) * R * v)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const sections = ["상권 개요", "인구 · 세대 분석", "유동인구 · 동선", "경쟁 의료기관", "임대 조건 비교", "종합 의견"];
  return {
    title: "입지 분석 리포트",
    tag: "SITE REPORT",
    stats: [["비교 후보지", "최대 3곳"], ["분석 항목", "인구·동선·경쟁·임대"], ["결과물", "후보지 비교 리포트"]],
    svg: (
      <>
        {[0.25, 0.5, 0.75, 1].map((g) => <polygon key={g} points={poly([g, g, g, g, g])} fill="none" stroke={C.line} />)}
        {labels.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} />;
        })}
        <polygon points={poly(A)} fill={C.sky} fillOpacity={0.28} stroke={C.sky} strokeWidth={2} />
        <polygon points={poly(B)} fill="none" stroke={C.white} strokeOpacity={0.75} strokeDasharray="4 3" />
        {labels.map((l, i) => {
          const [x, y] = pt(i, 1.24);
          return <text key={l} className="t-xs" x={x} y={r1(y + 4)} textAnchor="middle">{l}</text>;
        })}
        <g transform="translate(64 276)">
          <rect width={12} height={4} y={-4} fill={C.sky} />
          <text className="t-xs" x={18} y={0}>후보지 A</text>
          <line x1={78} x2={92} y1={-2} y2={-2} stroke={C.white} strokeDasharray="4 3" />
          <text className="t-xs" x={98} y={0}>후보지 B</text>
        </g>
        <text className="t-sm" x={284} y={34}>리포트 구성</text>
        {sections.map((s, i) => {
          const y = 66 + i * 36;
          return (
            <g key={s}>
              <text className="t-xs sky" x={284} y={y}>{String(i + 1).padStart(2, "0")}</text>
              <text className="t-sm" x={310} y={y}>{s}</text>
              <line x1={284} x2={508} y1={y + 12} y2={y + 12} stroke={C.line} />
            </g>
          );
        })}
      </>
    ),
  };
}

function map(): Board {
  return {
    title: "오시는 길",
    tag: "LOCATION",
    stats: [["주소", "마곡중앙6로 42"], ["건물", "사이언스타 11층"], ["방문 상담", "사전 예약"]],
    svg: (
      <>
        <MapBase seed={5} />
        <path d="M338 108 C 300 130 270 150 238 176" stroke={C.white} strokeOpacity={0.8} strokeWidth={2} strokeDasharray="3 5" fill="none" />
        <circle cx={340} cy={106} r={11} fill={C.white} stroke={C.blue} strokeWidth={4} />
        <rect x={358} y={92} width={92} height={26} rx={13} fill="rgba(5,18,36,0.85)" />
        <text className="t-sm" x={404} y={110} textAnchor="middle">마곡나루역</text>
        <circle className="ab-pulse" cx={232} cy={186} r={18} fill="none" stroke={C.sky} strokeOpacity={0.8} />
        <path d="M232 204 C 222 190 214 182 214 172 A18 18 0 1 1 250 172 C 250 182 242 190 232 204 Z" fill={C.sky} />
        <circle cx={232} cy={172} r={6} fill={C.ink} />
        <rect x={120} y={212} width={224} height={30} rx={15} fill={C.white} />
        <text className="t-sm ink" x={232} y={232} textAnchor="middle">메디로드 · 사이언스타 11층</text>
      </>
    ),
  };
}

const BOARDS: Record<Kind, () => Board> = { catchment, population, flow, competition, pharmacy, transfer, licensing, marketing, closure, report, map };

export default function AnalysisBoard({ kind, compact = false, className = "" }: { kind?: Visual; compact?: boolean; className?: string }) {
  if (!kind || !(kind in BOARDS)) return null;
  const b = BOARDS[kind as Kind]();
  return (
    <figure className={`ab ab-${kind}${compact ? " sm" : ""}${className ? ` ${className}` : ""}`}>
      <div className="ab-head">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <b>{b.title}</b>
        <em>{b.tag}</em>
      </div>
      <div className="ab-body">
        <svg viewBox="0 0 520 300" role="img" aria-label={`${b.title} 예시 화면`}>{b.svg}</svg>
      </div>
      {!compact && (
        <ul className="ab-stats">
          {b.stats.map(([k, v]) => <li key={k}><em>{k}</em><b>{v}</b></li>)}
        </ul>
      )}
      <figcaption>예시 화면 · 실제 분석은 상담 후 후보지별로 제공합니다</figcaption>
    </figure>
  );
}
