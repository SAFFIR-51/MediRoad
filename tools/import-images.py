#!/usr/bin/env python3
"""
AI 생성 이미지 반영기 (docs/이미지_제작_목록.md 의 파일명 기준)
 - images_src/<이름>.png|jpg|webp 를 목표 비율로 가운데(또는 지정 초점) 크롭 → 리사이즈 → public/images/<이름>.jpg (JPEG q82, 점진적)
 - og-bg 가 있으면 로고·문구를 합성해 public/brand/og.png (1200×630) 를 만든다
 - content/images.json 목록을 새로 쓴다
실행: python3 tools/import-images.py            (images_src 에 있는 파일 전부)
      python3 tools/import-images.py hero-01    (특정 이름만)
원본이 목표 크기보다 작으면 늘리지 않고 원본 크기 그대로 비율만 맞춘다 (경고 출력).
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'images_src')
OUT = os.path.join(ROOT, 'public', 'images')
EXTS = ('.png', '.jpg', '.jpeg', '.webp')

# 이름 → (가로, 세로, 설명, 초점 x, 초점 y)  초점은 0~1 (크롭할 때 남길 중심)
SPEC = {
    'hero-01': (2560, 1440, '홈 히어로 1 (반경 분석 보드가 오른쪽에 겹침)', 0.5, 0.5),
    'hero-02': (2560, 1440, '홈 히어로 2 (리포트 보드가 오른쪽에 겹침)', 0.5, 0.5),
    'sub-about': (2560, 1440, '서브 비주얼: 회사소개·인사말·오시는 길', 0.5, 0.5),
    'sub-analysis': (2560, 1440, '서브 비주얼: 입지 분석', 0.5, 0.5),
    'sub-support': (2560, 1440, '서브 비주얼: 개원 지원', 0.5, 0.5),
    'sub-location': (2560, 1440, '서브 비주얼: 매물 정보', 0.5, 0.5),
    'sub-contact': (2560, 1440, '서브 비주얼: 상담신청·회원·약관', 0.5, 0.5),
    'sub-mobile': (1181, 1575, '서브 비주얼 모바일 공통', 0.5, 0.4),
    'menu-bg': (1920, 1080, '전체메뉴 배경 (PC)', 0.5, 0.5),
    'menu-bg-m': (1080, 1920, '전체메뉴 배경 (모바일)', 0.5, 0.5),
    'bg-dark-lines': (1920, 1080, '어두운 섹션 배경 (매물 목록·핵심 서비스·입지 데이터)', 0.5, 0.5),
    'bg-dark': (1920, 1080, '하단 상담 안내 띠 배경', 0.5, 0.5),
    'bg-light-wave': (1920, 1080, '분야별 페이지 소개 영역 배경', 0.5, 0.5),
    # 분야 사진은 홈(세로에 가까운 패널)·소개 목록·상세(4:3)에서 cover 로 잘려 쓰이므로 3:2 로 넉넉히 둔다
    'field-clinic': (2400, 1600, '분야: 병·의원 개원 입지 분석', 0.5, 0.5),
    'field-pharmacy': (2400, 1600, '분야: 약국 개국 입지 분석', 0.5, 0.5),
    'field-transfer': (2400, 1600, '분야: 병원 양수·양도 분석', 0.5, 0.5),
    'field-licensing': (2400, 1600, '분야: 인증·개설·허가 지원', 0.5, 0.5),
    'field-marketing': (2400, 1600, '분야: 병·의원 경영마케팅', 0.5, 0.5),
    'field-closure': (2400, 1600, '분야: 폐업 정리 지원', 0.5, 0.5),
    'about-building': (1600, 1200, '회사소개 슬로건 사진', 0.5, 0.5),
    'contact-bg': (2400, 1200, '홈 상담 안내 배경 · 상담신청 폼 옆 사진', 0.5, 0.5),
    'step-01': (1600, 1000, '상담 절차 01', 0.5, 0.5),
    'step-02': (1600, 1000, '상담 절차 02', 0.5, 0.5),
    'step-03': (1600, 1000, '상담 절차 03', 0.5, 0.5),
}
KEY_SIZE = (1600, 1000)  # 핵심 서비스 카드 key-* (16:10)


def spec_for(name):
    if name in SPEC:
        return SPEC[name]
    if name.startswith('key-'):
        return (*KEY_SIZE, f'핵심 서비스 카드: {name[4:]}', 0.5, 0.5)
    return None


def crop_to(img, w, h, fx, fy):
    """목표 비율로 초점 기준 크롭 후 리사이즈 (원본이 작으면 확대하지 않음)"""
    sw, sh = img.size
    target = w / h
    if sw / sh > target:
        cw, ch = round(sh * target), sh
    else:
        cw, ch = sw, round(sw / target)
    x0 = min(max(round(sw * fx - cw / 2), 0), sw - cw)
    y0 = min(max(round(sh * fy - ch / 2), 0), sh - ch)
    img = img.crop((x0, y0, x0 + cw, y0 + ch))
    if cw > w:
        img = img.resize((w, h), Image.LANCZOS)
    return img


def load(path):
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)
    if img.mode in ('RGBA', 'LA', 'P'):
        bg = Image.new('RGB', img.size, (11, 37, 69))
        img = img.convert('RGBA')
        bg.paste(img, mask=img.split()[-1])
        return bg
    return img.convert('RGB')


def font(size):
    for p in ('/System/Library/Fonts/AppleSDGothicNeo.ttc', '/Library/Fonts/NanumGothicBold.ttf', '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf'):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size, index=6 if p.endswith('.ttc') else 0)
            except Exception:
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
    return None


def make_og(path):
    """og-bg → public/brand/og.png : 어둡게 깐 배경 + 흰 로고 + 한 줄 문구"""
    img = crop_to(load(path), 1200, 630, 0.5, 0.5).resize((1200, 630), Image.LANCZOS)
    shade = Image.new('RGB', img.size, (7, 22, 42))
    img = Image.blend(img, shade, 0.45)
    logo_path = os.path.join(ROOT, 'public', 'brand', 'logo-white.png')
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert('RGBA')
        lw = 520
        logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
        img.paste(logo, ((1200 - lw) // 2, 230 - logo.height // 2), logo)
    f = font(40)
    if f:
        d = ImageDraw.Draw(img)
        text = '병·의원 개원 입지 분석, 데이터로 먼저 확인하세요'
        tw = d.textlength(text, font=f)
        d.text(((1200 - tw) / 2, 380), text, font=f, fill=(255, 255, 255))
    out = os.path.join(ROOT, 'public', 'brand', 'og.png')
    img.save(out, 'PNG', optimize=True)
    print(f'✓ og-bg → public/brand/og.png')


def main():
    if not os.path.isdir(SRC):
        sys.exit(f'images_src 폴더가 없습니다: {SRC}')
    only = set(sys.argv[1:])
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(EXTS))
    done, skipped = 0, []
    for f in files:
        name = os.path.splitext(f)[0].strip()
        if only and name not in only:
            continue
        path = os.path.join(SRC, f)
        if name == 'og-bg':
            make_og(path)
            continue
        spec = spec_for(name)
        if not spec:
            skipped.append(f)
            continue
        w, h, _desc, fx, fy = spec
        img = load(path)
        out_img = crop_to(img, w, h, fx, fy)
        if out_img.size[0] < w:
            print(f'  ! {f}: 원본이 작아 {out_img.size[0]}×{out_img.size[1]} 로 저장 (목표 {w}×{h})')
        out = os.path.join(OUT, f'{name}.jpg')
        out_img.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
        print(f'✓ {f} → public/images/{name}.jpg ({out_img.size[0]}×{out_img.size[1]}, {os.path.getsize(out) // 1024}KB)')
        done += 1
    if skipped:
        print('\n알 수 없는 파일명 (문서의 파일명과 다름, 건너뜀):', ', '.join(skipped))

    # 목록 갱신: 문서 기준 이름 중 public/images 에 있는 것
    names = list(SPEC) + sorted({os.path.splitext(x)[0] for x in os.listdir(OUT) if x.startswith('key-') and x.endswith('.jpg')})
    items = []
    for n in names:
        p = os.path.join(OUT, f'{n}.jpg')
        if not os.path.exists(p):
            continue
        with Image.open(p) as im:
            size = list(im.size)
        src = next((x for x in files if os.path.splitext(x)[0] == n), None)
        items.append({'file': f'/images/{n}.jpg', 'desc': spec_for(n)[2], 'source': f'images_src/{src} (AI 생성)' if src else '임시 사진 (AI 이미지 반영 전)', 'size': size, 'kb': os.path.getsize(p) // 1024})
    with open(os.path.join(ROOT, 'content', 'images.json'), 'w', encoding='utf-8') as fp:
        json.dump({'_comment': 'tools/import-images.py 가 생성한 사이트 이미지 목록. 파일명·용도는 docs/이미지_제작_목록.md. 매물 데모 사진(photo-listing-*)은 제외.', 'items': items}, fp, ensure_ascii=False, indent=2)
    print(f'\n{done}장 반영 · content/images.json 갱신 ({len(items)}개)')


if __name__ == '__main__':
    main()
