#!/usr/bin/env node
/**
 * 카페24 운영 서버 배포 (바뀐 파일만 FTP 업로드)
 *
 *   npm run deploy                 빌드(npm run package) → 바뀐 파일만 업로드 → 운영 사이트 점검
 *   npm run deploy -- --no-build   이미 만든 dist/cafe24 를 그대로 올림
 *   npm run deploy -- --dry-run    올릴 파일 목록만 보여 주고 끝냄
 *   npm run deploy -- --mark-deployed
 *                                  업로드 없이 "지금 dist/cafe24 = 서버" 로 기록만 남김 (기록 파일을 잃었을 때)
 *
 * - 마지막 배포 때 올린 파일의 해시를 .deploy-manifest.json 에 남기고, 해시가 달라진 파일만 올린다.
 *   기록이 없으면 전체를 올린다.
 * - FTP 비밀번호는 저장소 루트의 Ftp.md("ftp : 비밀번호" 줄)에서 읽는다. Ftp.md 는 .gitignore 대상이다.
 *   환경변수 FTP_PASSWORD 가 있으면 그것을 쓴다. 호스트·아이디는 FTP_HOST · FTP_USER 로 바꿀 수 있다.
 * - 서버에만 있는 데이터는 건드리지 않는다: app/config.php, app/storage(로그·세션), uploads/listings(매물 사진).
 *   설치 마법사(install/)도 보안상 올리지 않는다.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "dist", "cafe24");
const MANIFEST = path.join(ROOT, ".deploy-manifest.json");
const SITE = "https://www.mediroadmap.com";
const HOST = process.env.FTP_HOST || "mediroadmap.com";
const USER = process.env.FTP_USER || "su6975";
const args = new Set(process.argv.slice(2));

/** 서버 데이터·설치 파일은 올리지 않는다 (차단용 .htaccess 는 올림) */
function skip(rel) {
  if (rel.startsWith("install/")) return true;
  if (rel === "app/config.php") return true;
  if (rel.startsWith("app/storage/") && path.basename(rel) !== ".htaccess") return true;
  if (rel.startsWith("uploads/") && rel !== "uploads/.htaccess") return true;
  return path.basename(rel) === ".DS_Store";
}

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out;
}

const sha1 = (file) => crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex");

function ftpPassword() {
  if (process.env.FTP_PASSWORD) return process.env.FTP_PASSWORD;
  const file = path.join(ROOT, "Ftp.md");
  if (!fs.existsSync(file)) throw new Error("Ftp.md 가 없습니다. 저장소 루트에 'ftp : 비밀번호' 줄을 적어 두세요.");
  const m = fs.readFileSync(file, "utf8").match(/^\s*ftp\s*:\s*(.+?)\s*$/im);
  if (!m) throw new Error("Ftp.md 에서 'ftp : 비밀번호' 줄을 찾지 못했습니다.");
  return m[1];
}

/** 정적 자원 → 일반 파일 → 페이지(html·txt) → .htaccess 순서. 새 페이지가 아직 없는 JS 를 가리키는 순간을 없앤다. */
function order(rel) {
  if (rel.startsWith("_next/")) return 0;
  if (path.basename(rel) === ".htaccess") return 3;
  if (/\.(html|txt)$/.test(rel)) return 2;
  return 1;
}

/** 한글·공백이 든 파일명(병원 로고 등)도 올라가도록 경로 조각마다 퍼센트 인코딩 */
const ftpUrl = (rel) => `ftp://${HOST}/${rel.split("/").map(encodeURIComponent).join("/")}`;

function upload(files) {
  const pw = ftpPassword();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mr-deploy-"));
  const netrc = path.join(tmp, "netrc");
  const cfg = path.join(tmp, "curl.cfg");
  try {
    fs.writeFileSync(netrc, `machine ${HOST} login ${USER} password ${pw}\n`, { mode: 0o600 });
    const q = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    fs.writeFileSync(cfg, files.map((rel) => `upload-file = ${q(path.join(SRC, rel))}\nurl = ${q(ftpUrl(rel))}\n`).join(""));
    const r = spawnSync("curl", ["-sS", "--netrc-file", netrc, "--ftp-create-dirs", "--connect-timeout", "15", "-K", cfg], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`curl 업로드 실패 (종료 코드 ${r.status})`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** 운영 사이트 점검: 주요 페이지 200 + 홈이 쓰는 JS·CSS 가 모두 서버에 있는지 */
async function verify() {
  const pages = ["/", "/about/", "/analysis/", "/support/", "/support/licensing/", "/faq/", "/robots.txt", "/sitemap.xml"];
  let bad = 0;
  for (const p of pages) {
    const r = await fetch(SITE + p, { redirect: "manual" });
    if (r.status !== 200) { bad++; console.log(`  ✗ ${p} → ${r.status}`); }
  }
  const html = await (await fetch(SITE + "/")).text();
  const assets = [...new Set(html.match(/\/_next\/static\/[^"']+\.(?:js|css)/g) ?? [])];
  for (const a of assets) {
    const r = await fetch(SITE + a, { method: "HEAD" });
    if (r.status !== 200) { bad++; console.log(`  ✗ ${a} → ${r.status}`); }
  }
  console.log(bad ? `✗ 점검 실패 ${bad}건` : `✓ 운영 사이트 점검 통과 (페이지 ${pages.length}개, JS·CSS ${assets.length}개)`);
  return bad === 0;
}

async function main() {
  if (!args.has("--no-build") && !args.has("--mark-deployed")) {
    execFileSync("npm", ["run", "package"], { cwd: ROOT, stdio: "inherit" });
  }
  if (!fs.existsSync(SRC)) throw new Error("dist/cafe24 가 없습니다. npm run package 를 먼저 실행하세요.");

  const hashes = Object.fromEntries(walk(SRC).filter((rel) => !skip(rel)).map((rel) => [rel, sha1(path.join(SRC, rel))]));
  if (args.has("--mark-deployed")) {
    fs.writeFileSync(MANIFEST, JSON.stringify(hashes, null, 1));
    console.log(`✓ 배포 기록만 갱신했습니다 (${Object.keys(hashes).length}개 파일)`);
    return;
  }

  const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
  const changed = Object.keys(hashes).filter((rel) => prev[rel] !== hashes[rel]).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  if (!Object.keys(prev).length) console.log("배포 기록이 없어 전체 파일을 올립니다.");
  console.log(`올릴 파일 ${changed.length}개 / 전체 ${Object.keys(hashes).length}개`);
  if (args.has("--dry-run")) { changed.forEach((f) => console.log("  " + f)); return; }

  if (changed.length) {
    upload(changed);
    // 업로드가 끝난 뒤에만 기록을 갱신해, 실패하면 다음 배포 때 다시 올라가게 한다
    fs.writeFileSync(MANIFEST, JSON.stringify(hashes, null, 1));
    console.log(`✓ ${changed.length}개 업로드 완료`);
  } else {
    console.log("바뀐 파일이 없습니다.");
  }
  if (!(await verify())) process.exit(1);
}

main().catch((e) => { console.error("✗ " + e.message); process.exit(1); });
