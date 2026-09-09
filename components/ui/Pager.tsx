import Link from "next/link";

export default function Pager({ page, pages, base }: { page: number; pages: number; base: string }) {
  if (pages <= 1) return null;
  const sep = base.includes("?") ? "&" : "?";
  return (
    <div className="mr-pager">
      {Array.from({ length: pages }, (_, i) => i + 1).map((i) =>
        i === page ? <span className="on" key={i}>{i}</span> : <Link key={i} href={`${base}${sep}page=${i}`}>{i}</Link>
      )}
    </div>
  );
}
