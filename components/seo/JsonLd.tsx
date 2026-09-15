/** 검색엔진용 구조화 데이터 (schema.org JSON-LD). `<` 를 이스케이프해 스크립트 주입을 막는다. */
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
