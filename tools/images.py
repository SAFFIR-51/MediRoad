#!/usr/bin/env python3
"""
사진 자산 생성기 (고해상도)
 - Unsplash(무료 상업 이용, 출처 표기 불필요) 원본을 큰 폭으로 내려받아 크롭·리사이즈 → public/images/photo-*.jpg
 - 원본 캐시는 프로젝트 밖(iCloud 제외)에 둔다: ~/Library/Caches/mediroad-stock
 - 이미지 목록은 content/images.json 에 기록
실행: python3 tools/images.py            (전체)
      python3 tools/images.py hero-seoul (특정 이름만)
"""
import json, os, sys, subprocess
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.expanduser('~/Library/Caches/mediroad-stock')
OUT = os.path.join(ROOT, 'public', 'images')
os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)

# name → (unsplash id, 설명, 출력 최대 가로, 크롭 비율(w:h) or None[, 크롭 기준 'left'|'right'|'top'|'bottom' 또는 상대 박스 (x0,y0,x1,y1) 0~1 (기본 가운데)])
# 화면 표시 폭의 약 2배(레티나) 기준. 히어로·서브비주얼 2560, 큰 사진 1920, 카드 1600, 정사각 1200.
PHOTOS = {
  'hero-seoul':        ('1594476800502-a8c927d0acc0', '서울 도심 항공 전경 (메인 슬라이드 1)', 2560, (16, 9)),
  'hero-tower':        ('1597807037496-c56a1d8bc29a', '유리 커튼월 오피스 타워 (메인 슬라이드 2)', 2560, (16, 9)),
  'hero-meeting':      ('1714974528718-b3b52f91c334', '컨설팅 미팅 (메인 슬라이드 3)', 2560, (16, 9)),
  'value-plan':        ('1450101499163-c8848c66ca85', '개원 계획 작성', 1600, (440, 290)),
  'value-city':        ('1724416823399-a4ca50ebfe62', '서울 시내 스카이라인', 1600, (440, 290)),
  'value-doctor':      ('1758691461935-202e2ef6b69f', '진료실 상담', 1600, (440, 290)),
  'service-hospital':  ('1764885517847-79d62138cc58', '병원 건물 외관', 1920, (16, 9)),
  'service-handshake': ('1577415124269-fc1140a69e91', '사무실 악수', 1920, (16, 9)),
  'service-sign':      ('1521791055366-0d553872125f', '계약서 서명', 1920, (16, 9)),
  'service-team':      ('1758518731706-be5d5230e5a5', '오피스 팀 협업', 1920, (16, 9)),
  'expert-docs':       ('1681505504714-4ded1bc247e7', '서류 검토', 1200, (1, 1)),
  'expert-steth':      ('1638202993928-7267aad84c31', '청진기를 든 의료진', 1200, (1, 1)),
  'expert-laptop':     ('1517245386807-bb43f82c33c4', '노트북 회의', 1200, (1, 1)),
  'expert-desk':       ('1576091160550-2173dba999ef', '진료 데스크', 1200, (1, 1)),
  'expert-room':       ('1665231795856-769fb08a90bc', '진료실 인테리어', 1200, (1, 1)),
  'expert-reception':  ('1758448500688-3ababa93fd67', '리셉션 데스크', 1200, (1, 1)),
  'expert-team':       ('1624555130581-1d9cca783bc0', '팀 미팅', 1200, (1, 1)),
  'expert-sign':       ('1562564055-71e051d33c19', '서명하는 손', 1200, (1, 1)),
  'contact-building':  ('1615770949303-a4eb0ba7aa2e', '유리 빌딩 파사드 (상담 섹션)', 2400, (16, 5)),
  'about-hero':        ('1575493089581-f6ed9a9661e4', '서울 야경 (서브 비주얼)', 2560, (16, 9)),
  'about-hero-m':      ('1504107435030-c7cd582601b8', '서울 노을 항공 (서브 비주얼 모바일)', 1200, (3, 4)),
  'about-building':    ('1662414185445-b9a05e26dba0', '현대식 오피스 빌딩 (회사소개)', 2400, (16, 7)),
  'ceo-handshake':     ('1577415124269-fc1140a69e91', '대표 인사 (CEO 메시지)', 1600, (5, 6)),
  'building-1':        ('1615770949303-a4eb0ba7aa2e', '메디컬 빌딩 1', 1200, (3, 4)),
  'building-2':        ('1777108329437-a93e8765a698', '메디컬 빌딩 2', 1200, (3, 4)),
  'building-3':        ('1597807037496-c56a1d8bc29a', '메디컬 빌딩 3', 1200, (3, 4)),
  'field-opening':     ('1764885517847-79d62138cc58', '병·의원 개원 컨설팅', 2400, (21, 9)),
  'field-pharmacy':    ('1765031092161-a9ebe556117e', '약국 컨설팅 (우측 간판 제외 박스 크롭)', 2400, (21, 9), (0, 0, 0.78, 1)),
  'field-transfer':    ('1758691463198-dc663b8a64e4', '병·의원 양수양도', 2400, (21, 9)),
  'field-closure':     ('1771574204208-b47e2d863bc5', '병·의원 폐업 컨설팅 (빈 대기실)', 2400, (21, 9)),
  'field-marketing':   ('1758691461990-03b49d969495', '병·의원 경영·마케팅', 2400, (21, 9)),
  'listing-dental-1':  ('1704455306251-b4634215d98f', '치과 진료실', 1600, (4, 3)),
  'listing-dental-2':  ('1704455306925-1401c3012117', '치과 장비', 1600, (4, 3)),
  'listing-clinic-1':  ('1731514709874-30eead90613b', '의원 대기 공간', 1600, (4, 3)),
  'listing-clinic-2':  ('1731514721772-329626f84c8b', '의원 복도', 1600, (4, 3)),
  'listing-room':      ('1665231795856-769fb08a90bc', '진료실', 1600, (4, 3)),
  'listing-lobby-1':   ('1749310726959-d8fccfef7ee4', '빌딩 로비', 1600, (4, 3)),
  'listing-lobby-2':   ('1774953037913-af0cf688491a', '오피스 라운지', 1600, (4, 3)),
  'listing-wait':      ('1762625570087-6d98fca29531', '대기실', 1600, (4, 3)),
  'listing-reception': ('1764727291644-5dcb0b1a0375', '접수 데스크', 1600, (4, 3)),
  'listing-corridor':  ('1719934398679-d764c1410770', '밝은 복도', 1600, (4, 3)),
  'listing-hallway':   ('1719934398679-d764c1410770', '병원 복도', 1600, (4, 3)),
  'listing-building-1':('1662414185445-b9a05e26dba0', '메디컬 빌딩 외관 A', 1600, (4, 3)),
  'listing-building-2':('1777108329437-a93e8765a698', '메디컬 빌딩 외관 B', 1600, (4, 3)),
  'listing-pharmacy':  ('1580281657529-557a6abb6387', '약국 내부 (조제 선반)', 1600, (4, 3)),
  'listing-chairs':    ('1771574204208-b47e2d863bc5', '대기 의자', 1600, (4, 3)),
  'greeting-1':        ('1573496267526-08a69e46a409', '상담 미팅', 1600, (4, 3)),
  'greeting-2':        ('1758691736933-bb0f88fe2e0c', '로비에서의 만남', 1600, (4, 3)),
  'greeting-3':        ('1666214277730-e9c7e755e5a3', '진료실 대화', 1600, (4, 3)),
  'dir-lobby':         ('1774953037913-af0cf688491a', '사무실 라운지 (오시는 길)', 1600, (4, 3)),
  'dir-reception':     ('1758448500688-3ababa93fd67', '리셉션 (오시는 길)', 1600, (4, 3)),
  'dir-exterior':      ('1777108329437-a93e8765a698', '건물 외관 (오시는 길)', 1600, (4, 3)),
  'benefit-clinic':    ('1704455306251-b4634215d98f', '진료실 (핵심 서비스 카드)', 1600, (4, 3)),
  'benefit-map':       ('1579734018708-b83a1ce43504', '입지 분석 지도 (핵심 서비스 카드)', 1600, (4, 3)),
  'benefit-docs':      ('1681505504714-4ded1bc247e7', '서류 검토 (핵심 서비스 카드)', 1600, (4, 3)),
  'benefit-meeting':   ('1517048676732-d65bc937f952', '미팅 (핵심 서비스 카드)', 1600, (4, 3)),
  'board-1':           ('1450101499163-c8848c66ca85', '개원 서식', 1600, (4, 3)),
  'board-2':           ('1666886573531-48d2e3c2b684', '인허가 가이드', 1600, (4, 3)),
  'board-3':           ('1521791055366-0d553872125f', '계약 체크리스트', 1600, (4, 3)),
  'contact-consult':   ('1758691463198-dc663b8a64e4', '상담 절차: 접수', 1600, (16, 10)),
  'contact-tour':      ('1623934970212-3a1740a45cc4', '상담 절차: 입지 투어', 1600, (16, 10)),
  'contact-plan':      ('1517048676732-d65bc937f952', '상담 절차: 제안', 1600, (16, 10)),
  'location-hero':     ('1591875720377-2435bc306b33', '도시 항공 (개원입지 상단)', 2560, (16, 9)),
}

def fetch(uid):
    src = os.path.join(CACHE, uid + '.jpg')
    if os.path.exists(src) and os.path.getsize(src) > 50_000:
        return src
    url = f'https://images.unsplash.com/photo-{uid}?w=2800&q=88&fm=jpg&fit=max'
    subprocess.run(['curl', '-sL', '--retry', '3', '--max-time', '120', '-o', src, url], check=True)
    if os.path.getsize(src) < 50_000:
        raise RuntimeError(f'download failed: {uid}')
    return src

def crop_ratio(im, ratio, anchor='center'):
    if not ratio: return im
    w, h = im.size; rw, rh = ratio
    target = rw / rh
    if w / h > target:
        nw = int(h * target); x = {'left': 0, 'right': w - nw}.get(anchor, (w - nw) // 2); return im.crop((x, 0, x + nw, h))
    nh = int(w / target); y = {'top': 0, 'bottom': h - nh}.get(anchor, (h - nh) // 2); return im.crop((0, y, w, y + nh))

def photo(name, uid, desc, maxw, ratio, anchor='center'):
    im = Image.open(fetch(uid)).convert('RGB')
    if isinstance(anchor, tuple):  # 상대 박스 선크롭 후 비율 크롭
        w, h = im.size; x0, y0, x1, y1 = anchor
        im = im.crop((int(w * x0), int(h * y0), int(w * x1), int(h * y1))); anchor = 'center'
    im = crop_ratio(im, ratio, anchor)
    if im.size[0] > maxw: im = im.resize((maxw, int(im.size[1] * maxw / im.size[0])), Image.LANCZOS)
    out = os.path.join(OUT, f'photo-{name}.jpg'); im.save(out, quality=82, optimize=True, progressive=True)
    return {'file': f'/images/photo-{name}.jpg', 'desc': desc, 'source': f'https://unsplash.com/photos/{uid}', 'size': list(im.size), 'kb': os.path.getsize(out) // 1024}

only = set(sys.argv[1:])
inventory = []
for name, spec in PHOTOS.items():
    if only and name not in only: continue
    uid, desc, maxw, ratio = spec[:4]; anchor = spec[4] if len(spec) > 4 else 'center'
    try:
        item = photo(name, uid, desc, maxw, ratio, anchor); inventory.append(item)
        print(f"ok   {name:20s} {item['size'][0]}x{item['size'][1]} {item['kb']}KB")
    except Exception as e:
        print(f"FAIL {name:20s} {e}")

if not only:
    # 회사소개 건물 콜라주 (PC / 모바일)
    def collage(files, size, gap, out_name):
        w, h = size; n = len(files); cw = (w - gap * (n - 1)) // n
        canvas = Image.new('RGBA', size, (0, 0, 0, 0))
        for i, f in enumerate(files):
            im = Image.open(os.path.join(OUT, f)).convert('RGB'); im = crop_ratio(im, (cw, h)).resize((cw, h), Image.LANCZOS)
            mask = Image.new('L', (cw, h), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, h - 1), radius=24, fill=255)
            canvas.paste(im, (i * (cw + gap), 0), mask)
        canvas.save(os.path.join(OUT, out_name), optimize=True)
        print('ok  ', out_name)
    collage(['photo-building-1.jpg', 'photo-building-2.jpg', 'photo-building-3.jpg'], (2400, 940), 40, 'collage-buildings.png')
    collage(['photo-building-1.jpg', 'photo-building-2.jpg'], (1200, 830), 26, 'collage-buildings-m.png')
    with open(os.path.join(ROOT, 'content', 'images.json'), 'w', encoding='utf-8') as f:
        json.dump({'_comment': 'tools/images.py 가 생성한 사진 목록. 모두 Unsplash 무료 라이선스(상업 이용 가능, 출처 표기 불필요). 원본 캐시: ~/Library/Caches/mediroad-stock', 'items': inventory}, f, ensure_ascii=False, indent=2)
print('done', len(inventory))
