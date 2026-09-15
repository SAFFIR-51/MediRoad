import Link from "next/link";
import SubTop from "@/components/layout/SubTop";

export default function NotFound() {
  return (
    <>
      <SubTop en="Not Found" title="페이지를 찾을 수 없습니다" compact />
      <section className="sub_con mr-page sec_white">
        <div className="wrap">
          <div className="mr-gate">
            <h4>삭제되었거나 존재하지 않는 페이지입니다.</h4>
            <p>주소를 다시 확인해 주세요.</p>
            <div className="btns">
              <Link className="mr-btn" href="/">홈으로</Link>
              <Link className="mr-btn line" href="/analysis/">입지 분석 보기</Link>
              <a className="mr-btn line loc-only" href="/location/">매물 정보</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
