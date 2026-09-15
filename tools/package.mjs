#!/usr/bin/env node
/**
 * 카페24 업로드 패키지 조립
 *
 *   npm run package      (= next build && node tools/package.mjs)
 *
 * 1) content/listings.json 예시 매물 → server/install/seed-listings.json (사양의 숫자 필드로 변환)
 * 2) out/(next build 정적 결과) + server/(router·API·설치) → dist/cafe24/
 *    - config.php, app/storage 의 로그·세션, 업로드 사진은 넣지 않는다 (차단용 .htaccess 와 빈 폴더만)
 *    - 로컬 docker 테스트 데이터를 지우지 않도록 dist/cafe24 의 uploads/listings 와 app/storage 는 남겨 둔다
 * 3) dist/mediroad-cafe24-YYYYMMDD.zip
 *
 * 옵션: --no-out (out/ 없이 server 만 조립, PHP 단독 테스트용)  --no-zip
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const SERVER = path.join(ROOT, "server");
const DIST = path.join(ROOT, "dist");
const TARGET = path.join(DIST, "cafe24");
const args = new Set(process.argv.slice(2));

/* ------------------------------------------------------------------ */
/* 1) 예시 매물 변환                                                     */
/* ------------------------------------------------------------------ */

/** "2억원" · "1억 2,000만원" · "월 약 180만원" · "매매가 85억원" → 만원 단위 정수 (없으면 null) */
export function toManwon(text) {
  if (text == null) return null;
  const s = String(text).replace(/,/g, "");
  const eok = s.match(/(\d+(?:\.\d+)?)\s*억/);
  const man = s.match(/(\d+)\s*만/);
  if (!eok && !man) return null;
  return Math.round((eok ? parseFloat(eok[1]) * 10000 : 0) + (man ? parseInt(man[1], 10) : 0));
}

/** "전용 148㎡ (45평)" · "연면적 2,149㎡ (650평)" → 148 · 2149 */
export function toAreaM2(text) {
  const m = String(text ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*㎡/);
  return m ? parseFloat(m[1]) : null;
}

/** "3층 / 10층" → {3, 10} · "2~3층 / 8층" → {"2~3", 8} · "지하 1층 ~ 지상 7층" → {"B1~7", 7} */
export function toFloor(text) {
  const s = String(text ?? "").trim();
  const conv = (t) => t.replace(/지하\s*(\d+)\s*층?/g, "B$1").replace(/지상\s*/g, "").replace(/층/g, "").replace(/\s+/g, "");
  if (s.includes("/")) {
    const [a, b] = s.split("/");
    const total = (b.match(/\d+/) || [])[0];
    return { floorCurrent: conv(a), floorTotal: total ? parseInt(total, 10) : null };
  }
  const nums = s.match(/\d+/g) || [];
  return { floorCurrent: conv(s), floorTotal: nums.length ? parseInt(nums[nums.length - 1], 10) : null };
}

/** "2012.05.20" → "2012-05-20" · "2026.10 예정" → "2026-10-01" (+ 메모) */
export function toDate(text) {
  const s = String(text ?? "");
  const m = s.match(/(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?/);
  if (!m) return { date: null, note: s ? `사용승인일 원문: ${s}` : "" };
  const date = `${m[1]}-${m[2].padStart(2, "0")}-${(m[3] || "1").padStart(2, "0")}`;
  const exact = !!m[3] && !/예정/.test(s);
  return { date, note: exact ? "" : `사용승인일 원문: ${s}` };
}

export function convertListing(it) {
  const notes = [];
  const dep = String(it.deposit ?? "");
  const rentText = String(it.rent ?? "");
  let price;
  if (it.type === "sale") {
    if (/매매가/.test(dep)) {
      price = { dealType: "매매", depositManwon: null, rentManwon: null, salePriceManwon: toManwon(dep), priceNote: "" };
    } else {
      // 원본에 매매가가 없는 병원 양수도 예시: 보증금 값을 매매가 칸에 임시로 넣고 원문을 price_note 에 남긴다
      price = {
        dealType: "매매",
        depositManwon: toManwon(dep),
        rentManwon: toManwon(rentText),
        salePriceManwon: toManwon(dep),
        priceNote: `예시 매물 변환: 원문 보증금 ${dep} / ${rentText}`.slice(0, 100),
      };
    }
  } else if (/분양가/.test(dep)) {
    price = { dealType: "분양", depositManwon: null, rentManwon: null, salePriceManwon: toManwon(dep), priceNote: "" };
  } else {
    price = { dealType: "임대", depositManwon: toManwon(dep), rentManwon: toManwon(rentText), salePriceManwon: null, priceNote: "" };
  }

  const floor = toFloor(it.floor);
  const approval = toDate(it.approvalDate);
  if (approval.note) notes.push(approval.note);
  let maintenance = toManwon(it.maintenance);
  if (maintenance == null) {
    maintenance = 0;
    if (it.maintenance) notes.push(`관리비 원문: ${it.maintenance}`);
  }
  const parkingMatch = String(it.parking ?? "").match(/(\d+)\s*대/);

  let description = String(it.description ?? "");
  if (notes.length) description += `\n\n※ 예시 매물 변환 메모: ${notes.join(" / ")}`;

  return {
    code: it.id,
    date: it.date,
    ...price,
    category: it.category,
    title: it.title,
    region: it.region,
    address: it.address,
    areaM2: toAreaM2(it.area),
    floorCurrent: floor.floorCurrent,
    floorTotal: floor.floorTotal,
    useType: it.use,
    approvalDate: approval.date,
    direction: it.direction,
    parking: parkingMatch ? parseInt(parkingMatch[1], 10) : 0,
    maintenanceManwon: maintenance,
    moveIn: it.moveIn,
    violation: !!it.violation,
    features: Array.isArray(it.features) ? it.features.map(String) : [],
    description,
    images: Array.isArray(it.images) ? it.images.map(String) : [],
    lat: typeof it.lat === "number" ? it.lat : null,
    lng: typeof it.lng === "number" ? it.lng : null,
    status: "open",
  };
}

function buildSeed() {
  const src = path.join(ROOT, "content", "listings.json");
  if (!fs.existsSync(src)) {
    console.warn("! content/listings.json 이 없어 예시 매물 시드를 만들지 않았습니다.");
    return;
  }
  const items = JSON.parse(fs.readFileSync(src, "utf8")).items.map(convertListing);
  const out = {
    _comment:
      "tools/package.mjs 가 content/listings.json 에서 만든 예시 매물 변환본 (install 에서 is_sample=1 로 넣음). 문자열 가격·면적·층수를 사양의 숫자 필드로 바꿨고, 원문에 매매가가 없는 병원 매매 예시는 보증금 값을 매매가 칸에 임시로 넣고 원문을 priceNote 에 남겼다. 오픈 전 관리자에서 일괄 삭제.",
    items,
  };
  fs.mkdirSync(path.join(SERVER, "install"), { recursive: true });
  fs.writeFileSync(path.join(SERVER, "install", "seed-listings.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`✓ 예시 매물 ${items.length}건 → server/install/seed-listings.json`);
}

/* ------------------------------------------------------------------ */
/* 2) 조립                                                              */
/* ------------------------------------------------------------------ */

const KEEP_IN_TARGET = ["uploads/listings", "app/storage"];

function cleanTarget() {
  if (!fs.existsSync(TARGET)) return;
  const walk = (dir, rel) => {
    for (const name of fs.readdirSync(dir)) {
      const r = rel ? `${rel}/${name}` : name;
      const full = path.join(dir, name);
      if (KEEP_IN_TARGET.includes(r)) continue;
      if (KEEP_IN_TARGET.some((k) => k.startsWith(`${r}/`))) {
        walk(full, r);
        continue;
      }
      fs.rmSync(full, { recursive: true, force: true });
    }
  };
  walk(TARGET, "");
}

/** server/ 복사 시 제외: config.php, storage 안의 로그·세션, 업로드 사진 */
function serverFilter(src) {
  const rel = path.relative(SERVER, src).split(path.sep).join("/");
  if (!rel) return true;
  const base = path.basename(src);
  if (base === ".DS_Store") return false;
  if (rel === "app/config.php") return false;
  if (rel.startsWith("app/storage/") && ![".htaccess", ".gitkeep"].includes(base)) return false;
  if (rel.startsWith("uploads/") && rel !== "uploads/.htaccess" && rel !== "uploads/listings") return false;
  return true;
}

function assemble() {
  if (!args.has("--no-out") && !fs.existsSync(path.join(OUT, "index.html"))) {
    console.error("✗ out/index.html 이 없습니다. 먼저 next build (output: export) 를 실행하세요.");
    process.exit(1);
  }
  fs.mkdirSync(TARGET, { recursive: true });
  cleanTarget();

  if (!args.has("--no-out")) {
    fs.cpSync(OUT, TARGET, { recursive: true, filter: (s) => path.basename(s) !== ".DS_Store" });
    console.log("✓ out/ → dist/cafe24/");
  }
  fs.cpSync(SERVER, TARGET, { recursive: true, filter: serverFilter });
  fs.mkdirSync(path.join(TARGET, "uploads", "listings"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "app", "storage"), { recursive: true });
  console.log("✓ server/ → dist/cafe24/");

  // Next 정적 자원은 파일명에 해시가 있어 1년 캐시
  const nextStatic = path.join(TARGET, "_next", "static");
  if (fs.existsSync(nextStatic)) {
    fs.writeFileSync(
      path.join(nextStatic, ".htaccess"),
      '<IfModule mod_headers.c>\n  Header set Cache-Control "public, max-age=31536000, immutable"\n</IfModule>\n',
    );
  }
}

/* ------------------------------------------------------------------ */
/* 3) zip                                                               */
/* ------------------------------------------------------------------ */

function makeZip() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const zipPath = path.join(DIST, `mediroad-cafe24-${stamp}.zip`);
  fs.rmSync(zipPath, { force: true });
  try {
    execFileSync(
      "zip",
      ["-r", "-q", "-X", zipPath, ".", "-x", "uploads/listings/?*", "app/storage/?*", "app/config.php", "*.DS_Store", "install/.lock"],
      { cwd: TARGET, stdio: "inherit" },
    );
    // 차단용 .htaccess 는 다시 넣는다 (위 제외 패턴에 걸리지 않도록 별도 추가)
    execFileSync("zip", ["-q", "-X", zipPath, "app/storage/.htaccess"], { cwd: TARGET, stdio: "inherit" });
    console.log(`✓ ${path.relative(ROOT, zipPath)}`);
  } catch (e) {
    console.warn("! zip 명령을 실행하지 못했습니다. dist/cafe24 폴더를 그대로 업로드하세요.", e.message);
  }
}

buildSeed();
assemble();
if (!args.has("--no-zip")) makeZip();
