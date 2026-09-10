import { site } from "@/lib/site";

export default function Footer() {
  const c = site.company;
  return (
    <footer className="footer">
      <div className="container">
        <img src={site.brand.logo.white} alt={site.brand.name} />
        <div className="addr">
          <ul>
            <li>{c.name}</li>
            <li><dl><dt>주소</dt><dd><address>{c.address}</address></dd></dl></li>
            <li><dl><dt>대표</dt><dd>{c.ceo}</dd></dl></li>
            <li><dl><dt>사업자등록번호</dt><dd>{c.bizNo}</dd></dl></li>
            <li><dl><dt>TEL</dt><dd><a href={`tel:${c.tel}`}>{c.tel}</a></dd></dl></li>
            <li><dl><dt>FAX</dt><dd>{c.fax}</dd></dl></li>
            <li><dl><dt>E-mail</dt><dd>{c.email}</dd></dl></li>
          </ul>
        </div>
        <p className="copy">COPYRIGHT &copy; <b>{site.brand.copyright}</b> ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
