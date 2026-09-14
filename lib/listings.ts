/**
 * 매물 데이터 (프론트 전용 단계: content/listings.json 정적 데이터)
 * TODO(서버 연동): 이 파일의 함수 구현만 API 호출로 바꾸면 페이지 코드는 그대로 쓸 수 있다.
 */
import { seedListings } from "@/lib/site";
import type { Listing, ListingType } from "@/lib/listing-utils";

export * from "@/lib/listing-utils";

type Raw = (typeof seedListings)[number];

function toListing(it: Raw): Listing {
  return {
    code: it.id,
    type: (it.type === "sale" ? "sale" : "lease") as ListingType,
    category: it.category,
    title: it.title,
    region: it.region,
    address: it.address ?? "",
    dateListed: it.date,
    deposit: it.deposit ?? "",
    rent: it.rent ?? "",
    area: it.area ?? "",
    floor: it.floor ?? "",
    use: it.use ?? "",
    approvalDate: it.approvalDate ?? "",
    direction: it.direction ?? "",
    parking: it.parking ?? "",
    maintenance: it.maintenance ?? "",
    moveIn: it.moveIn ?? "",
    violation: !!it.violation,
    features: Array.isArray(it.features) ? it.features.map(String) : [],
    images: Array.isArray(it.images) ? it.images.map(String) : [],
    description: it.description ?? "",
    lat: typeof it.lat === "number" ? it.lat : null,
    lng: typeof it.lng === "number" ? it.lng : null,
    isSample: !!it.sample,
    status: "open",
  };
}

const ALL: Listing[] = seedListings.map(toListing).sort((a, b) => (a.dateListed < b.dateListed ? 1 : a.dateListed > b.dateListed ? -1 : 0));

export function allListings(): Listing[] {
  return ALL;
}

export function recentListings(limit = 6): Listing[] {
  return ALL.filter((l) => l.status === "open").slice(0, limit);
}

export function findListing(code: string): Listing | null {
  return ALL.find((l) => l.code === code) ?? null;
}

export function relatedListings(l: Listing, limit = 3): Listing[] {
  return ALL.filter((o) => o.type === l.type && o.code !== l.code && o.status === "open").slice(0, limit);
}
