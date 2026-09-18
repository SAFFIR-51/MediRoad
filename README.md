# 메디로드 (MediRoad) 웹사이트

병·의원 **개원 입지 분석** 사이트. 화면은 **Next.js 16 (App Router) + TypeScript** 로 만들어 정적 HTML 로 내보내고,
로그인·관리자·매물·상담 문의는 **PHP + MySQL(MariaDB)** API 가 처리합니다. 배포 대상은 **카페24 웹호스팅**입니다.

> 2026-09-15 개편: 전달사항 문서(SEO·이미지 전면 교체·로그인·관리자) + 추가 요청(카페24 PHP 배포, "컨설팅" → "입지 분석" 중심, 인증·인허가 페이지, 플라노바 파트너)을 반영했습니다.
> 개발 기준은 [`docs/개편_사양.md`](docs/개편_사양.md), 배포 절차는 [`docs/카페24_배포_가이드.md`](docs/카페24_배포_가이드.md), 이미지 제작은 [`docs/이미지_제작_목록.md`](docs/이미지_제작_목록.md).

## 구조

| 영역 | 내용 |
| --- | --- |
| 화면 | Next.js 16 정적 내보내기(`output: "export"`, `trailingSlash: true`) → `out/`. 서버 액션·proxy·동적 경로는 쓰지 않습니다 |
| API | `server/api/*.php` JSON API (회원·매물·문의·설정). 규약은 사양 6장 |
| 접근 제어 | `server/router.php` 가 모든 페이지 요청을 받아 회원 전용(`/location/`)·관리자(`/admin/`) 확인, `<html data-auth data-loc>` 주입, 옛 주소 301 |
| DB | MariaDB 10.x (`server/app/schema.sql`) — users · password_resets · login_attempts · listings · inquiries · settings |
| 스타일 | `app/styles/legacy.css`(원본) + `components.css` + `v2.css`(개편: 분석 보드·회원·관리자) |
| 인터랙션 | GSAP ScrollTrigger, 자체 슬라이더, Leaflet(오시는 길), SVG 입지 분석 보드(`components/analysis/AnalysisBoard.tsx`) |
| SEO | `content/seo.json` 페이지별 제목·설명·키워드, `app/sitemap.ts`·`robots.ts`(회원·관리자 제외), JSON-LD(업체 정보·서비스·FAQ·경로) |

## 실행

```bash
npm install
npm run dev                  # 화면만 확인 (http://localhost:3000) — PHP API 는 없어서 매물·로그인은 동작하지 않음

npm run package              # next build + dist/cafe24/ 조립 + zip
docker compose up -d --build # PHP 8.2 + MariaDB 10.6 → http://localhost:8080
# 최초 1회 http://localhost:8080/install/ 에서 관리자 계정 생성 (예시 매물 선택)
# 로컬 메일(비밀번호 재설정·문의 알림)은 dist/cafe24/app/storage/mail.log 에 기록
```

PHP 만 고쳤을 때는 `node tools/package.mjs --no-zip` 으로 다시 조립하면 됩니다 (`dist` 의 업로드 사진·로그는 유지).

```bash
node tools/e2e-test.mjs      # 통합 테스트 53항목 (라우터·보안·회원·매물 검증·업로드·상태·노출 설정·문의·비밀번호 재설정·삭제·로그인 제한)
```

통합 테스트는 로컬 Docker DB 전용입니다. 설치 전이면 설치부터 진행하고, 마지막에 **예시 매물 일괄 삭제**와 로그인 실패 제한을 실제로 실행한 뒤 테스트용 회원·문의를 지웁니다.

## 페이지

| 경로 | 내용 |
| --- | --- |
| `/` | 히어로(우측 분석 보드) → 입지 데이터 레이어 → 분야 6개(입지 분석 3 · 개원 지원 3) → 개원 실적 → 매물(회원 전용) → 협력사 → 상담 안내 |
| `/about/` · `/about/greeting/` · `/about/location/` | 회사소개 · 인사말 · 오시는 길 |
| `/analysis/` · `/analysis/clinic/` `pharmacy/` `transfer/` | 입지 분석 소개 · 병·의원 개원 입지 · 약국 개국 입지 · 병원 양수·양도 분석 |
| `/support/` · `/support/licensing/` `marketing/` `closure/` | 개원 지원 소개 · 인증·개설·허가(전문 행정사) · 경영마케팅(플라노바) · 폐업 정리 |
| `/location/` · `/location/view/?code=` | 매물 정보 목록·상세 — **로그인 회원 전용**, 관리자 설정으로 메뉴 전체 숨김 가능 |
| `/contact/` | 상담신청 폼 → 관리자 > 상담 문의 |
| `/login/` `/signup/` `/forgot-password/` `/reset-password/` | 회원 |
| `/admin/` | 대시보드 · 매물 관리(등록·수정·사진·노출/거래완료/비노출·예시 일괄 삭제) · 상담 문의(신규/상담중/완료) · 설정(매물 메뉴 노출) |
| `/terms/` · `/privacy/` | 이용약관 · 개인정보처리방침 |

옛 `/consulting/*` 주소는 router.php 가 새 주소로 301 이동시킵니다.

## 콘텐츠 수정

- `content/site.config.json` — 사업자·중개사무소 정보, 메뉴, 페이지 상단 문구·분석 보드 종류(`pages[].visual`), 홈 분야 목록, 서치콘솔·서치어드바이저 소유 확인 값(`seo.verification`)
- `content/content.json` — 히어로, 입지 데이터 레이어, 입지 분석 절차, 회사소개, 인사말, 협력사, 상담 절차·상담유형, 개원 실적, 약관
- `content/services.json` — 분야별 페이지 6개 (분석 항목·리포트 구성·파트너·절차·핵심 서비스·FAQ)
- `content/seo.json` — 전역 키워드와 페이지별 제목·설명·키워드
- `lib/privacy.ts` — 개인정보처리방침 본문
- `content/listings.json` — 설치 시 넣는 예시 매물 원본 (`tools/package.mjs` 가 `server/install/seed-listings.json` 으로 변환). 실제 매물은 관리자에서 등록
- `public/brand/clients/` — 개원 실적 로고 (병원명과 같은 파일명)

문구 원칙: 메디로드 명의로 매물 중개·대출 알선·서류 작성·제출 대행·계약서 법률 검토·가치 감정으로 읽히는 표현을 쓰지 않습니다 (매물은 로드맵공인중개사사무소 명의, 인허가 서류는 전문 행정사 수행).

## 이미지

1. `docs/이미지_제작_목록.md` 대로 만든 PNG 를 표의 파일명 그대로 `images_src/` 에 넣습니다 (git 제외 폴더).
2. `python3 tools/import-images.py` → `public/images/<이름>.jpg` 로 크롭·압축, `og-bg` 는 로고를 합성해 `public/brand/og.png`, `content/images.json` 갱신.
3. 지금 `public/images/` 의 새 파일명 사진들은 **기존 스톡 사진을 복사한 임시본**입니다. 실제 이미지를 반영한 뒤 쓰지 않는 옛 `photo-*` 사진(매물 데모 `photo-listing-*` 제외)을 지우면 됩니다.

## 폴더

```
app/          라우트(page.tsx), 전역 CSS(globals.css, styles/)
components/   layout · home · analysis(분석 보드) · service(분야 페이지) · listings · auth · admin · contact · seo · ui · effects
lib/          site(설정·문구) · seo · api(PHP API 호출) · auth-client · listing-utils · image-resize · privacy · clinics
content/      site.config · content · services · seo · listings(예시) · popup · roadmap · images
server/       카페24 웹 루트에 올라가는 PHP (router.php · api/ · app/ · install/ · uploads/)
tools/        package.mjs(카페24 패키지) · import-images.py(AI 이미지 반영) · e2e-test.mjs(통합 테스트)
docs/         개편 사양 · 카페24 배포 가이드 · 이미지 제작 목록
```
