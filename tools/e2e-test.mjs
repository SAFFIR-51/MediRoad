#!/usr/bin/env node
/**
 * 메디로드 통합 테스트 — 카페24 패키지(dist/cafe24)를 띄운 로컬 Docker 를 대상으로 실제 HTTP 요청을 보낸다.
 *
 *   npm run package && docker compose up -d --build
 *   node tools/e2e-test.mjs                 # 기본 http://localhost:8080
 *   MR_ADMIN_EMAIL=... MR_ADMIN_PASSWORD=... node tools/e2e-test.mjs http://localhost:8080
 *
 * 설치 전이면 설치(예시 매물 포함)부터 진행한다. 테스트로 만든 회원·매물·문의는 끝에서 지운다.
 * 주의: 마지막에 "예시 매물 일괄 삭제"와 "로그인 실패 제한"을 실제로 실행한다 (로컬 테스트 DB 전용).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE = (process.argv[2] || process.env.MR_BASE || "http://localhost:8080").replace(/\/$/, "");
const ADMIN = { email: process.env.MR_ADMIN_EMAIL || "admin@mediroad.test", password: process.env.MR_ADMIN_PASSWORD || "Mediroad!2026", name: "관리자" };
const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const DIST = path.join(ROOT, "dist", "cafe24");
const MAIL_LOG = process.env.MR_MAIL_LOG || path.join(DIST, "app", "storage", "mail.log");
const STAMP = Date.now().toString(36);
const YEAR = new Date().getFullYear();

/* ---------------- HTTP 클라이언트 (쿠키 보관) ---------------- */
class Client {
  constructor(name) { this.name = name; this.jar = new Map(); }
  store(res) {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [kv, ...attrs] = c.split(";");
      const i = kv.indexOf("=");
      const k = kv.slice(0, i).trim(), v = kv.slice(i + 1).trim();
      const exp = attrs.map((a) => a.trim()).find((a) => /^expires=/i.test(a));
      const expired = !v || v === "deleted" || (exp && new Date(exp.slice(8)) < new Date()) || attrs.some((a) => /max-age=0\b/i.test(a));
      if (expired) this.jar.delete(k); else this.jar.set(k, v);
    }
  }
  async req(method, p, { json, form, body, headers = {}, csrf = true } = {}) {
    const h = { ...headers };
    if (this.jar.size) h.cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    let payload = body;
    if (json !== undefined) { h["content-type"] = "application/json"; payload = JSON.stringify(json); }
    else if (form) payload = form;
    if (csrf && method !== "GET") h["x-requested-with"] = "mediroad";
    const res = await fetch(BASE + p, { method, headers: h, body: payload, redirect: "manual" });
    this.store(res);
    const buf = Buffer.from(await res.arrayBuffer());
    const text = buf.toString("utf8");
    let data = null;
    try { data = JSON.parse(text); } catch { /* HTML */ }
    return { status: res.status, headers: res.headers, text, buf, data, location: res.headers.get("location") || "" };
  }
  get(p, o) { return this.req("GET", p, o); }
  post(p, json, o = {}) { return this.req("POST", p, { ...o, json }); }
}

/* ---------------- 테스트 도우미 ---------------- */
const results = [];
let group = "";
const section = (name) => { group = name; console.log(`\n■ ${name}`); };
async function t(name, fn) {
  try { await fn(); results.push({ group, name, ok: true }); console.log(`  ✓ ${name}`); }
  catch (e) { results.push({ group, name, ok: false, err: e.message }); console.log(`  ✗ ${name}\n      → ${e.message}`); }
}
function eq(actual, expected, what = "") {
  if (actual !== expected) throw new Error(`${what} 기대 ${JSON.stringify(expected)} / 실제 ${JSON.stringify(actual)}`.trim());
}
function ok(cond, msg) { if (!cond) throw new Error(msg); }
function sql(query) {
  return execSync(`docker compose exec -T db mariadb -umediroad -pmediroad mediroad -N -e ${JSON.stringify(query)}`, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}
const mailLog = () => (fs.existsSync(MAIL_LOG) ? fs.readFileSync(MAIL_LOG, "utf8") : "");

function listing(over = {}) {
  return {
    dealType: "임대", category: "의원", title: `[E2E ${STAMP}] 테스트 매물`, region: "서울 강서구", address: "서울특별시 강서구 마곡중앙6로 42",
    depositManwon: 10000, rentManwon: 700, salePriceManwon: null, priceNote: "",
    areaM2: 132.5, floorCurrent: "3", floorTotal: 10, useType: "제2종 근린생활시설", approvalDate: "2018-05-20", direction: "남향 (주출입구 기준)",
    parking: 30, maintenanceManwon: 120, moveIn: "즉시 입주", violation: false, features: ["역세권", "E2E"], description: "통합 테스트용 매물", images: [], lat: null, lng: null, status: "open",
    ...over,
  };
}

/* ======================================================================= */
const guest = new Client("guest");
const admin = new Client("admin");
const member = new Client("member");
const MEMBER = { email: `e2e-${STAMP}@mediroad.test`, password: "Member!2026", name: "테스트회원", phone: "010-0000-0000" };
const created = { listings: [], uploads: [] };

section("0. 설치");
await t("설치 화면 또는 설치 완료 상태 확인", async () => {
  const r = await guest.get("/install/");
  const m = r.text.match(/name="token" value="([^"]+)"/);
  if (m) {
    const form = new URLSearchParams({ token: m[1], email: ADMIN.email, name: ADMIN.name, password: ADMIN.password, password2: ADMIN.password, seed: "1" });
    const s = await guest.req("POST", "/install/", { body: form, headers: { "content-type": "application/x-www-form-urlencoded" }, csrf: false });
    ok(s.status < 400, `설치 POST 실패 ${s.status}`);
    console.log("      (새로 설치함: 예시 매물 포함)");
  }
  const again = await new Client("x").get("/install/");
  ok(!/name="token"/.test(again.text), "설치 후에도 설치 폼이 다시 열립니다");
});

section("1. 라우터 · 정적 페이지");
const pages = ["/", "/about/", "/about/greeting/", "/about/location/", "/analysis/", "/analysis/clinic/", "/analysis/pharmacy/", "/analysis/transfer/", "/support/", "/support/licensing/", "/support/marketing/", "/support/closure/", "/contact/", "/terms/", "/privacy/", "/login/", "/signup/", "/forgot-password/", "/reset-password/"];
await t(`공개 페이지 ${pages.length}개 200 · 제목 · 설명 · canonical · data-auth 주입`, async () => {
  for (const p of pages) {
    const r = await guest.get(p);
    eq(r.status, 200, `${p} 상태`);
    ok(/<title>[^<]+<\/title>/.test(r.text), `${p} title 없음`);
    ok(/<meta name="description" content="[^"]+"/.test(r.text), `${p} description 없음`);
    ok(/<link rel="canonical"/.test(r.text), `${p} canonical 없음`);
    ok(/<html lang="ko" data-auth="guest" data-loc="(on|off)"/.test(r.text), `${p} data-auth/data-loc 주입 안 됨`);
  }
});
await t("분야 페이지에 FAQ · 서비스 · 경로 구조화 데이터, 홈에 업체 정보", async () => {
  const home = await guest.get("/");
  ok(home.text.includes('"@type":"ProfessionalService"'), "홈 ProfessionalService 없음");
  const clinic = await guest.get("/analysis/clinic/");
  for (const ty of ["Service", "BreadcrumbList", "FAQPage"]) ok(clinic.text.includes(`"@type":"${ty}"`), `${ty} 없음`);
});
await t("트레일링 슬래시 301 (/analysis → /analysis/)", async () => {
  const r = await guest.get("/analysis");
  eq(r.status, 301, "상태"); ok(r.location.endsWith("/analysis/"), `location ${r.location}`);
});
await t("옛 컨설팅 주소 301 이동", async () => {
  for (const [from, to] of [["/consulting/", "/analysis/"], ["/consulting/opening/", "/analysis/clinic/"], ["/consulting/pharmacy/", "/analysis/pharmacy/"], ["/consulting/marketing/", "/support/marketing/"], ["/consulting/closure/", "/support/closure/"], ["/consulting/roadmap/", "/analysis/clinic/"]]) {
    const r = await guest.get(from);
    eq(r.status, 301, `${from}`); ok(r.location.endsWith(to), `${from} → ${r.location}`);
  }
});
await t("없는 주소 404 페이지 · 경로 조작 차단", async () => {
  const r = await guest.get("/no-such-page/");
  eq(r.status, 404, "상태"); ok(r.text.includes("페이지를 찾을 수 없습니다"), "404 본문");
  const tr = await guest.get("/..%2f..%2fetc%2fpasswd");
  ok([400, 403, 404].includes(tr.status), `경로 조작 ${tr.status}`);
  ok(!tr.text.includes("root:"), "시스템 파일 노출");
});
await t("비로그인: 매물 목록 · 상세 · 관리자 → 로그인으로 302 (원래 주소 보존)", async () => {
  const a = await guest.get("/location/?type=lease");
  eq(a.status, 302, "/location/"); ok(a.location.includes("/login/?next=%2Flocation%2F%3Ftype%3Dlease"), a.location);
  const b = await guest.get("/location/view/?code=L-2026-001");
  eq(b.status, 302, "상세"); ok(b.location.includes("next=%2Flocation%2Fview%2F%3Fcode%3DL-2026-001"), b.location);
  const c = await guest.get("/admin/listings/");
  eq(c.status, 302, "관리자"); ok(c.location.includes("/login/"), c.location);
});
await t("보안: 설정·스키마·설치 잠금·로그 파일 직접 접근 차단", async () => {
  for (const p of ["/app/config.sample.php", "/app/schema.sql", "/app/bootstrap.php", "/app/storage/mail.log", "/install/.lock", "/install/seed-listings.json"]) {
    const r = await guest.get(p);
    ok([403, 404].includes(r.status), `${p} → ${r.status}`);
  }
});
await t("sitemap.xml 공개 페이지만 · robots.txt 회원·관리자 제외", async () => {
  const s = await guest.get("/sitemap.xml");
  eq(s.status, 200, "sitemap");
  ok(s.text.includes("/analysis/clinic/") && s.text.includes("/support/licensing/"), "분야 페이지 누락");
  const locs = [...s.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const priv = locs.filter((p) => /^\/(location|admin|login|signup|forgot-password|reset-password|install|api)\//.test(p));
  ok(!priv.length, `비공개 경로 포함: ${priv.join(", ")}`);
  const r = await guest.get("/robots.txt");
  for (const d of ["/location/", "/admin/", "/api/", "/install/"]) ok(r.text.includes(`Disallow: ${d}`), `robots ${d} 누락`);
});
await t("새 이미지 · 공유 썸네일 제공", async () => {
  for (const p of ["/images/hero-01.jpg", "/images/sub-analysis.jpg", "/images/field-licensing.jpg", "/images/key-map-compare.jpg", "/brand/og.png"]) {
    const r = await guest.get(p);
    eq(r.status, 200, p); ok(/image\//.test(r.headers.get("content-type") || ""), `${p} 타입`);
  }
});

section("2. API 보호");
await t("CSRF 헤더 없는 POST → 403", async () => {
  const r = await guest.post("/api/auth/login.php", { email: ADMIN.email, password: ADMIN.password }, { csrf: false });
  eq(r.status, 403, "상태");
});
await t("비로그인 회원·관리자 API → 401", async () => {
  eq((await guest.get("/api/listings.php")).status, 401, "listings");
  eq((await guest.get("/api/admin/stats.php")).status, 401, "stats");
});
await t("POST 전용 API 에 GET → 405", async () => {
  eq((await guest.get("/api/auth/login.php")).status, 405, "login GET");
});

section("3. 관리자 로그인");
await t("틀린 비밀번호 401", async () => {
  eq((await new Client("bad").post("/api/auth/login.php", { email: ADMIN.email, password: "wrong-password" })).status, 401, "상태");
});
await t("관리자 로그인 · me · 관리자 화면 200", async () => {
  const r = await admin.post("/api/auth/login.php", { email: ADMIN.email, password: ADMIN.password });
  eq(r.status, 200, "로그인"); eq(r.data?.user?.role, "admin", "role");
  eq((await admin.get("/api/auth/me.php")).data?.user?.email, ADMIN.email, "me");
  const page = await admin.get("/admin/");
  eq(page.status, 200, "/admin/"); ok(page.text.includes('data-auth="admin"'), "data-auth admin");
  ok(/noindex/.test(page.text), "관리자 noindex");
});
await t("로그인 상태로 /login/?next= 접속 → next 로 이동, 외부 주소는 무시", async () => {
  const a = await admin.get("/login/?next=%2Fadmin%2F");
  eq(a.status, 302, "상태"); ok(a.location.endsWith("/admin/"), a.location);
  const b = await admin.get("/login/?next=%2F%2Fevil.example");
  eq(b.status, 302, "외부"); ok(!b.location.includes("evil"), b.location);
});
await t("매물 메뉴 노출 켜기 (테스트 기준 상태)", async () => {
  eq((await admin.post("/api/admin/settings.php", { locationMenuVisible: true })).status, 200, "저장");
  eq((await guest.get("/api/settings.php")).data?.settings?.locationMenuVisible, true, "값");
});

section("4. 매물 필수값 검증 (공인중개사법 명시사항)");
await t("빈 입력 → 422 + 명시사항 필드별 오류", async () => {
  const r = await admin.post("/api/admin/listing-save.php", { dealType: "임대" });
  eq(r.status, 422, "상태");
  for (const f of ["title", "region", "address", "areaM2", "floorCurrent", "floorTotal", "useType", "approvalDate", "direction", "parking", "maintenanceManwon", "moveIn", "depositManwon", "rentManwon"]) ok(r.data?.errors?.[f], `${f} 오류 없음`);
});
await t("가격을 \"협의\"로만 입력 → 422", async () => {
  const r = await admin.post("/api/admin/listing-save.php", listing({ depositManwon: "협의", rentManwon: "협의" }));
  eq(r.status, 422, "상태"); ok(r.data?.errors?.depositManwon || r.data?.errors?.rentManwon, "가격 오류 없음");
});
await t("분양·매매인데 가격 없음 → 422", async () => {
  eq((await admin.post("/api/admin/listing-save.php", listing({ dealType: "분양", depositManwon: null, rentManwon: null }))).status, 422, "분양");
  eq((await admin.post("/api/admin/listing-save.php", listing({ dealType: "매매", depositManwon: null, rentManwon: null }))).status, 422, "매매");
});
await t("외부 사진 주소 → 422", async () => {
  eq((await admin.post("/api/admin/listing-save.php", listing({ images: ["https://evil.example/a.jpg"] }))).status, 422, "상태");
});
await t("임대 · 분양 · 매매 등록 → 매물번호 자동 생성 (L-/S-)", async () => {
  const a = await admin.post("/api/admin/listing-save.php", listing());
  eq(a.status, 200, "임대"); ok(new RegExp(`^L-${YEAR}-\\d{3}$`).test(a.data.code), `임대 코드 ${a.data.code}`);
  const b = await admin.post("/api/admin/listing-save.php", listing({ dealType: "분양", depositManwon: null, rentManwon: null, salePriceManwon: 180000, title: `[E2E ${STAMP}] 분양` }));
  eq(b.status, 200, "분양"); ok(b.data.code.startsWith("L-"), `분양 코드 ${b.data.code}`);
  const c = await admin.post("/api/admin/listing-save.php", listing({ dealType: "매매", depositManwon: null, rentManwon: null, salePriceManwon: 85000, title: `[E2E ${STAMP}] 매매` }));
  eq(c.status, 200, "매매"); ok(c.data.code.startsWith("S-"), `매매 코드 ${c.data.code}`);
  created.listings.push(a.data, b.data, c.data);
});
await t("수정 저장 · 필드 반영", async () => {
  const id = created.listings[0].id;
  const r = await admin.post("/api/admin/listing-save.php", listing({ id, title: `[E2E ${STAMP}] 수정됨`, features: "주차 가능, 엘리베이터" }));
  eq(r.status, 200, "수정");
  const d = await admin.get(`/api/admin/listing.php?id=${id}`);
  eq(d.data.item.title, `[E2E ${STAMP}] 수정됨`, "제목"); eq(d.data.item.features.length, 2, "특징 태그(쉼표 문자열)");
});

section("5. 사진 업로드");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mr-e2e-"));
const bigJpg = path.join(tmp, "big.jpg");
execSync(`python3 -c "from PIL import Image; Image.new('RGB',(3000,2000),(30,75,122)).save('${bigJpg}', quality=90)"`);
async function upload(client, name, data, type) {
  const fd = new FormData();
  fd.append("file", new Blob([data], { type }), name);
  return client.req("POST", "/api/admin/upload.php", { body: fd });
}
await t("3000×2000 사진 업로드 → 긴 변 1600px JPEG 로 저장", async () => {
  const r = await upload(admin, "big.jpg", fs.readFileSync(bigJpg), "image/jpeg");
  eq(r.status, 200, "업로드"); ok(r.data.path.startsWith("/uploads/listings/"), r.data.path);
  const img = await guest.get(r.data.path);
  eq(img.status, 200, "파일 접근");
  const size = jpegSize(img.buf);
  ok(size && size.w === 1600 && size.h === 1067, `크기 ${JSON.stringify(size)}`);
  created.uploads.push(r.data.path);
});
await t("가짜 JPG · PHP 파일 업로드 거부", async () => {
  eq((await upload(admin, "fake.jpg", Buffer.from("not an image"), "image/jpeg")).status, 422, "가짜 jpg");
  eq((await upload(admin, "shell.php", Buffer.from("<?php echo 'PWNED'; ?>"), "application/x-php")).status, 422, "php");
});
await t("회원은 업로드 불가 (403/401)", async () => {
  const r = await upload(guest, "big.jpg", fs.readFileSync(bigJpg), "image/jpeg");
  ok([401, 403].includes(r.status), `상태 ${r.status}`);
});
await t("uploads 폴더에 PHP 가 있어도 실행되지 않음", async () => {
  const probe = path.join(DIST, "uploads", `e2e-${STAMP}.php`);
  fs.writeFileSync(probe, "<?php echo 'EXEC_' . (1+1);");
  try {
    const r = await guest.get(`/uploads/e2e-${STAMP}.php`);
    ok(!r.text.includes("EXEC_2"), "PHP 가 실행됨");
  } finally { fs.rmSync(probe, { force: true }); }
});
await t("사진을 붙여 매물 저장 · 순서 유지", async () => {
  const second = await upload(admin, "b.jpg", fs.readFileSync(bigJpg), "image/jpeg");
  created.uploads.push(second.data.path);
  const id = created.listings[0].id;
  const imgs = [second.data.path, created.uploads[0]];
  eq((await admin.post("/api/admin/listing-save.php", listing({ id, title: `[E2E ${STAMP}] 수정됨`, images: imgs }))).status, 200, "저장");
  const d = await admin.get(`/api/admin/listing.php?id=${id}`);
  eq(JSON.stringify(d.data.item.images), JSON.stringify(imgs), "사진 순서");
});

section("6. 회원가입 · 회원 권한");
await t("가입 검증: 이메일 형식 · 8자 미만 · 동의 누락 → 422", async () => {
  eq((await new Client("v").post("/api/auth/signup.php", { ...MEMBER, email: "bad" , agree: true })).status, 422, "이메일");
  eq((await new Client("v").post("/api/auth/signup.php", { ...MEMBER, password: "short", agree: true })).status, 422, "비밀번호");
  eq((await new Client("v").post("/api/auth/signup.php", { ...MEMBER, agree: false })).status, 422, "동의");
});
await t("가입 → 즉시 로그인(회원)", async () => {
  const r = await member.post("/api/auth/signup.php", { ...MEMBER, agree: true });
  eq(r.status, 200, "가입"); eq(r.data.user.role, "member", "role");
  eq((await member.get("/api/auth/me.php")).data.user.email, MEMBER.email, "me");
});
await t("같은 이메일 재가입 거부", async () => {
  const r = await new Client("dup").post("/api/auth/signup.php", { ...MEMBER, agree: true });
  ok([409, 422].includes(r.status), `상태 ${r.status}`);
});
await t("회원: 매물 목록 · 상세 · 같은 유형 추천", async () => {
  const list = await member.get("/api/listings.php");
  eq(list.status, 200, "목록");
  const code = created.listings[0].code;
  ok(list.data.items.some((l) => l.code === code), "등록한 매물이 목록에 없음");
  const d = await member.get(`/api/listing.php?code=${code}`);
  eq(d.status, 200, "상세"); eq(d.data.item.code, code, "코드"); ok(Array.isArray(d.data.related), "related");
  ok(d.data.related.every((x) => x.dealType !== "매매"), "임대 매물 추천에 매매가 섞임");
  const page = await member.get("/location/");
  eq(page.status, 200, "/location/ 페이지"); ok(page.text.includes('data-auth="member"'), "data-auth member");
  ok(/noindex/.test(page.text), "매물 페이지 noindex");
});
await t("회원: 관리자 API 403 · 관리자 화면은 홈으로", async () => {
  eq((await member.get("/api/admin/stats.php")).status, 403, "stats");
  eq((await member.post("/api/admin/listing-status.php", { id: created.listings[0].id, status: "hidden" })).status, 403, "상태 변경");
  const r = await member.get("/admin/");
  eq(r.status, 302, "/admin/"); ok(/\/$/.test(r.location) && !r.location.includes("admin"), r.location);
});

section("7. 매물 상태 (노출 · 거래완료 · 비노출)");
await t("거래완료 → closedAt 기록 · 회원 화면에서 즉시 제외", async () => {
  const { id, code } = created.listings[0];
  eq((await admin.post("/api/admin/listing-status.php", { id, status: "closed" })).status, 200, "변경");
  ok((await admin.get(`/api/admin/listing.php?id=${id}`)).data.item.closedAt, "closedAt 없음");
  eq((await member.get(`/api/listing.php?code=${code}`)).status, 404, "상세");
  ok(!(await member.get("/api/listings.php")).data.items.some((l) => l.code === code), "목록에 남아 있음");
});
await t("비노출 → 제외, 다시 노출 → closedAt 해제 · 복귀", async () => {
  const { id, code } = created.listings[0];
  await admin.post("/api/admin/listing-status.php", { id, status: "hidden" });
  eq((await member.get(`/api/listing.php?code=${code}`)).status, 404, "비노출 상세");
  await admin.post("/api/admin/listing-status.php", { id, status: "open" });
  eq((await admin.get(`/api/admin/listing.php?id=${id}`)).data.item.closedAt, null, "closedAt");
  eq((await member.get(`/api/listing.php?code=${code}`)).status, 200, "복귀");
});
await t("관리자 목록 필터 (상태 · 거래형태 · 검색)", async () => {
  const q = encodeURIComponent(STAMP);
  const all = await admin.get(`/api/admin/listings.php?q=${q}`);
  eq(all.data.items.length, 3, "검색 결과 수");
  eq((await admin.get(`/api/admin/listings.php?q=${q}&dealType=${encodeURIComponent("매매")}`)).data.items.length, 1, "거래형태");
  eq((await admin.get(`/api/admin/listings.php?q=${q}&status=closed`)).data.items.length, 0, "상태");
});

section("8. 매물 메뉴 노출 설정");
await t("미노출: 회원 매물 API 403 · 매물 주소 → 홈 · 홈 data-loc=off", async () => {
  eq((await admin.post("/api/admin/settings.php", { locationMenuVisible: false })).status, 200, "저장");
  eq((await member.get("/api/listings.php")).status, 403, "회원 API");
  const r = await member.get("/location/");
  eq(r.status, 302, "회원 /location/"); ok(!r.location.includes("location"), r.location);
  const g = await guest.get("/location/");
  eq(g.status, 302, "비회원 /location/");
  ok((await guest.get("/")).text.includes('data-loc="off"'), "홈 data-loc");
});
await t("미노출이어도 관리자는 매물 화면 확인 가능", async () => {
  const r = await admin.get("/location/");
  eq(r.status, 200, "상태"); ok(r.text.includes('data-loc="off"'), "data-loc off");
});
await t("다시 노출 → 회원 접근 복귀", async () => {
  await admin.post("/api/admin/settings.php", { locationMenuVisible: true });
  eq((await member.get("/api/listings.php")).status, 200, "회원 API");
  eq((await member.get("/location/")).status, 200, "회원 화면");
});

section("9. 상담 문의");
const inquiry = { name: `E2E ${STAMP}`, phone: "010-1234-5678", email: `e2e-inq-${STAMP}@mediroad.test`, department: "내과", region: "서울 강서구 마곡", openTiming: "6개월 이내", budget: "3 ~ 5억", deposit: "1억~3억", rent: "1000만원 미만", facilityCost: "5천~1억", area: "30평~100평", facility: "없음", consultType: "개원 입지 분석", message: "마곡나루역 인근 후보지 검토 요청", agree: true, website: "" };
let inquiryId = 0;
await t("필수 누락 · 동의 누락 → 422", async () => {
  eq((await guest.post("/api/inquiry.php", { ...inquiry, name: "" })).status, 422, "성함");
  eq((await guest.post("/api/inquiry.php", { ...inquiry, agree: false })).status, 422, "동의");
});
await t("허니팟 입력 → 성공처럼 응답하지만 저장 안 함", async () => {
  const before = (await admin.get("/api/admin/inquiries.php")).data.items.length;
  eq((await guest.post("/api/inquiry.php", { ...inquiry, website: "http://spam" })).status, 200, "응답");
  eq((await admin.get("/api/admin/inquiries.php")).data.items.length, before, "저장됨");
});
await t("비회원 접수 → 관리자 신규 목록 · 담당자 알림 메일 기록", async () => {
  const logBefore = mailLog().length;
  eq((await guest.post("/api/inquiry.php", inquiry)).status, 200, "접수");
  const list = await admin.get("/api/admin/inquiries.php?status=new");
  const row = list.data.items.find((x) => x.email === inquiry.email);
  ok(row, "신규 목록에 없음"); inquiryId = row.id;
  ok(list.data.counts.new >= 1, "counts.new");
  ok(mailLog().slice(logBefore).includes(inquiry.name), "알림 메일 기록 없음");
});
await t("상세 항목 전체 · 상태 상담중 + 메모 저장 · 필터", async () => {
  const d = await admin.get(`/api/admin/inquiry.php?id=${inquiryId}`);
  for (const k of ["name", "phone", "email", "department", "region", "openTiming", "budget", "deposit", "rent", "facilityCost", "area", "facility", "consultType", "message"]) eq(d.data.item[k], inquiry[k], k);
  ok(d.data.item.createdAt, "접수일시");
  eq((await admin.post("/api/admin/inquiry-update.php", { id: inquiryId, status: "in_progress", memo: "9/16 통화 예정" })).status, 200, "저장");
  const d2 = await admin.get(`/api/admin/inquiry.php?id=${inquiryId}`);
  eq(d2.data.item.status, "in_progress", "상태"); eq(d2.data.item.memo, "9/16 통화 예정", "메모");
  ok((await admin.get("/api/admin/inquiries.php?status=in_progress")).data.items.some((x) => x.id === inquiryId), "상담중 필터");
  await admin.post("/api/admin/inquiry-update.php", { id: inquiryId, status: "done", memo: "완료" });
  eq((await admin.get(`/api/admin/inquiry.php?id=${inquiryId}`)).data.item.status, "done", "완료");
});
await t("회원·비회원은 문의 목록 조회 불가", async () => {
  eq((await member.get("/api/admin/inquiries.php")).status, 403, "회원");
  eq((await guest.get("/api/admin/inquiries.php")).status, 401, "비회원");
});

section("10. 비밀번호 재설정");
let token = "";
await t("없는 이메일도 같은 응답 · 메일은 보내지 않음", async () => {
  const before = mailLog().length;
  eq((await guest.post("/api/auth/forgot.php", { email: `nobody-${STAMP}@mediroad.test` })).status, 200, "응답");
  ok(!mailLog().slice(before).includes(`nobody-${STAMP}`), "없는 이메일로 메일 발송됨");
});
await t("가입 이메일 → 재설정 링크 메일", async () => {
  const before = mailLog().length;
  eq((await guest.post("/api/auth/forgot.php", { email: MEMBER.email })).status, 200, "응답");
  const m = [...mailLog().slice(before).matchAll(/reset-password\/\?token=([a-f0-9]{32,})/g)].pop();
  ok(m, "메일에 재설정 링크 없음"); token = m[1];
});
await t("짧은 비밀번호 422 · 재설정 성공 · 같은 토큰 재사용 거부", async () => {
  eq((await guest.post("/api/auth/reset.php", { token, password: "short" })).status, 422, "짧은 비번");
  eq((await guest.post("/api/auth/reset.php", { token, password: "NewPass!2026" })).status, 200, "재설정");
  ok((await guest.post("/api/auth/reset.php", { token, password: "Again!2026x" })).status >= 400, "재사용 허용됨");
});
await t("옛 비밀번호 401 · 새 비밀번호 로그인", async () => {
  eq((await new Client("o").post("/api/auth/login.php", { email: MEMBER.email, password: MEMBER.password })).status, 401, "옛 비번");
  eq((await member.post("/api/auth/login.php", { email: MEMBER.email, password: "NewPass!2026" })).status, 200, "새 비번");
});

section("11. 로그아웃");
await t("로그아웃 → me null · 회원 API 401 · 매물 화면 로그인으로", async () => {
  eq((await member.post("/api/auth/logout.php", {})).status, 200, "로그아웃");
  eq((await member.get("/api/auth/me.php")).data.user, null, "me");
  eq((await member.get("/api/listings.php")).status, 401, "API");
  eq((await member.get("/location/")).status, 302, "화면");
});

section("12. 삭제 · 예시 매물 일괄 삭제 · 대시보드");
await t("대시보드 통계 응답", async () => {
  const s = await admin.get("/api/admin/stats.php");
  eq(s.status, 200, "상태");
  for (const k of ["inquiriesNew", "listingsOpen", "listingsClosed", "listingsHidden", "listingsSample", "members"]) ok(typeof s.data[k] === "number", `${k} 없음`);
});
await t("매물 삭제 → 업로드 사진 파일도 삭제", async () => {
  for (const l of created.listings) eq((await admin.post("/api/admin/listing-delete.php", { id: l.id })).status, 200, `삭제 ${l.code}`);
  for (const p of created.uploads) eq((await guest.get(p)).status, 404, `사진 남음 ${p}`);
  eq((await admin.get(`/api/admin/listings.php?q=${encodeURIComponent(STAMP)}`)).data.items.length, 0, "남은 매물");
});
await t("예시 매물 일괄 삭제 → 예시 0건 · 실제 매물은 유지", async () => {
  const keep = await admin.post("/api/admin/listing-save.php", listing({ title: `[E2E ${STAMP}] 실제 매물` }));
  const before = (await admin.get("/api/admin/stats.php")).data.listingsSample;
  const r = await admin.post("/api/admin/listings-delete-samples.php", {});
  eq(r.status, 200, "상태"); eq(r.data.deleted, before, "삭제 건수");
  eq((await admin.get("/api/admin/stats.php")).data.listingsSample, 0, "남은 예시");
  eq((await admin.get(`/api/admin/listing.php?id=${keep.data.id}`)).status, 200, "실제 매물이 지워짐");
  await admin.post("/api/admin/listing-delete.php", { id: keep.data.id });
});

section("13. 로그인 실패 제한");
await t("같은 IP 10회 실패 → 429 차단", async () => {
  const c = new Client("brute");
  let last = 0;
  for (let i = 0; i < 11; i++) last = (await c.post("/api/auth/login.php", { email: `brute-${STAMP}@mediroad.test`, password: "wrong" })).status;
  eq(last, 429, "11번째 응답");
});

/* ---------------- 정리 ---------------- */
try {
  sql("DELETE FROM login_attempts");
  sql(`DELETE FROM password_resets WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'e2e-%@mediroad.test')`);
  sql("DELETE FROM users WHERE email LIKE 'e2e-%@mediroad.test'");
  sql("DELETE FROM inquiries WHERE email LIKE 'e2e-inq-%@mediroad.test'");
  console.log("\n(정리: 테스트 회원·문의·로그인 시도 기록 삭제)");
} catch {
  console.log("\n(정리 SQL 실행 실패: docker compose 가 아니면 테스트 데이터를 직접 지워 주세요)");
}
fs.rmSync(tmp, { recursive: true, force: true });

const failed = results.filter((r) => !r.ok);
console.log(`\n결과: ${results.length - failed.length} / ${results.length} 통과${failed.length ? ` · 실패 ${failed.length}` : ""}`);
for (const f of failed) console.log(`  ✗ [${f.group}] ${f.name}: ${f.err}`);
process.exit(failed.length ? 1 : 0);
