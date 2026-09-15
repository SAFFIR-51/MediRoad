"use client";

/**
 * 매물 등록 · 수정 폼.
 * 인터넷 표시·광고 명시사항(공인중개사법 시행령 제17조의2): 소재지·면적·가격·용도·거래형태·층수·사용승인일·방향·주차·관리비·입주가능일은 필수.
 * 가격은 만원 단위 숫자로만 받아 "협의"만 적을 수 없게 한다 (보조 문구는 가격 참고란에).
 * 서버(api/admin/listing-save.php)가 같은 규칙으로 다시 검사하고, 필드별 오류를 돌려주면 해당 칸 아래에 표시한다.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { resizeImage } from "@/lib/image-resize";
import {
  CATEGORY_OPTIONS, DEAL_TYPES, DIRECTION_OPTIONS, MOVEIN_OPTIONS, USE_OPTIONS, STATUS_LABEL,
  fmtManwon, pyeong, type DealType, type Listing, type ListingStatus,
} from "@/lib/listing-utils";

type Form = {
  dealType: DealType; category: string; title: string; region: string; address: string;
  depositManwon: string; rentManwon: string; salePriceManwon: string; priceNote: string;
  areaM2: string; floorCurrent: string; floorTotal: string; useType: string; approvalDate: string; direction: string;
  parking: string; maintenanceManwon: string; moveIn: string; violation: boolean;
  features: string; description: string; images: string[]; lat: string; lng: string; status: ListingStatus;
};

const EMPTY: Form = {
  dealType: "임대", category: "의원", title: "", region: "", address: "",
  depositManwon: "", rentManwon: "", salePriceManwon: "", priceNote: "",
  areaM2: "", floorCurrent: "", floorTotal: "", useType: "", approvalDate: "", direction: "",
  parking: "", maintenanceManwon: "", moveIn: "", violation: false,
  features: "", description: "", images: [], lat: "", lng: "", status: "open",
};

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(/,/g, "")));

function fromListing(l: Listing): Form {
  return {
    dealType: l.dealType, category: l.category, title: l.title, region: l.region, address: l.address,
    depositManwon: str(l.depositManwon), rentManwon: str(l.rentManwon), salePriceManwon: str(l.salePriceManwon), priceNote: l.priceNote ?? "",
    areaM2: str(l.areaM2), floorCurrent: l.floorCurrent ?? "", floorTotal: str(l.floorTotal), useType: l.useType ?? "", approvalDate: (l.approvalDate ?? "").slice(0, 10),
    direction: l.direction ?? "", parking: str(l.parking), maintenanceManwon: str(l.maintenanceManwon), moveIn: l.moveIn ?? "", violation: !!l.violation,
    features: (l.features ?? []).join(", "), description: l.description ?? "", images: l.images ?? [], lat: str(l.lat), lng: str(l.lng), status: l.status,
  };
}

export default function ListingForm() {
  const router = useRouter();
  const id = Number(useSearchParams().get("id")) || 0;
  const [f, setF] = useState<Form>(EMPTY);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    api<{ item: Listing }>(`admin/listing.php?id=${id}`)
      .then((r) => { setF(fromListing(r.item)); setCode(r.item.code); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const input = (k: keyof Form) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
    "aria-invalid": errors[k] ? true : undefined,
  });
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="err">{errors[k]}</p> : null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading({ done: 0, total: list.length });
    setError("");
    for (const file of list) {
      try {
        const blob = await resizeImage(file);
        const fd = new FormData();
        fd.append("file", blob, file.name.replace(/\.\w+$/, "") + ".jpg");
        const r = await api<{ path: string }>("admin/upload.php", { form: fd });
        setF((prev) => ({ ...prev, images: [...prev.images, r.path] }));
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`);
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const move = (i: number, d: -1 | 1) => setF((prev) => {
    const images = [...prev.images];
    const j = i + d;
    if (j < 0 || j >= images.length) return prev;
    [images[i], images[j]] = [images[j], images[i]];
    return { ...prev, images };
  });
  const removeImage = (i: number) => setF((prev) => ({ ...prev, images: prev.images.filter((_, x) => x !== i) }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setErrors({});
    const body = {
      ...(id ? { id } : {}),
      dealType: f.dealType, category: f.category.trim(), title: f.title.trim(), region: f.region.trim(), address: f.address.trim(),
      depositManwon: num(f.depositManwon), rentManwon: num(f.rentManwon), salePriceManwon: num(f.salePriceManwon), priceNote: f.priceNote.trim(),
      areaM2: num(f.areaM2), floorCurrent: f.floorCurrent.trim(), floorTotal: num(f.floorTotal), useType: f.useType.trim(), approvalDate: f.approvalDate,
      direction: f.direction.trim(), parking: num(f.parking), maintenanceManwon: num(f.maintenanceManwon), moveIn: f.moveIn.trim(), violation: f.violation,
      features: f.features.split(",").map((s) => s.trim()).filter(Boolean), description: f.description.trim(), images: f.images,
      lat: num(f.lat), lng: num(f.lng), status: f.status,
    };
    try {
      await api<{ id: number; code: string }>("admin/listing-save.php", { body });
      router.push(`/admin/listings/?saved=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors ? "입력값을 확인해 주세요. 표시된 항목을 고친 뒤 다시 저장하세요." : err.message);
        setErrors(err.errors ?? {});
        requestAnimationFrame(() => document.querySelector('[aria-invalid="true"], .adm-form .mr-flash')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      } else setError("저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="adm-loading">매물 정보를 불러오는 중…</div>;

  const lease = f.dealType === "임대";
  const areaNum = Number(f.areaM2);

  return (
    <form className="adm-form" onSubmit={save} noValidate>
      <div className="adm-head">
        <div>
          <h3>{id ? `매물 수정 ${code ? `· ${code}` : ""}` : "매물 등록"}</h3>
          <p><b>*</b> 표시는 인터넷 표시·광고 명시사항(공인중개사법)이라 반드시 입력해야 합니다.</p>
        </div>
        <div className="btns"><Link className="mr-btn line" href="/admin/listings/">목록으로</Link></div>
      </div>
      {error ? <div className="mr-flash error" role="alert">{error}</div> : null}

      <fieldset>
        <legend>기본 정보</legend>
        <div className="g3">
          <div className="row"><label>거래형태<i>*</i></label>
            <div className="seg">{DEAL_TYPES.map((d) => <button key={d} type="button" className={f.dealType === d ? "on" : ""} onClick={() => set("dealType", d)}>{d}</button>)}</div>
            <Err k="dealType" />
          </div>
          <div className="row"><label htmlFor="lf-cat">업종<i>*</i></label>
            <input id="lf-cat" list="lf-cat-list" {...input("category")} placeholder="의원 · 치과 · 약국 등" />
            <datalist id="lf-cat-list">{CATEGORY_OPTIONS.map((c) => <option key={c} value={c} />)}</datalist>
            <Err k="category" />
          </div>
          <div className="row"><label htmlFor="lf-status">노출 상태</label>
            <select id="lf-status" {...input("status")}>{(["open", "hidden", "closed"] as ListingStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
          </div>
        </div>
        <div className="row"><label htmlFor="lf-title">제목<i>*</i></label><input id="lf-title" {...input("title")} maxLength={80} placeholder="예) 마곡나루역 도보 3분 메디컬빌딩 3층" /><Err k="title" /></div>
        <div className="g2">
          <div className="row"><label htmlFor="lf-region">지역<i>*</i></label><input id="lf-region" {...input("region")} maxLength={40} placeholder="예) 서울 강서구" /><p className="help">첫 단어(서울·경기 등)가 목록의 지역 필터가 됩니다.</p><Err k="region" /></div>
          <div className="row"><label htmlFor="lf-addr">소재지(주소)<i>*</i></label><input id="lf-addr" {...input("address")} maxLength={200} placeholder="건축물대장 기준 주소" /><Err k="address" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend>가격 <small>(만원 단위 숫자)</small></legend>
        <div className="g3">
          <div className="row"><label htmlFor="lf-dep">보증금{lease ? <i>*</i> : null}</label><input id="lf-dep" type="number" min={0} inputMode="numeric" {...input("depositManwon")} /><p className="help">{fmtManwon(num(f.depositManwon))}</p><Err k="depositManwon" /></div>
          <div className="row"><label htmlFor="lf-rent">월세{lease ? <i>*</i> : null}</label><input id="lf-rent" type="number" min={0} inputMode="numeric" {...input("rentManwon")} /><p className="help">{f.rentManwon ? `월 ${fmtManwon(num(f.rentManwon))}` : ""}</p><Err k="rentManwon" /></div>
          <div className="row"><label htmlFor="lf-sale">{f.dealType === "분양" ? "분양가" : "매매가"}{!lease ? <i>*</i> : null}</label><input id="lf-sale" type="number" min={0} inputMode="numeric" {...input("salePriceManwon")} disabled={lease} /><p className="help">{lease ? "임대 매물은 입력하지 않습니다" : fmtManwon(num(f.salePriceManwon))}</p><Err k="salePriceManwon" /></div>
        </div>
        <div className="row"><label htmlFor="lf-note">가격 참고</label><input id="lf-note" {...input("priceNote")} maxLength={100} placeholder="예) 권리금 별도 · 렌트프리 2개월 협의 가능" /><p className="help">금액 칸을 대신할 수 없습니다. 보조 설명만 적어 주세요.</p><Err k="priceNote" /></div>
      </fieldset>

      <fieldset>
        <legend>건물 정보 <small>(명시사항)</small></legend>
        <div className="g3">
          <div className="row"><label htmlFor="lf-area">전용면적(㎡)<i>*</i></label><input id="lf-area" type="number" min={0} step="0.01" inputMode="decimal" {...input("areaM2")} /><p className="help">{areaNum > 0 ? `약 ${pyeong(areaNum)}평` : ""}</p><Err k="areaM2" /></div>
          <div className="row"><label htmlFor="lf-fc">해당층<i>*</i></label><input id="lf-fc" {...input("floorCurrent")} maxLength={10} placeholder="예) 3 · 지하는 B1" /><Err k="floorCurrent" /></div>
          <div className="row"><label htmlFor="lf-ft">총층<i>*</i></label><input id="lf-ft" type="number" min={1} inputMode="numeric" {...input("floorTotal")} /><Err k="floorTotal" /></div>
        </div>
        <div className="g3">
          <div className="row"><label htmlFor="lf-use">건축물 용도<i>*</i></label><input id="lf-use" list="lf-use-list" {...input("useType")} maxLength={50} /><datalist id="lf-use-list">{USE_OPTIONS.map((u) => <option key={u} value={u} />)}</datalist><Err k="useType" /></div>
          <div className="row"><label htmlFor="lf-appr">사용승인일<i>*</i></label><input id="lf-appr" type="date" {...input("approvalDate")} /><Err k="approvalDate" /></div>
          <div className="row"><label htmlFor="lf-dir">방향<i>*</i></label><input id="lf-dir" list="lf-dir-list" {...input("direction")} maxLength={30} placeholder="예) 남향 (주출입구 기준)" /><datalist id="lf-dir-list">{DIRECTION_OPTIONS.map((d) => <option key={d} value={`${d} (주출입구 기준)`} />)}</datalist><Err k="direction" /></div>
        </div>
        <div className="g3">
          <div className="row"><label htmlFor="lf-park">주차대수<i>*</i></label><input id="lf-park" type="number" min={0} inputMode="numeric" {...input("parking")} /><p className="help">건축물대장 기준 · 주차 불가는 0</p><Err k="parking" /></div>
          <div className="row"><label htmlFor="lf-mnt">관리비(월, 만원)<i>*</i></label><input id="lf-mnt" type="number" min={0} inputMode="numeric" {...input("maintenanceManwon")} /><p className="help">{f.maintenanceManwon === "0" ? "없음" : f.maintenanceManwon ? `월 ${fmtManwon(num(f.maintenanceManwon))}` : "없으면 0"}</p><Err k="maintenanceManwon" /></div>
          <div className="row"><label htmlFor="lf-move">입주가능일<i>*</i></label><input id="lf-move" list="lf-move-list" {...input("moveIn")} maxLength={30} placeholder="즉시 입주 · 2026-11-01 등" /><datalist id="lf-move-list">{MOVEIN_OPTIONS.map((m) => <option key={m} value={m} />)}</datalist><Err k="moveIn" /></div>
        </div>
        <label className="check"><input type="checkbox" checked={f.violation} onChange={(e) => set("violation", e.target.checked)} /> 건축물대장에 위반건축물로 기재되어 있음</label>
      </fieldset>

      <fieldset>
        <legend>소개 · 사진</legend>
        <div className="row"><label htmlFor="lf-feat">특징 태그</label><input id="lf-feat" {...input("features")} placeholder="쉼표로 구분: 역세권, 엘리베이터 2대, 병원 다수 입점" />
          {f.features ? <div className="chips">{f.features.split(",").map((s) => s.trim()).filter(Boolean).map((t) => <span key={t}>{t}</span>)}</div> : null}
        </div>
        <div className="row"><label htmlFor="lf-desc">상세 설명</label><textarea id="lf-desc" {...input("description")} maxLength={3000} rows={6} /><Err k="description" /></div>

        <div className="row">
          <label>사진 <small>(첫 번째 사진이 대표 사진)</small></label>
          <div className="adm-photos">
            {f.images.map((src, i) => (
              <div className="ph" key={src + i}>
                <img src={src} alt="" />
                {i === 0 ? <em>대표</em> : null}
                <div className="ctl">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="앞으로">◀</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === f.images.length - 1} aria-label="뒤로">▶</button>
                  <button type="button" onClick={() => removeImage(i)} aria-label="사진 빼기" className="x">✕</button>
                </div>
              </div>
            ))}
            <label className={`add${uploading ? " busy" : ""}`}>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => onFiles(e.target.files)} disabled={!!uploading} />
              <i className="xi-plus"></i>
              <span>{uploading ? `올리는 중 ${uploading.done}/${uploading.total}` : "사진 추가"}</span>
            </label>
          </div>
          <p className="help">JPG · PNG · WEBP, 여러 장 선택 가능. 긴 변 1600px로 줄여 저장합니다. 빼기(✕)한 사진은 저장해야 반영됩니다.</p>
        </div>

        <div className="g2">
          <div className="row"><label htmlFor="lf-lat">위도 (선택)</label><input id="lf-lat" type="number" step="0.000001" {...input("lat")} /></div>
          <div className="row"><label htmlFor="lf-lng">경도 (선택)</label><input id="lf-lng" type="number" step="0.000001" {...input("lng")} /></div>
        </div>
      </fieldset>

      <div className="adm-submit">
        <Link className="mr-btn line" href="/admin/listings/">취소</Link>
        <button className="mr-btn" type="submit" disabled={saving || !!uploading}>{saving ? "저장 중…" : id ? "수정 저장" : "매물 등록"}</button>
      </div>
    </form>
  );
}
