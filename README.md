# 메디로드 (MediRoad) 웹사이트 — Next.js

병·의원 개원컨설팅 · 개원입지 정보 사이트. 닥터힐(gdrhill.com) 사이트의 디자인·인터랙션을 그대로 옮기고,
헤더 구성과 콘텐츠를 개원컨설팅/개원입지 사업에 맞게 재구성한 뒤 **Next.js 16 (App Router) + TypeScript** 로 구현했습니다.

## 기술 구성

| 영역 | 내용 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, React 19, Turbopack), TypeScript |
| 스타일 | 원본 사이트 CSS 를 그대로 가져온 `app/styles/legacy.css` + 추가 컴포넌트 `components.css` (전역 CSS, Tailwind 미사용) |
| 인터랙션 | GSAP ScrollTrigger(섹션 페이드인·제목 리빌), 자체 페이드 슬라이더, SVG 도넛(전문가 그룹), Leaflet 지도 |
| DB | SQLite (libsql) + Drizzle ORM. 첫 요청 시 테이블 생성·관리자 계정·예시 매물 자동 시드 |
| 인증 | 서명된 JWT 세션 쿠키(`jose`) + bcrypt 비밀번호. `proxy.ts` 가 `/admin`, `/member/mypage` 1차 차단 |
| 폼 | React Server Actions (`app/actions/*.ts`) — 상담 신청, 회원, 관리자 CRUD |
| 업로드 | `public/uploads/` 에 저장 (매물 사진, 팝업 이미지) |
| 메일 | nodemailer (SMTP 설정 시 상담 접수 알림·비밀번호 재설정 메일) |
| SEO | Metadata API, `app/sitemap.ts`, `app/robots.ts`, OG 이미지 |

## 실행

```bash
cp .env.example .env.local     # 환경변수 (세션 키, 관리자 초기 계정, DB, SMTP)
npm install
npm run dev                    # http://localhost:3000
npm run build && npm start     # 운영
```

관리자 초기 계정은 `.env.local` 의 `ADMIN_ID` / `ADMIN_PASSWORD` (기본 `admin` / `mediroad1234!`).
첫 로그인 후 **관리자 > 설정** 에서 비밀번호를 꼭 변경하세요. `SESSION_SECRET` 도 운영 배포 전 긴 임의 문자열로 바꿔야 합니다.

## 페이지 구성 (견적서 항목 대응)

| 경로 | 내용 |
| --- | --- |
| `/` | 홈: 히어로 슬라이드(3), 브랜드 메시지, 3대 가치, 연혁·실적, 개원컨설팅 4분야, 개원 프로세스, 전문가 그룹, 추천 개원지(최신 매물 6건), 상담신청 폼, 오픈 팝업 |
| `/about` · `/about/greeting` · `/about/location` | 회사소개(슬로건·MISSION/VISION/ACTION·CEO 메시지·INFORMATION), 인사말, 오시는 길(지도·교통·방문 안내) |
| `/consulting` | 개원컨설팅: 5개 분야, 개원 프로세스, 다섯 가지 약속, FAQ, 상담 CTA |
| `/consulting/opening` `transfer` `closure` `marketing` | 홈 4개 카드에서 이동하는 분야별 상세 페이지 (소개·6가지 서비스·절차·FAQ). 문구는 `content/services.json` |
| `/consulting/roadmap` | **회원 전용** 개원 로드맵: 대표님 자료(6단계 체크리스트·분야별 타임라인). 비회원은 단계 제목·요약만 보임. 내용은 `content/roadmap.json` |
| `/location` · `/location?type=lease|sale` · `/location/[매물번호]` | 개원입지: 지도(Leaflet/OSM) + 유형 탭 + 지역·업종 필터, 매물 상세(회원 전용) |
| `/contact` | 상담신청 (절차 안내 + 폼) |
| `/terms` · `/privacy` | 이용약관 · 개인정보처리방침 |
| `/member/login` `join` `find` `reset` `mypage` `logout` | 로그인, 회원가입, 아이디·비밀번호 찾기, 재설정, 정보수정·비밀번호 변경·탈퇴 |
| `/admin` … | 대시보드, 매물 관리(등록·수정·사진·상태·삭제), 회원 관리(차단·초기화·메모·삭제), 상담 접수 처리, 팝업 관리, 설정(열람 정책·알림 메일·관리자 비밀번호) |

매물 열람 정책은 관리자 > 설정에서 바꿀 수 있습니다: `상세만 회원(기본)` / `목록·상세 모두 회원` / `전체 공개`.

## 콘텐츠·사업자 정보 수정

- `content/site.config.json` — 상호, 연락처, 주소, 사업자번호, 메뉴, 페이지 상단 문구, 홈 카드 문구. 사업자등록증 기준으로 상호·대표·사업자번호·주소·이메일을 넣어 두었고, 전화·팩스(`02-0000-0000`)와 SNS 링크(`#`)만 자리표시입니다. 주소가 실제 주소이면 회사소개·오시는 길에 Google 지도가, 자리표시이면 OpenStreetMap 기본 지도가 표시됩니다.
- `content/services.json` · `content/roadmap.json` — 분야별 컨설팅 페이지 문구, 회원 전용 개원 로드맵·타임라인.
- `content/content.json` — 히어로 슬라이드, 메시지, 가치, 프로세스, 컨설팅 분야·약속·FAQ, 연혁·실적 숫자, 인사말, 약관 등 문구.
- `content/listings.json` — DB 가 비어 있을 때 한 번 들어가는 예시 매물. 실제 매물은 관리자 페이지에서 등록하고, 대시보드의 "예시 매물 삭제"로 정리합니다.
- `lib/privacy.ts` — 개인정보처리방침 본문.

## 디자인 원칙

원본 닥터힐 사이트의 레이아웃·타이포·애니메이션(섹션 페이드인, 제목 리빌, 246×46 알약 버튼, 배지형 섹션 라벨)을 그대로 두고,
추가한 요소(매물 카드·필터·프로세스·약속·FAQ·회원 폼·관리자)는 1px 라인과 여백만으로 구성한 플랫 스타일입니다.
팔레트는 로고 블루를 절제한 네이비 `#1E4B7A`(포인트), `#0B2545`(진한 배경), `#78C8F0`(어두운 배경 위 강조)이며
빌드 시 원본의 골드 계열 색이 모두 이 값으로 치환되어 있습니다 (`app/styles/legacy.css` 의 `--gold`).

## 폴더

```
app/               라우트 (page.tsx), 서버 액션(actions/), API(api/), 전역 CSS(globals.css, styles/)
components/        layout(헤더·푸터·퀵메뉴·서브비주얼·팝업), home(홈 섹션), listings, member, admin, ui, effects
lib/               site(설정·문구), db(스키마·연결·시드), auth(세션), listings, board, upload, mail, privacy
content/           site.config.json · content.json · listings.json
public/            images/ brand/ fonts/ uploads/
proxy.ts           회원·관리자 경로 접근 제어
```

## 배포

- **Node 서버 (권장, 카페24 Node 호스팅·VPS 등)**: `npm run build` 후 `npm start`. SQLite 파일(`data/mediroad.db`)과 `public/uploads/` 가 서버 디스크에 남습니다.
- **Vercel 등 서버리스**: 디스크가 유지되지 않으므로 `DATABASE_URL` 을 Turso(libsql) 주소로 바꾸고, 업로드는 Vercel Blob 같은 외부 스토리지로 교체해야 합니다 (`lib/upload.ts` 한 곳만 수정).
- 카페24 일반 PHP 호스팅에서는 Next.js 를 실행할 수 없습니다. 그 경우에는 이전 HTML+PHP 버전(상위 폴더의 `메디로드 웹사이트 (이전 PHP 버전)/legacy-php`)을 사용하세요. 프로젝트 안에 두면 `next build` 가 그 파일까지 추적하므로 밖에 보관합니다.

## 프로젝트 위치

이 프로젝트의 정본은 `~/Projects/mediroad-website` 입니다. 처음에 `~/Desktop/Git/메디로드 웹사이트` 에서 만들었지만 iCloud 동기화가 소스 파일까지 클라우드로 내려보내(evict) 읽기가 멈추는 문제가 있어 iCloud 밖으로 옮겼습니다. Desktop 쪽 폴더는 손상된 사본이므로 삭제해도 됩니다 (`메디로드 웹사이트 (이전 PHP 버전)` 폴더에는 이전 PHP 버전과 로고·스톡 원본이 있습니다).

## iCloud 폴더에서 작업할 때

이 폴더는 iCloud 가 동기화하는 Desktop 안에 있습니다. `node_modules` 를 그대로 두면 수만 개 파일이 iCloud 로 올라가며 Mac 이 느려지고, 클라우드로 내려간(evict) 파일은 읽기가 멈춥니다.
그래서 실제 폴더는 `node_modules.nosync`(iCloud 제외)이고 `node_modules` 는 그 심볼릭 링크입니다. 새로 설치할 때도 같은 구조를 유지하세요:

```bash
npm install                      # node_modules 링크가 있으면 그대로 사용됨
# 링크가 없다면: mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules
```

가능하면 프로젝트를 iCloud 밖(예: `~/Projects`)으로 옮기는 편이 안전합니다.

## 자산 메모

사진은 Unsplash 무료 스톡을 가공한 것이며 `public/images/` 에 있습니다. 로고는 전달받은 `메디로드 로고1·2.png` 에서 추출했고, AI 원본을 받으면 `public/brand/` 파일을 같은 이름으로 교체하면 됩니다.
로고 원본과 스톡 원본은 상위 폴더 `메디로드 웹사이트 (이전 PHP 버전)/brand-source/` 에 있습니다.

> 참고: 2026-09-09 Next.js 전환 중 iCloud 가 이전 버전의 이미지 파일을 내려주지 않아, 자료실·오시는 길·인사말 스트립과 매물 상세 일부 사진(21장)은 같은 세트의 다른 사진으로 임시 대체했습니다. `legacy-php/public/images/` 가 정상적으로 열리면 같은 파일명으로 덮어쓰면 됩니다.
