import Link from "next/link";
import { content } from "@/lib/site";
import { Lines } from "@/components/ui/Text";

/** 홈 두 번째 섹션: 브랜드 메시지 (원본 sec_beyond) */
export default function MessageSection() {
  const m = content.message;
  return (
    <section className="main_con sec_beyond">
      <div className="wrap">
        <div className="tit aos">
          <h4 dangerouslySetInnerHTML={{ __html: m.titleEn }} />
        </div>
        <div className="con aos2">
          <h5 dangerouslySetInnerHTML={{ __html: m.headline }} />
          <p><Lines lines={m.body} /></p>
        </div>
        <Link className="link aos" href={m.href}>
          <span>{m.link}</span>
          <i className="xi-long-arrow-right"></i>
        </Link>
      </div>
    </section>
  );
}
