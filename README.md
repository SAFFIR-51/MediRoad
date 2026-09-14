# 메디로드 (MediRoad) 웹사이트 — Next.js

병·의원 개원컨설팅 · 개원입지 정보 사이트. 닥터힐(gdrhill.com) 사이트의 디자인·인터랙션을 기준으로 삼되
홈 섹션의 순서와 주요 섹션의 구성은 따로 짜고, 콘텐츠는 개원컨설팅/개원입지 사업에 맞게 재구성한 뒤
**Next.js 16 (App Router) + TypeScript** 로 구현했습니다.

> **현재 단계: 프론트 전용.** 회원 시스템·관리자·DB·메일 발송은 2026-09-10 에 모두 걷어냈고, 서버는 나중에 따로 붙일 예정입니다.
> 매물·팝업은 `content/*.json` 정적 데이터를 읽고, 상담 신청은 검증 후 서버 로그에만 남깁니다 (`app/actions/consult.ts` 의 TODO 참고).

## 기술 구성

| 영역 | 내용 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, React 19, Turbopack), TypeScript |
| 스타일 | 원본 사이트 CSS 를 그대로 가져온 `app/styles/legacy.css` + 추가 컴포넌트 `components.css` (전역 CSS, Tailwind 미사용) |
| 인터랙션 | GSAP ScrollTrigger(섹션 페이드인·제목 리빌), 자체 페이드 슬라이더, Leaflet 지도(오시는 길) |
| 데이터 | `content/listings.json`(매물) · `content/popup.json`(오픈 팝업) 정적 JSON. `lib/listings.ts` 함수만 API 호출로 바꾸면 서버 연동 가능 |
| 폼 | React Server Action (`app/actions/consult.ts`) — 상담 신청 검증 후 로그 (서버 연동 전) |
| SEO | Metadata API, `app/sitemap.ts`, `app/robots.ts`, OG 이미지 |

## 실행

```bash
cp .env.example .env.local     # NEXT_PUBLIC_SITE_URL 만 있음
npm install
npm run dev                    # http://localhost:3000
npm run build && npm start     # 운영
```

## 페이지 구성 (견적서 항목 대응)

| 경로 | 내용 |
| --- | --- |
| `/` | 홈: 히어로 슬라이드(3) → 추천 개원지(지역·업종 검색바 + 최신 매물 6건) → 컨설팅 5분야 → 개원 프로세스 → 3대 가치 → 개원 실적 로고월 → 브랜드 메시지 → 상담 CTA(→ /contact), 오픈 팝업 |
| `/about` · `/about/greeting` · `/about/location` | 회사소개(슬로건 스테이트먼트 + MISSION/VISION/ACTION 을 한 섹션으로, 개원 실적 로고월 — 2개 섹션), 인사말(CEO 메시지·편지·현장 사진), 오시는 길(지도·교통·방문 안내). CEO 메시지와 주소·연락처는 각각 인사말·오시는 길 페이지에만 두어 회사소개에서 중복을 걷어냈습니다 |
| `/consulting` | 컨설팅 소개: 5개 분야(인트로 문구를 섹션 헤드로 흡수), 개원 프로세스(세로 타임라인), 다섯 가지 약속, FAQ — 4개 섹션 |
| `/consulting/opening` `pharmacy` `transfer` `closure` `marketing` | 분야별 상세 페이지 5종: 소개(배지·헤드라인 → 사진·필요성과 가치 2단) → **진행 절차**(아이콘 카드) → 핵심 제공 서비스(어두운 배경 카드 캐러셀) → 약속(인용문+Contact) → FAQ. 참고 사이트가 "가치 → 서비스 → 절차" 순이라 절차를 앞으로 당겼습니다. 문구·이미지·아이콘은 `content/services.json` |
| `/consulting/opening#roadmap` | 개원 로드맵: 대표님 자료(6단계 체크리스트·분야별 타임라인)를 병·의원 개원 컨설팅 페이지 안에 배치. 내용은 `content/roadmap.json`. 옛 주소 `/consulting/roadmap` 은 여기로 리다이렉트 |
| `/location` · `/location?type=lease|sale` · `/location/[매물번호]` | 개원입지: 유형 탭 + 지역·업종 필터 + 매물 카드, 매물 상세 (전체 공개). 목록 지도는 걷어냈고 Leaflet 은 오시는 길에서만 씁니다 |
| `/contact` | 상담신청: 안내 사이드(연락처·혜택) + 4단계 폼 + 상담 절차 + FAQ. 하단 CTA 띠는 각 페이지에서 제거하고 이 페이지와 플로팅 버튼으로 통일 |
| `/terms` · `/privacy` | 이용약관 · 개인정보처리방침 |

## 콘텐츠·사업자 정보 수정

- `content/site.config.json` — 상호, 연락처, 주소, 사업자번호, 메뉴(홈·회사소개·컨설팅·입지 4개, 상담신청은 헤더 오른쪽 `상담신청`·`전화` 버튼), 페이지 상단 문구, 홈 카드 문구. 홈 상담 CTA 문구는 `home.contact` (`headline` 이 CTA 제목). 사업자등록증 기준으로 상호·대표·사업자번호·주소·이메일을 넣어 두었고, 전화·팩스(`02-0000-0000`)와 SNS 링크(`#`)만 자리표시입니다. 주소가 실제 주소이면 회사소개·오시는 길에 Google 지도가, 자리표시이면 OpenStreetMap 기본 지도가 표시됩니다.
- `content/services.json` · `content/roadmap.json` — 분야별 컨설팅 페이지 문구, 개원 로드맵·타임라인(개원 컨설팅 페이지 하단). 분야 아이콘은 `items[].icon`, 진행 절차 단계 아이콘은 `items[].process[].icon` (xeicon 클래스명).
- `content/content.json` — 히어로 슬라이드, 메시지, 가치, 프로세스, 컨설팅 분야·약속·FAQ, 인사말, 약관 등 문구.
- `content/listings.json` — 매물 데이터(현재 예시 8건). `sample: true` 면 카드에 "예시" 배지가 붙습니다.
- `public/brand/clients/` — 개원 실적 로고월 이미지. **병원명과 똑같은 파일명**으로 넣으면 자동 표시되고, 없는 곳은 임시로 메디로드 심볼(`public/brand/symbol-mark.png`)이 나옵니다 (`public/brand/clients/README.md` 참고). 로고는 각 병·의원의 상표이므로 게시 전 원장님 사용 동의가 필요합니다.
- `content/popup.json` — 홈 오픈 팝업 (`active`, 게시 기간, 이미지, 링크).
- `lib/privacy.ts` — 개인정보처리방침 본문.

## 디자인 원칙

기준 스타일(타이포, 섹션 페이드인·제목 리빌 애니메이션, 246×46 알약 버튼, 배지형 섹션 라벨, 팔레트)은 유지하고,
**홈의 섹션 순서와 세 개 섹션의 구성은 원본과 다르게 짰습니다** (`app/styles/components.css` 맨 아래 "홈 구성 변주" 블록).

| 구간 | 원본 구성 | 메디로드 구성 |
| --- | --- | --- |
| 홈 순서 | 히어로 → 메시지 → 가치 → 서비스 → … | 히어로 → 추천 개원지 → 컨설팅 분야 → 프로세스 → 가치 → 실적 → 메시지 → 상담 |
| 히어로 | 풀스크린 페이드 슬라이더, 가운데 도트 + 우측 카운터 | 슬라이더는 유지하되 도트·카운터를 좌측 한 줄로 통합 |
| 추천 개원지 (`.mr-locsearch`) | (원본에 없음) | 섹션 상단에 지역·업종 **입지 검색바** → `/location?region=&cat=` 로 조건이 걸린 목록 열기 |
| 컨설팅 분야 (`.sec_fields`) | 이미지 카드 3+2 그리드, 가운데 제목 | 네이비 배경에 좌측 인덱스 목록(01~05, 마우스오버 시 펼침) + 우측 대형 비주얼 교차 페이드, 좌측 정렬 제목 |
| 3대 가치 (`.sec_values`) | 세로 사진 카드 3개 | 1px 선으로 나눈 넘버링 가로 스트립, 좌측 제목 + 우측 요약 2단 헤드 |
| 회사소개 (`.sec_about`) | 가운데 슬로건 → 전폭 사진 → 3카드 → CEO → INFORMATION (4섹션) | 좌측 스테이트먼트(슬로건 · 4:3 사진 · 대표 사인 · 인사말 링크) + 우측 MISSION/VISION/ACTION 나열, 이어서 개원 실적 (2섹션) |
| 개원 실적 (`.mr-marquee`) | 권역별 텍스트 태그 목록 | 두 줄이 반대 방향으로 흐르는 로고 마키. `public/brand/clients/` 에 로고 파일을 넣으면 자동 교체 |
| 컨설팅 소개 (`.sec_fields`) | 가운데 인트로 섹션 + 가운데 제목의 분야 나열 (5섹션) | 인트로를 분야 섹션 헤드로 흡수(좌측 제목 · 우측 설명 + 05개 영역) (4섹션) |
| 개원 프로세스 | 홈·컨설팅 모두 가로 아이콘 흐름도 | 홈은 가로 흐름도, 컨설팅은 세로 타임라인(`.mr-ptimeline`)으로 분리 |
| 홈 상담 (`.mr-cta-home`) | 사진 + 문구 + 테두리 박스(전화·버튼) 2단 구성 | 사진을 전폭 배경으로 깔고 문구·혜택·버튼만 가운데 올리는 CTA 섹션 (하위 페이지 `.mr-cta-band` 와 같은 문법) |
| 분야별 소개 (`.mr-svc-intro`) | 21:9 전폭 사진 아래 `[ Significance & Value ]` 대괄호 라벨 + 45도 회전 원형 화살표 | 4:3 사진(좌) + 필요성과 가치(우) 2단, 대괄호 라벨 대신 분야 아이콘 + 대문자 자간 라벨 |
| 분야별 진행 절차 (`.mr-svc-steps`) | 세로 구분선으로 나눈 5열 텍스트 | 단계별 아이콘(원형) + 고스트 번호가 들어간 흰 카드. 항목 수가 4개든 5개든 한 줄을 균등하게 채웁니다 |
| 핵심 제공 서비스 (`.mr-keys .card`) | 사진 위 그라데이션 + 가운데 정렬 오버레이, 좌우 화살표 버튼 | 사진(상단, 좌상단 번호) + 텍스트(하단) 분리형 카드. 버튼 없이 3.8초마다 자동으로 넘어가고 끝에서 처음으로 돌아옵니다 (마우스 올리면 정지, `prefers-reduced-motion` 이면 정지) |

추가한 요소(매물 카드·필터·프로세스·약속·FAQ·상담 폼)는 1px 라인과 여백만으로 구성한 플랫 스타일입니다.
팔레트는 로고 블루를 절제한 네이비 `#1E4B7A`(포인트), `#0B2545`(진한 배경), `#78C8F0`(어두운 배경 위 강조)이며
빌드 시 원본의 골드 계열 색이 모두 이 값으로 치환되어 있습니다 (`app/styles/legacy.css` 의 `--gold`).

## 폴더

```
app/               라우트 (page.tsx), 서버 액션(actions/consult.ts), 전역 CSS(globals.css, styles/)
components/        layout(헤더·푸터·퀵메뉴·서브비주얼·팝업), home(홈 섹션), contact(상담 폼), listings, ui, effects
lib/               site(설정·문구), listings(정적 매물), listing-utils, privacy
content/           site.config.json · content.json · services.json · roadmap.json · listings.json · popup.json
public/            images/ brand/ fonts/
```

## 배포

- 정적 데이터만 쓰므로 Vercel 등 어디든 `npm run build` 로 배포할 수 있습니다. 서버(회원·관리자·DB·메일)는 추후 별도로 붙입니다.

## 프로젝트 위치

- 프로젝트: `~/Desktop/Website/1. MediRoad/mediroad-website` (이 폴더). 2026-09-10 에 `~/Projects` 사본과 구버전·PHP 버전을 정리하고 이 폴더 하나만 남겼습니다.
- 원본 자료: `~/Desktop/Website/1. MediRoad/자료` — 로고, 견적서, 영업스토리, 브랜드·스톡 원본(`브랜드원본/`).

## iCloud 폴더에서 작업할 때

이 폴더는 iCloud 가 동기화하는 Desktop 안에 있습니다. `node_modules` 를 그대로 두면 수만 개 파일이 iCloud 로 올라가며 Mac 이 느려지고, 클라우드로 내려간(evict) 파일은 읽기가 멈춥니다.
그래서 실제 폴더는 `node_modules.nosync` · `.next.nosync`(iCloud 제외)이고 `node_modules` · `.next` 는 그 심볼릭 링크입니다. 새로 설치할 때도 같은 구조를 유지하세요:

```bash
npm install                      # node_modules 링크가 있으면 그대로 사용됨
# 링크가 없다면:
mkdir -p node_modules.nosync .next.nosync
ln -sfn node_modules.nosync node_modules && ln -sfn .next.nosync .next
npm install
```

## 자산 메모

사진은 Unsplash 무료 스톡을 가공한 것이며 `public/images/` 에 있습니다. 로고는 전달받은 `메디로드 로고1·2.png` 에서 추출했고, AI 원본을 받으면 `public/brand/` 파일을 같은 이름으로 교체하면 됩니다.
로고 원본과 스톡 원본은 상위 폴더 `자료/브랜드원본/` 에 있습니다.

> 참고: 2026-09-09 Next.js 전환 중 iCloud 가 이전 버전의 이미지 파일을 내려주지 않아, 자료실·오시는 길·인사말 스트립과 매물 상세 일부 사진(21장)은 같은 세트의 다른 사진으로 임시 대체했습니다. 원본 사진이 필요하면 `자료/브랜드원본/stock/` 을 참고하세요.
