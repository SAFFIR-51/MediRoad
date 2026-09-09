"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveListingAction } from "@/app/actions/admin";
import type { Listing } from "@/lib/listing-utils";

const CATEGORIES = ["의원", "병원", "약국", "메디컬빌딩", "치과", "한의원", "기타"];

export default function ListingForm({ l }: { l: Listing | null }) {
  const [state, action, pending] = useActionState(saveListingAction, null);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="mr-form wide" style={{ margin: 0, maxWidth: "none" }} encType="multipart/form-data">
      {state?.message && <div className={`mr-flash ${state.ok ? "success" : "error"}`}>{state.message}</div>}
      {l && <input type="hidden" name="id" value={l.id} />}
      <div className="grid2">
        <div className="row"><label>매물번호<i>*</i></label><input type="text" name="code" defaultValue={l?.code ?? ""} placeholder="예: L-2026-010 / S-2026-004" required /></div>
        <div className="row"><label>구분<i>*</i></label>
          <select name="type" defaultValue={l?.type ?? "lease"}><option value="lease">임대·분양</option><option value="sale">병원매매</option></select>
        </div>
      </div>
      <div className="row"><label>제목<i>*</i></label><input type="text" name="title" defaultValue={l?.title ?? ""} required /></div>
      <div className="grid2">
        <div className="row"><label>업종<i>*</i></label><input type="text" name="category" defaultValue={l?.category ?? ""} list="cats" required /><datalist id="cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist></div>
        <div className="row"><label>지역<i>*</i></label><input type="text" name="region" defaultValue={l?.region ?? ""} placeholder="예: 서울 강남구" required /><div className="help">첫 단어(시/도)가 목록 필터의 지역이 됩니다.</div></div>
      </div>
      <div className="row"><label>소재지</label><input type="text" name="address" defaultValue={l?.address ?? ""} placeholder="상세 주소 (회원에게만 표시)" /></div>
      <div className="grid2">
        <div className="row"><label>보증금 / 매매가 / 분양가</label><input type="text" name="deposit" defaultValue={l?.deposit ?? ""} placeholder='예: 1억 5,000만원 / "매매가 12억" / "분양가 8억"' /></div>
        <div className="row"><label>월임대료</label><input type="text" name="rent" defaultValue={l?.rent ?? ""} placeholder="예: 650만원 (없으면 -)" /></div>
      </div>
      <div className="grid2">
        <div className="row"><label>면적</label><input type="text" name="area" defaultValue={l?.area ?? ""} placeholder="예: 45평 (148㎡)" /></div>
        <div className="row"><label>층수</label><input type="text" name="floor" defaultValue={l?.floor ?? ""} placeholder="예: 3층 / 10층" /></div>
      </div>
      <div className="row"><label>특징 (쉼표로 구분)</label><input type="text" name="features" defaultValue={l?.features.join(", ") ?? ""} placeholder="역세권, 주차 가능, 엘리베이터" /></div>
      <div className="row"><label>매물 소개</label><textarea name="description" defaultValue={l?.description ?? ""} /></div>
      <div className="grid2">
        <div className="row"><label>위도 (lat)</label><input type="number" step="any" name="lat" defaultValue={l?.lat ?? ""} placeholder="37.4979" /></div>
        <div className="row"><label>경도 (lng)</label><input type="number" step="any" name="lng" defaultValue={l?.lng ?? ""} placeholder="127.0276" /><div className="help">지도에 핀을 표시하려면 입력 (네이버/구글 지도에서 좌표 확인)</div></div>
      </div>
      <div className="grid2">
        <div className="row"><label>등록일</label><input type="date" name="date_listed" defaultValue={l?.dateListed ?? today} /></div>
        <div className="row"><label>상태</label>
          <select name="status" defaultValue={l?.status ?? "open"}><option value="open">노출</option><option value="closed">거래완료 (표시)</option><option value="hidden">숨김</option></select>
        </div>
      </div>
      <div className="row"><label>정렬 우선순위</label><input type="number" name="sort_order" defaultValue={l?.sortOrder ?? 0} /><div className="help">숫자가 클수록 앞에 표시됩니다.</div></div>
      <div className="row">
        <label>사진 (여러 장 선택 가능, 첫 장이 대표)</label>
        <input type="file" name="images" accept="image/*" multiple />
        {l && l.images.length > 0 && (
          <div className="mr-thumbs">
            {l.images.map((src, i) => (
              <div className="t" key={src + i}><img src={src} alt="" /><label><input type="checkbox" name="keep_images" value={src} defaultChecked /> 유지</label></div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10 }}>
        <button className="btn" type="submit" disabled={pending}>{l ? "수정 저장" : "등록"}</button>
        <Link className="mr-btn line" href="/admin/listings">목록</Link>
      </div>
    </form>
  );
}
